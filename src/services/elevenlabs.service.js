const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function textToSpeech(text) {
  if (!text) {
    throw new Error("Text is required");
  }

  const audioStream = await elevenlabs.textToSpeech.stream(
    process.env.ELEVENLABS_VOICE_ID,
    {
      text,
      modelId: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    }
  );

  return audioStream;
}

async function speechToText(audioBuffer) {
  if (!audioBuffer) {
    throw new Error("Audio file is required");
  }

  const audioBlob = new Blob([audioBuffer]);

  const transcription = await elevenlabs.speechToText.convert({
    file: audioBlob,
    modelId: "scribe_v2",
    languageCode: "eng",
    tagAudioEvents: true,
  });

  return transcription.text;
}

module.exports = {
  textToSpeech,
  speechToText,
};