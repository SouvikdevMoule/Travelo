// app/api/enrich-trip/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// List of available free models on OpenRouter
const AVAILABLE_MODELS = [
  "google/gemma-2b-it:free",
  "microsoft/phi-3-mini-4k-instruct:free", 
  "huggingfaceh4/zephyr-7b-beta:free",
  "mistralai/mistral-7b-instruct:free",
  "meta-llama/llama-3-8b-instruct:free"
];

async function callOpenRouter(prompt: string, retryCount = 0): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  // Try different models if one fails
  const modelIndex = Math.min(retryCount, AVAILABLE_MODELS.length - 1);
  const model = AVAILABLE_MODELS[modelIndex];

  const url = "https://openrouter.ai/api/v1/chat/completions";

  const body = {
    model: model,
    messages: [
      {
        role: "system",
        content: `You are a travel planning AI that returns structured JSON ONLY. 
IMPORTANT: Return ONLY valid JSON, no additional text or markdown.

Example format:
{
  "distance_km": 350,
  "hotels": [
    {
      "name": "Hotel Example",
      "address": "123 Main Street, City, State",
      "price_per_night": 2500,
      "map_link": "https://maps.google.com/?q=Hotel+Example+City"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "places": [
        {
          "name": "Famous Temple",
          "time": "09:00 AM",
          "map_link": "https://maps.google.com/?q=Famous+Temple+City",
          "description": "Ancient temple with beautiful architecture",
          "food": "Local street food nearby"
        }
      ]
    }
  ],
  "estimate_breakdown": {
    "hotels_avg": 2000,
    "travel": 5000,
    "food": 3000,
    "others": 2000
  },
  "estimate_per_person": 12000,
  "estimate_total": 12000
}`
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" }
  };

  console.log(`🔹 Calling OpenRouter API with model: ${model} (attempt ${retryCount + 1})`);
  
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "Travel Planner"
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`❌ OpenRouter API error (${model}):`, resp.status, errorText);
      
      // Retry with different model if available
      if (retryCount < AVAILABLE_MODELS.length - 1) {
        console.log(`🔄 Retrying with different model...`);
        return callOpenRouter(prompt, retryCount + 1);
      }
      
      throw new Error(`OpenRouter API error: ${resp.status} ${errorText}`);
    }

    const json = await resp.json();
    console.log("🔹 OpenRouter response received");

    const content = json?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error("❌ Empty AI response. Full response:", JSON.stringify(json, null, 2));
      
      // Retry with different model if available
      if (retryCount < AVAILABLE_MODELS.length - 1) {
        console.log(`🔄 Retrying with different model...`);
        return callOpenRouter(prompt, retryCount + 1);
      }
      
      throw new Error("Empty AI response from OpenRouter");
    }

    console.log("🔹 AI Response content length:", content.length);
    
    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
    
    return cleanedContent;
  } catch (error) {
    console.error(`❌ Network error with model ${model}:`, error);
    
    // Retry with different model if available
    if (retryCount < AVAILABLE_MODELS.length - 1) {
      console.log(`🔄 Retrying with different model...`);
      return callOpenRouter(prompt, retryCount + 1);
    }
    
    throw error;
  }
}

// Fallback data generator if AI fails completely
function generateFallbackData(fromPlace: string, toPlace: string, days: number, persons: number, budget: string) {
  console.log("🔄 Generating fallback data...");
  
  const baseBudget = budget === "Low" ? 1500 : budget === "Medium" ? 3000 : 5000;
  
  return {
    distance_km: Math.floor(Math.random() * 1000) + 200,
    hotels: [
      {
        name: `${fromPlace.split(',')[0]} Comfort Inn`,
        address: `${fromPlace}`,
        price_per_night: baseBudget,
        map_link: `https://maps.google.com/?q=hotels+${encodeURIComponent(fromPlace)}`
      },
      {
        name: `${toPlace.split(',')[0]} Grand Hotel`,
        address: `${toPlace}`,
        price_per_night: baseBudget * 1.2,
        map_link: `https://maps.google.com/?q=hotels+${encodeURIComponent(toPlace)}`
      }
    ],
    itinerary: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      places: [
        {
          name: `Day ${i + 1} Main Attraction`,
          time: "10:00 AM",
          map_link: `https://maps.google.com/?q=attractions+${encodeURIComponent(toPlace)}`,
          description: `Explore local attractions and cultural sites`,
          food: "Local cuisine restaurants nearby"
        }
      ]
    })),
    estimate_breakdown: {
      hotels_avg: baseBudget * days,
      travel: 2000,
      food: 1500 * days,
      others: 1000
    },
    estimate_per_person: (baseBudget * days + 2000 + 1500 * days + 1000) / persons,
    estimate_total: baseBudget * days + 2000 + 1500 * days + 1000
  };
}

export async function POST(req: Request) {
  try {
    const { tripId } = await req.json();
    if (!tripId) {
      return NextResponse.json({ error: "tripId required" }, { status: 400 });
    }

    console.log("🔹 Enriching trip:", tripId);

    // Fetch trip data
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      console.error("❌ Trip not found:", tripError);
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const {
      from_place,
      to_place,
      start_date,
      end_date,
      travel_mode,
      budget_segment,
      persons,
    } = trip;

    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    console.log(`🔹 Planning ${days}-day trip from ${from_place} to ${to_place}`);

    // Create AI prompt
    const prompt = `
Create a detailed travel plan for a trip in India with these details:
- From: ${from_place}
- To: ${to_place}
- Duration: ${days} days (${start_date} to ${end_date})
- Travelers: ${persons} person(s)
- Budget level: ${budget_segment}
- Travel mode: ${travel_mode}

Please provide realistic information for:
1. Distance in kilometers between the cities
2. 2-3 hotel suggestions with realistic prices in INR per night
3. A ${days}-day itinerary with places to visit each day
4. Cost breakdown and total estimates in INR

Return ONLY valid JSON in the exact format specified, no additional text.
`;

    let parsed;
    let usedFallback = false;

    try {
      console.log("🔹 Sending prompt to AI...");
      const aiRaw = await callOpenRouter(prompt);
      console.log("🔹 Raw AI response:", aiRaw.substring(0, 200) + "...");

      try {
        parsed = JSON.parse(aiRaw);
        console.log("✅ Successfully parsed AI JSON response");
      } catch (parseError) {
        console.error("❌ Failed to parse AI JSON, using fallback data");
        usedFallback = true;
        parsed = generateFallbackData(from_place, to_place, days, parseInt(persons), budget_segment);
      }
    } catch (aiError) {
      console.error("❌ AI service failed, using fallback data:", aiError);
      usedFallback = true;
      parsed = generateFallbackData(from_place, to_place, days, parseInt(persons), budget_segment);
    }

    // Prepare update data with validation
    const updateBody = {
      distance_km: parsed.distance_km || 0,
      estimate_per_person: parsed.estimate_per_person || 0,
      estimate_total: parsed.estimate_total || 0,
      hotels: Array.isArray(parsed.hotels) ? parsed.hotels.slice(0, 3) : [],
      itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary : [],
      travel_estimates: {
        mode: travel_mode,
        source: usedFallback ? "fallback" : "AI-generated",
        breakdown: parsed.estimate_breakdown || {},
        used_fallback: usedFallback
      },
      enriched_at: new Date().toISOString(),
    };

    console.log("🔹 Updating trip in database...");

    // Update the trip in Supabase
    const { error: updateError } = await supabase
      .from("trips")
      .update(updateBody)
      .eq("id", tripId);

    if (updateError) {
      console.error("❌ Database update error:", updateError);
      throw updateError;
    }

    console.log("✅ Trip enriched successfully");

    return NextResponse.json({
      success: true,
      message: usedFallback ? "Trip enriched with fallback data" : "Trip enriched successfully",
      used_fallback: usedFallback,
      data: updateBody
    });

  } catch (err: any) {
    console.error("❌ Enrichment error:", err);
    
    let errorMessage = "AI enrichment failed";
    if (err.message.includes("OPENROUTER_API_KEY")) {
      errorMessage = "OpenRouter API key not configured";
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: err.message 
      },
      { status: 500 }
    );
  }
}