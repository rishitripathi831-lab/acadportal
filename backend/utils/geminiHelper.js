import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const checkSimilarity = async (textA, textB) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Compare the following two student assignments and return:
1. Similarity percentage (0–100)
2. Short explanation

Assignment A:
${textA}

Assignment B:
${textB}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
