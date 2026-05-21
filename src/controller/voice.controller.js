const { textToSpeech } = require("../services/elevenlabs.service");

async function generateVoice(req, res) {
  try {
    const { text } = req.body;

    const audioStream = await textToSpeech(text);

    res.setHeader("Content-Type", "audio/mpeg");

    for await (const chunk of audioStream) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.log("ElevenLabs Error:", error.message);

    return res.status(500).json({
      message: "Failed to generate voice",
      error: error.message,
    });
  }
}

module.exports = {
  generateVoice,
};