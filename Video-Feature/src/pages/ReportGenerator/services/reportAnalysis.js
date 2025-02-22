import { HfInference } from "@huggingface/inference";

const hf = new HfInference("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");
const MODEL_ID = "google/gemma-2-27b-it";

export const generateTranscriptAnalysis = async (transcript) => {
  const prompt = `
    Analyze this educational discussion transcript and create a detailed report with the following sections:
    1. Executive Summary (2-3 paragraphs)
    2. Key Discussion Points (bullet points)
    3. Main Challenges Identified
    4. Proposed Solutions
    5. Action Items
    6. Recommendations for Follow-up
    7. Progress Metrics
    8. Future Development Roadmap

    Transcript:
    ${transcript}

    Format the response in markdown with clear sections and bullet points where appropriate.
  `;

  const response = await hf.textGeneration({
    model: MODEL_ID,
    inputs: prompt,
    parameters: {
      max_new_tokens: 1024,
      temperature: 0.7,
      top_p: 0.95,
    }
  });

  return response.generated_text;
};