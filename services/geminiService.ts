
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { ItinerarySource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPrompt = (destination: string, budget: string, interests: string[]): string => {
  const interestsString = interests.length > 0 ? `The traveler's main interests are: ${interests.join(", ")}.` : "The traveler is open to all kinds of activities.";

  return `
    You are an expert travel agent. Create a detailed, day-by-day travel itinerary for a trip to ${destination}.

    **Constraints & Preferences:**
    - **Budget:** The approximate budget for the trip is ${budget}. Please suggest a mix of activities and dining options (from budget-friendly to moderate) that align with this.
    - **Interests:** ${interestsString} Prioritize suggestions that match these interests.
    - **Duration:** Please create a 3-day itinerary.
    - **Real-time Data:** Use Google Search to find up-to-date information for suggestions like opening hours, ticket prices, and local recommendations. Ensure the suggestions are current and relevant.

    **Output Format:**
    - Format the entire response as Markdown.
    - Use headings for each day (e.g., "### Day 1: Arrival and Exploration").
    - For each day, provide a morning, afternoon, and evening plan.
    - For each activity or restaurant, provide a brief description and why it's recommended. If possible, include estimated costs.
    - End with a "Budget Summary" section, giving a rough breakdown of potential costs.
    - Maintain a helpful, enthusiastic, and encouraging tone.
  `;
};

export const generateItinerary = async (
  destination: string,
  budget: string,
  interests: string[]
): Promise<{ itinerary: string; sources: ItinerarySource[] }> => {
  const prompt = buildPrompt(destination, budget, interests);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const itinerary = response.text;
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    // Filter out any potential malformed source entries
    const sources = rawSources.filter(
        (s: any): s is ItinerarySource => s.web && typeof s.web.uri === 'string' && typeof s.web.title === 'string'
    );

    if (!itinerary) {
        throw new Error("Received an empty response from the API.");
    }
    
    return { itinerary, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the travel planning service.");
  }
};
