import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  resumeId: z.string().uuid(),
  rawText: z.string().min(20).max(60000),
});

const AnalysisSchema = z.object({
  ats_score: z.number().int().min(0).max(100),
  summary: z.string().max(800),
  skills: z.array(z.string().min(1).max(60)).max(60),
  missing_skills: z.array(z.string().min(1).max(60)).max(30),
  suggestions: z.array(z.string().min(1).max(400)).max(15),
  experience: z
    .array(
      z.object({
        title: z.string().max(120),
        company: z.string().max(120),
        duration: z.string().max(80).optional().default(""),
        highlights: z.array(z.string().max(300)).max(8).optional().default([]),
      }),
    )
    .max(20),
  education: z
    .array(
      z.object({
        degree: z.string().max(160),
        institution: z.string().max(160),
        year: z.string().max(40).optional().default(""),
      }),
    )
    .max(15),
});

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Confirm the resume belongs to the caller (RLS also enforces this)
    const { data: existing, error: fetchErr } = await supabase
      .from("resumes")
      .select("id,user_id")
      .eq("id", data.resumeId)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!existing || existing.user_id !== userId) {
      throw new Error("Resume not found");
    }

    await supabase
      .from("resumes")
      .update({ status: "analyzing", raw_text: data.rawText })
      .eq("id", data.resumeId);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) and senior technical recruiter.
Analyze the candidate's resume and produce a strict JSON analysis using the provided tool.
- ats_score: 0-100. Penalize missing contact info, no quantified impact, weak action verbs, walls of text, no skills section, irrelevant content.
- skills: concrete technologies, tools, frameworks, languages and methodologies the candidate clearly demonstrates.
- missing_skills: high-demand skills the resume should include for stronger market positioning (think: cloud, testing, system design, data, leadership for senior roles).
- suggestions: specific, actionable improvements (rewriting bullets with metrics, restructuring sections, ATS keyword fixes, formatting).
- experience and education: extract structured entries.
Be concise and concrete.`;

    const tool = {
      type: "function",
      function: {
        name: "submit_resume_analysis",
        description: "Submit the structured ATS analysis of the resume.",
        parameters: {
          type: "object",
          properties: {
            ats_score: { type: "integer", minimum: 0, maximum: 100 },
            summary: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            missing_skills: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  company: { type: "string" },
                  duration: { type: "string" },
                  highlights: { type: "array", items: { type: "string" } },
                },
                required: ["title", "company"],
                additionalProperties: false,
              },
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  degree: { type: "string" },
                  institution: { type: "string" },
                  year: { type: "string" },
                },
                required: ["degree", "institution"],
                additionalProperties: false,
              },
            },
          },
          required: [
            "ats_score",
            "summary",
            "skills",
            "missing_skills",
            "suggestions",
            "experience",
            "education",
          ],
          additionalProperties: false,
        },
      },
    } as const;

    let resp: Response;
    try {
      resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze this resume:\n\n${data.rawText}`,
            },
          ],
          tools: [tool],
          tool_choice: {
            type: "function",
            function: { name: "submit_resume_analysis" },
          },
        }),
      });
    } catch (e) {
      await supabase
        .from("resumes")
        .update({ status: "failed" })
        .eq("id", data.resumeId);
      throw new Error("AI gateway unreachable");
    }

    if (!resp.ok) {
      await supabase
        .from("resumes")
        .update({ status: "failed" })
        .eq("id", data.resumeId);
      if (resp.status === 429)
        throw new Error("Rate limit exceeded. Please try again shortly.");
      if (resp.status === 402)
        throw new Error(
          "AI credits exhausted. Add credits in Settings → Workspace → Usage.",
        );
      const t = await resp.text().catch(() => "");
      console.error("AI gateway error", resp.status, t);
      throw new Error("AI analysis failed");
    }

    const payload = (await resp.json()) as {
      choices?: Array<{
        message?: {
          tool_calls?: Array<{
            function?: { name?: string; arguments?: string };
          }>;
        };
      }>;
    };

    const args =
      payload.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      await supabase
        .from("resumes")
        .update({ status: "failed" })
        .eq("id", data.resumeId);
      throw new Error("AI returned no analysis");
    }

    let parsed: z.infer<typeof AnalysisSchema>;
    try {
      parsed = AnalysisSchema.parse(JSON.parse(args));
    } catch (e) {
      console.error("Analysis parse failed", e);
      await supabase
        .from("resumes")
        .update({ status: "failed" })
        .eq("id", data.resumeId);
      throw new Error("AI analysis was malformed");
    }

    const { error: updErr } = await supabase
      .from("resumes")
      .update({
        status: "analyzed",
        ats_score: parsed.ats_score,
        summary: parsed.summary,
        skills: parsed.skills,
        missing_skills: parsed.missing_skills,
        suggestions: parsed.suggestions,
        experience: parsed.experience,
        education: parsed.education,
      })
      .eq("id", data.resumeId);
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const, analysis: parsed };
  });