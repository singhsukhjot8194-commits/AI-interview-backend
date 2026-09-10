const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateInterviewPlan = async ({
  jobDescription,
  selfDescription,
  resumeName,
  resumeText,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const profile = [
    selfDescription,
    resumeText
      ? `Resume content:\n${resumeText}`
      : "No resume content provided",
    resumeName ? `Resume filename: ${resumeName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are an expert technical recruiter and interview coach. Build a practical interview preparation plan from the role and candidate profile below.

ROLE:
${jobDescription}

CANDIDATE PROFILE:
${profile || "No candidate profile provided"}

Return ONLY valid JSON. Do not wrap it in markdown. Use exactly this shape:
{
  "title": "short role title",
  "profileSummary": "one sentence summary",
  "matchScore": 0,
  "technicalQuestions": [{"question":"...","intention":"...","answer":"..."}],
  "behavioralQuestions": [{"question":"...","intention":"...","answer":"..."}],
  "preparationPlan": [{"day":1,"focus":"...","tasks":["...","..."]}],
  "skillGaps": [{"skill":"...","severity":"high|medium|low"}]
}
Use 5 technical questions, 5 behavioral questions, a 5-day plan, and 3-6 skill gaps. Keep answers concise and specific. matchScore must be an integer from 0 to 100.`;

  const modelNames = [
    process.env.GEMINI_MODEL,
    "gemini-3.5-flash",
    "gemini-flash-latest",
  ].filter(Boolean);
  let result;
  let lastError;

  for (const modelName of modelNames) {
    try {
      result = await client
        .getGenerativeModel({ model: modelName })
        .generateContent(prompt);
      break;
    } catch (error) {
      lastError = error;
      console.error(`Gemini model ${modelName} failed: ${error.message}`);
    }
  }

  if (!result) {
    throw lastError || new Error("Gemini did not return a response.");
  }

  const text = result.response
    .text()
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = JSON.parse(text);

  if (
    !parsed.title ||
    !Array.isArray(parsed.technicalQuestions) ||
    !Array.isArray(parsed.behavioralQuestions) ||
    !Array.isArray(parsed.preparationPlan) ||
    !Array.isArray(parsed.skillGaps)
  ) {
    throw new Error("Gemini returned an incomplete interview plan.");
  }

  return parsed;
};

module.exports = { generateInterviewPlan };
