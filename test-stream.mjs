import { createAnthropic } from "@ai-sdk/anthropic";

const a = createAnthropic({
  apiKey: "test",
  baseURL: "https://api.minimax.io/anthropic/v1",
});

const model = a("MiniMax-M2.7");
console.log("model type:", typeof model);
console.log("model keys:", Object.keys(model));

// Try direct messages.stream
if (model.messages) {
  console.log("has messages.stream");
}

// Try the provider's languageModel method
if (model.languageModel) {
  console.log("has languageModel");
  console.log("languageModel:", typeof model.languageModel);
}

// Try a.chat
const chatResult = model.chat;
console.log("chat:", typeof chatResult);
