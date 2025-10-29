import {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory} from "@google/generative-ai";

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }
];

export interface TravelDetails {
  source: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  travelers: number;
  interests: string[];
  currency?: string; // Added currency field
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = "gemini-2.5-flash";

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate a travel plan.
   * Accepts an optional AbortSignal to allow cancelling the request from the UI.
   * Also supports an optional timeout (ms) after which the promise will reject.
   */
  async generateTravelPlan(
    travelDetails: TravelDetails,
    signal?: AbortSignal,
    timeoutMs: number = 120000
  ): Promise<any> {
    // Helper: build the prompt
    const tripDurationDays = Math.ceil(
      (travelDetails.endDate.getTime() - travelDetails.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
      Act as a travel planning AI. Create a detailed travel plan with the following structure and information:
      
      Travel Details:
      - Origin: ${travelDetails.source}
      - Destination: ${travelDetails.destination}
      - Travel Dates: ${travelDetails.startDate.toLocaleDateString()} to ${travelDetails.endDate.toLocaleDateString()} (${tripDurationDays} days)
      - Budget: ${travelDetails.currency} ${travelDetails.budget}
      - Number of Travelers: ${travelDetails.travelers}
      - Interests: ${travelDetails.interests.join(", ")}
      - Currency: ${travelDetails.currency || "USD"}
      
      Please provide the following sections in your response:
      
      1. Itinerary: Create a day-by-day itinerary optimized for ${travelDetails.destination}, considering the interests and budget.
      
      2. Accommodations: Recommend suitable accommodations (hotels, rentals, etc.) within the budget. Be specific.
      
      3. Transportation: Suggest the best transportation methods to, from, and within the destination.
      
      4. Activities & Attractions: Recommend specific activities, attractions, and experiences that match the stated interests.
      
      5. Budget Breakdown: Provide a detailed budget breakdown showing how the $${travelDetails.budget} should be allocated across accommodations, food, transportation, activities, etc.
      
      6. Travel Tips: Share 3-5 important tips for this specific destination.
      
      Format the response in a clean, organized manner with clear section headers. Make all recommendations specific to ${travelDetails.destination} and tailored to the provided interests: ${travelDetails.interests.join(", ")}.
      `;

    // Create the generative model (using this.model which already set to gemini-2.5-flash)
    try {
      const generativeModel = this.genAI.getGenerativeModel({
        model: this.model,
        safetySettings
      });

      // Start the generation
      const generationPromise = (async () => {
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        const text: any = response.text();
        return text;
      })();

      // Abort promise that rejects when signal is aborted
      let abortHandler: (() => void) | null = null;
      const abortPromise = new Promise((_resolve, reject) => {
        if (signal) {
          if (signal.aborted) {
            reject(new Error("Request aborted"));
            return;
          }
          abortHandler = () => {
            reject(new Error("Request aborted"));
          };
          signal.addEventListener("abort", abortHandler);
        }
      });

      // Timeout promise
      const timeoutPromise = new Promise((_resolve, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error("Request timed out"));
        }, timeoutMs);
      });

      // Race: generation | abort | timeout
      try {
        const result = await Promise.race([generationPromise, abortPromise, timeoutPromise]);
        return result;
      } finally {
        if (signal && abortHandler) signal.removeEventListener("abort", abortHandler);
      }
    } catch (error) {
      console.error("Error generating travel plan:", error);
      throw new Error(
        `Failed to generate travel plan: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export const getGeminiService = (apiKey: string) => {
  return new GeminiService(apiKey);
};
