import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface RiskAnalysis {
  healthFactor: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  liquidationPrice?: number;
}

export async function getRiskAnalysis(portfolio: any): Promise<RiskAnalysis> {
  const model = "gemini-3-flash-preview";
  const prompt = `Analyze the following DeFi portfolio on Arc Network and provide a risk assessment.
  Portfolio: ${JSON.stringify(portfolio)}
  Return a JSON object with: healthFactor (0-10), riskLevel (LOW, MEDIUM, HIGH, CRITICAL), recommendation (string), and liquidationPrice (number if applicable).`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthFactor: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            recommendation: { type: Type.STRING },
            liquidationPrice: { type: Type.NUMBER },
          },
          required: ['healthFactor', 'riskLevel', 'recommendation'],
        },
      },
    });

    return JSON.parse(result.text || '{}') as RiskAnalysis;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      healthFactor: 8.5,
      riskLevel: 'LOW',
      recommendation: "AI Engine offline. Use manual risk buffers.",
    };
  }
}

export async function getYieldOptimization(balance: number, target: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `User has ${balance} USDC. Their goal is: ${target}.
  Suggest a step-by-step strategy for yield optimization using StableFi Hub features (Lending, Liquidity Provision, etc.) on Arc Network.`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return result.text || "No strategy available.";
  } catch (error) {
    return "Failed to generate AI strategy.";
  }
}
