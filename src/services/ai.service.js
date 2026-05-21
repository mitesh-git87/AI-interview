const { GoogleGenAI } = require("@google/genai");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { z } = require("zod");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z.number(),
  technicalQuestion: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),
  behaviourQuestion: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),
  skillGap: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  try {
    const prompt = `
Generate an interview report.

Return ONLY valid JSON in this exact structure:

{
  "matchScore": number,
  "technicalQuestion": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behaviourQuestion": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGap": [
    {
      "skill": "",
      "severity": "low | medium | high"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": [""]
    }
  ]
}

Rules:
- Return ONLY valid JSON
- preparationPlan must be a consecutive day-wise plan
- Day numbers must start from 1
- Continue sequentially (1,2,3,4,5...) without skipping
- Create a detailed preparation plan
- Define meaningful tasks for every day
- task for each day should be specified

Resume: ${resume}

Self Description: ${selfDescription}

Job Description: ${jobDescription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // responseSchema: zodToJsonSchema(interviewReportSchema),
      },
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.log("Generate Interview Report Error:", err);
    throw err;
  }
}

async function evaluateInterviewAnswer({ question, userAnswer }) {
  try {
    const prompt = `
You are an expert interview coach. that has all knowlwdge related to software development.

Interview Question:
${question}

User Answer:
${userAnswer}

Evaluate the user's answer.

Return ONLY valid JSON in this exact structure:

{
  "score": number,
  "goodPoints": [""],
  "improvements": [""],
  "missingPoints": [""],
  "betterAnswer": "",
  "feedbackSummary": ""
}

Rules:
- score must be from 0 to 10
- goodPoints should mention what the user answered well
- improvements should tell what can be improved in the answer
- missingPoints should mention important points the user missed
- betterAnswer should be a strong interview-ready answer
- feedbackSummary should be short and suitable for voice output
- Return ONLY valid JSON
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.log("Evaluate Interview Answer Error:", err);
    throw err;
  }
}

module.exports = generateInterviewReport;
module.exports.evaluateInterviewAnswer = evaluateInterviewAnswer;