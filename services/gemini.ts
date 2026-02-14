import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
};

export const createChatSession = (): Chat => {
  const client = getAI();
  return client.chats.create({
    model: 'gemini-2.0-flash-exp',
    config: {
      systemInstruction: `당신은 세계적인 덴마크 건축 사무소인 COBE의 건축 어시스턴트입니다. 
      COBE의 프로젝트와 설계 철학에 대해 정통하며, 모든 답변은 한국어로 제공합니다.
      
      주요 프로젝트:
      1. "미래의 덴마크 의회": 크리스티안스보르 궁전 증축 안으로, 투명성을 통해 역사와 민주주의를 결합합니다.
      2. "달성 비슬도서관": 대한민국 대구에서 진행 중인 국제 공모전 당선작입니다. '살아있는 책장' 구조를 통해 커뮤니티 참여와 경관을 극대화합니다.
      3. "오페라 파크": 6개의 테마 정원과 중앙 온실을 갖춘 코펜하겐의 녹색 폐입니다.
      4. "노르하운 마스터플랜": 지속 가능성과 '5분 도시' 개념에 중점을 둔 대규모 도시 개발 프로젝트입니다.
      
      톤앤매너: 전문적이고 절제되어 있으며, 건축적인 통찰력이 느껴져야 합니다. 
      답변은 우아하고 간결하게 하며, 과도한 마크다운 사용은 지양하세요. 재료성, 공간감, 그리고 커뮤니티에 미치는 영향에 집중하여 답변하십시오.`
    }
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text || "I apologize, I could not generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};