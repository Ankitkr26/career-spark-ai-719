// Client-side text extraction for PDF and DOCX resumes.
// Heavy libs are dynamically imported so they don't bloat the main bundle.
export async function extractResumeText(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
        return extractPdf(file);
    }
    if (name.endsWith(".docx") ||
        file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        return extractDocx(file);
    }
    if (name.endsWith(".txt") || file.type.startsWith("text/")) {
        return await file.text();
    }
    throw new Error("Unsupported file type. Upload a PDF, DOCX, or TXT resume.");
}
async function extractPdf(file) {
    const pdfjs = (await import("pdfjs-dist"));
    // Use the bundled worker as a URL string.
    const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    let out = "";
    const max = Math.min(doc.numPages, 15);
    for (let i = 1; i <= max; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((it) => {
            const item = it;
            return item.str ?? "";
        })
            .join(" ");
        out += pageText + "\n\n";
    }
    return out.trim();
}
async function extractDocx(file) {
    const mammoth = (await import(
    /* @vite-ignore */ "mammoth/mammoth.browser.js"));
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value.trim();
}
