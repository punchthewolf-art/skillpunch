import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are an expert HR analyst and career coach with 20 years of experience in talent assessment, skills mapping, and job market analysis. You analyze CVs/resumes with extreme precision.

When given a CV text, you must analyze it and return a JSON object (and ONLY a JSON object, no markdown, no code blocks) with this exact structure:

{
  "employabilityScore": <number 0-100>,
  "skills": [
    {
      "name": "<skill name>",
      "category": "<Technical|Soft Skills|Management|Communication|Creative|Analytical|Domain Expertise>",
      "demand": "<high|medium|low>",
      "value": <number 0-100 representing proficiency level>
    }
  ],
  "topSkills": ["<top skill 1>", "<top skill 2>", "<top skill 3>", "<top skill 4>", "<top skill 5>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "prediction": "<A 2-3 sentence career prediction based on the CV>",
  "salaryEstimate": "<salary range estimate based on skills and experience>",
  "formations": ["<recommended formation/course 1>", "<recommended formation/course 2>", "<recommended formation/course 3>"],
  "marketComparison": "<A brief comparison of how this profile compares to the current job market>"
}

Rules:
- Identify between 6-12 skills from the CV
- Score skills realistically based on evidence in the CV
- The employability score should reflect overall marketability
- Gaps should identify missing but important skills for the person's field
- Be honest but constructive
- Demand should reflect current 2025 job market trends
- Return ONLY valid JSON, no additional text`;

export async function POST(request: NextRequest) {
  try {
    let cvText = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Read PDF as text (basic extraction from buffer)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract text from PDF by looking for text streams
      const pdfText = buffer.toString("utf-8");
      // Simple text extraction: find readable text between PDF markers
      const textParts: string[] = [];
      const regex = /\(([^)]+)\)/g;
      let match;
      while ((match = regex.exec(pdfText)) !== null) {
        const text = match[1].trim();
        if (text.length > 1 && /[a-zA-Z]/.test(text)) {
          textParts.push(text);
        }
      }

      // Also try to extract from text streams
      const streamRegex = /BT[\s\S]*?ET/g;
      let streamMatch;
      while ((streamMatch = streamRegex.exec(pdfText)) !== null) {
        const tjRegex = /\[([^\]]*)\]\s*TJ|<([^>]*)>\s*Tj|\(([^)]*)\)\s*Tj/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(streamMatch[0])) !== null) {
          const text = (tjMatch[1] || tjMatch[2] || tjMatch[3] || "").trim();
          if (text.length > 0) {
            textParts.push(text);
          }
        }
      }

      cvText = textParts.join(" ").trim();

      // Fallback: if we couldn't extract much text, use the raw readable content
      if (cvText.length < 50) {
        cvText = pdfText
          .replace(/[^\x20-\x7E\n\r\t\u00C0-\u024F]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      if (!cvText || cvText.length < 20) {
        return NextResponse.json(
          { error: "Could not extract text from PDF. Please paste your CV text instead." },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      cvText = body.text;

      if (!cvText || cvText.trim().length < 20) {
        return NextResponse.json(
          { error: "Please provide more CV text (at least 20 characters)" },
          { status: 400 }
        );
      }
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Analyze this CV and return the JSON analysis:\n\n${cvText.slice(0, 8000)}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON from Claude's response
    let analysisData;
    try {
      // Try to extract JSON if it's wrapped in code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      analysisData = JSON.parse(jsonStr);
    } catch {
      // Fallback: try to find JSON object in the response
      const objectMatch = responseText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          analysisData = JSON.parse(objectMatch[0]);
        } catch {
          return NextResponse.json(
            { error: "Failed to parse analysis results" },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Failed to parse analysis results" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis" },
      { status: 500 }
    );
  }
}
