import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINIAI_API_KEY,
});
export const runtime = "edge";

export async function POST(_req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. Provide a new set of questions each time. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const stream = streamText({
      model: google("gemini-2.0-flash-exp"),
      prompt,
      maxTokens: 400,
      temperature: 1,
    });

    return stream.toDataStreamResponse();
    // console.log("stream result here:-", stream);
  } catch (error) {
    console.error("Error integrating AI:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to generate text.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
