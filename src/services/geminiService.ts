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
  private model: string = "gemini-1.5-flash";

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateTravelPlan(travelDetails: TravelDetails): Promise<any> {
    try {
      const generativeModel = this.genAI.getGenerativeModel({
        model: this.model,
        safetySettings
      });

      const tripDurationDays = Math.ceil(
        (travelDetails.endDate.getTime() - travelDetails.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
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

      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;
      const text: any = response.text();

      // Parse the response to extract sections
      // const itineraryMatch = text.match(/Itinerary:?([\s\S]*?)(?=Accommodations:|$)/i);
      // const accommodationsMatch = text.match(/Accommodations:?([\s\S]*?)(?=Transportation:|$)/i);
      // const transportationMatch = text.match(/Transportation:?([\s\S]*?)(?=Activities|$)/i);
      // const activitiesMatch = text.match(/Activities[^:]*:?([\s\S]*?)(?=Budget Breakdown:|$)/i);
      // const budgetMatch = text.match(/Budget Breakdown:?([\s\S]*?)(?=Travel Tips:|$)/i);
      // const tipsMatch = text.match(/Travel Tips:?([\s\S]*?)$/i);

      // const travelPlan: TravelPlan = {
      //   itinerary: itineraryMatch ? itineraryMatch[1].trim() : "No itinerary generated",
      //   accommodations: accommodationsMatch ? accommodationsMatch[1].trim() : "No accommodations generated",
      //   transportation: transportationMatch ? transportationMatch[1].trim() : "No transportation generated",
      //   activities: activitiesMatch ? activitiesMatch[1].trim() : "No activities generated",
      //   budgetBreakdown: budgetMatch ? budgetMatch[1].trim() : "No budget breakdown generated",
      //   travelTips: tipsMatch ? tipsMatch[1].trim() : "No travel tips generated",
      // };
      return text;
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
