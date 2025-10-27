// import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// export interface GeminiResponse {
//     content_type: string;
//     recommended_agent: string;
//     available_agents: string[];
//     confidence_score: number;
//     is_relevant: boolean;
// }

// export class GeminiService {
//     private genAI: GoogleGenerativeAI;
//     private model: GenerativeModel;

//     constructor(apiKey: string) {
//         this.genAI = new GoogleGenerativeAI(apiKey);
//         this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     }

//     async generateResponse(prompt: string): Promise<GeminiResponse> {
//         try {
//             const result = await this.model.generateContent(genAIPrompt + prompt);
//             const responseText = result.response.text();
            
//             // Clean up the response text by removing any markdown formatting or backticks
//             const cleanedText = responseText
//                 .replace(/```json\s*/g, '')
//                 .replace(/```\s*/g, '')
//                 .trim();

//             try {
//                 return JSON.parse(cleanedText) as GeminiResponse;
//             } catch (parseError) {
//                 console.error("JSON parsing error:", parseError);
//                 throw parseError;
//             }
//         } catch (error) {
//             // Return default response for errors
//             console.error("Gemini AI error:", error);
//             return {
//                 content_type: "unrelated",
//                 recommended_agent: "unrelated",
//                 available_agents: ["blogging", "content_writing", "technical_writing", "data_analysis", "general"],
//                 confidence_score: 0,
//                 is_relevant: false
//             };
//         }
//     }
// }

// export const genAIPrompt = `
// You are a specialized AI content categorization system. Analyze the provided content and determine the most appropriate agent category from the available options. Return ONLY a clean JSON response without any markdown formatting or code blocks.

// Rules:
// 1. Evaluate if the content matches any of the following categories:
//    - blog_writing
//    - linkedin_post
//    - youtube_video_summary
//    - travel_itinerary

// 2. Return a clean JSON object with:
//    - content_type: identified type of the content
//    - recommended_agent: the most suitable agent category
//    - available_agents: array of all possible agent categories
//    - confidence_score: a float between 0 and 1 indicating match confidence
//    - is_relevant: boolean indicating if content matches any category

// 3. If the content doesn't match any category:
//    - Set content_type as "unrelated"
//    - Set recommended_agent as "unrelated"
//    - Set confidence_score to 0
//    - Set is_relevant to false

// Example response (return exactly in this format without any markdown or code blocks):
// {
//   "content_type": "unrelated",
//   "recommended_agent": "unrelated",
//   "available_agents": ["blogging", "content_writing", "technical_writing", "data_analysis", "general"],
//   "confidence_score": 0,
//   "is_relevant": false
// }

// Analyze this content:
// `;
