import { GoogleGenAI, Type } from "@google/genai";
import { NLPResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseNaturalLanguageTask = async (input: string): Promise<NLPResponse> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    You are a smart scheduling assistant for a solopreneur. 
    Analyze the following user input and extract schedule details.
    
    User Input: "${input}"
    
    Current Date/Time context: ${new Date().toISOString()}
    
    Rules:
    1. Infer start time and end time. If no end time is given, assume 1 hour duration.
    2. Determine if this task requires "Deep Work" (high focus) based on keywords like "study", "report", "coding", "strategy" or Korean "공부", "보고서", "개발", "기획".
    3. Categorize the task in Korean (e.g., 미팅, 업무, 건강, 개인).
    4. Extract a 'description' that suggests preparation items or context. (e.g., input "Running" -> description "운동화, 물 챙기기", input "Client Meeting" -> description "제안서 및 포트폴리오 준비"). Output in Korean.
    5. Return strict JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise title for the task in Korean" },
            startTime: { type: Type.STRING, description: "ISO 8601 string for start time" },
            endTime: { type: Type.STRING, description: "ISO 8601 string for end time" },
            isDeepWork: { type: Type.BOOLEAN, description: "True if task requires high focus" },
            category: { type: Type.STRING, description: "Short category name in Korean" },
            description: { type: Type.STRING, description: "Preparation items, context, or simple memo in Korean" }
          },
          required: ["title", "startTime", "endTime", "isDeepWork", "category"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as NLPResponse;
  } catch (error) {
    console.error("Gemini NLP Error:", error);
    // Fallback if AI fails
    return {
      title: input,
      isDeepWork: false,
      category: "일반",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      description: "내용 없음"
    };
  }
};