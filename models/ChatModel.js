// chatModel.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getChatCompletion(message, history = []) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // cheaper & fast
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for DocuTracker.",
        },
        ...history,
        { role: "user", content: message },
      ],
    });

    return response.choices[0].message.content;
    
  } catch (error) {
    console.error("OpenAI error:", error);
    throw new Error("Chat model failed");
  }
}

module.exports = { getChatCompletion };
