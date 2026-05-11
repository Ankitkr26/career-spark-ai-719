import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
const InputSchema = z.object({
    resumeId: z.string().min(1),
    rawText: z.string().min(20).max(60000),
    token: z.string().optional(),
});
const AnalysisSchema = z.object({
    ats_score: z.number().int().min(0).max(100),
    summary: z.string().max(800),
    skills: z.array(z.string().min(1).max(60)).max(60),
    missing_skills: z.array(z.string().min(1).max(60)).max(30),
    suggestions: z.array(z.string().min(1).max(400)).max(15),
    experience: z
        .array(z.object({
        title: z.string().max(120),
        company: z.string().max(120),
        duration: z.string().max(80).optional().default(""),
        highlights: z.array(z.string().max(300)).max(8).optional().default([]),
    }))
        .max(20),
    education: z
        .array(z.object({
        degree: z.string().max(160),
        institution: z.string().max(160),
        year: z.string().max(40).optional().default(""),
    }))
        .max(15),
});
export const analyzeResume = createServerFn({ method: "POST" })
    .inputValidator((input) => InputSchema.parse(input))
    .handler(async ({ data }) => {
    // Backend API base (Django)
    const API_BASE = process.env.VITE_API_BASE_URL || process.env.API_BASE || "http://127.0.0.1:8000";
    const token = data.token;
    if (!token) {
        throw new Error("Unauthorized: no token provided");
    }

    // Delegate analysis to the Django backend which holds the GEMINI key.
    // The backend will update resume status and persist analysis.
    let resp;
    try {
        resp = await fetch(`${API_BASE}/api/resumes/${data.resumeId}/analyze/`, {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw_text: data.rawText.slice(0, 60000) }),
        });
    }
    catch (e) {
        // network error
        throw new Error("AI analysis request failed");
    }

    if (!resp.ok) {
        const t = await resp.text().catch(() => resp.statusText);
        if (resp.status === 429)
            throw new Error("Rate limit exceeded. Please try again shortly.");
        if (resp.status === 402)
            throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
        throw new Error(t || "AI analysis failed");
    }

    const payload = await resp.json();
    // backend returns { ok: true, analysis: { ... } }
    const parsed = AnalysisSchema.parse(payload.analysis);

    return { ok: true, analysis: parsed };
});
