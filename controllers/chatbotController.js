// chatController.js
const { getChatCompletion } = require("../models/ChatModel");

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log("logging message:", message);
    console.log("logging history:", history);

    const reply = await getChatCompletion(message, history);

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: error.message });
  }
};
