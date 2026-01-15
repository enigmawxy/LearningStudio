
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AnalysisResult {
  title: string;
  summary: string;
  category: string;
  keywords: string[];
}

export const analyzeResourceDescription = async (text: string): Promise<AnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析这段教育资源分享帖子的内容并提取元数据，请使用中文返回结果： "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "一个吸引人的论坛帖子标题" },
            summary: { type: Type.STRING, description: "一段简短专业的摘要" },
            category: { type: Type.STRING, description: "最合适的分类：数学, 理化生, 编程开发, 语言学习, 设计艺术, 考证考研" },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "summary", "category", "keywords"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini分析失败:", error);
    return null;
  }
};
