import openAI from "openai";
import env from "dotenv";

env.config();

const client = new openAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const memory = {
  facts: {},
  messages: [],
};

function saveMemory(userInput) {
  const nameMatch = userInput.match(/my name is (.+)/i);
  if (nameMatch) {
    memory.facts.name = nameMatch[1];
  }
}

function builtMemoryMessage() {
  return {
    role: "system",
    content: `You are a helpful assistant. Remember the following facts about the user: ${JSON.stringify(memory.facts)}.`,
  };
}

async function runAgent(userInput) {
  saveMemory(userInput);

  memory.messages.push({
    role: "user",
    content: userInput,
  });

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful AI agent. Use the known user facts as memory.",
    },

    builtMemoryMessage(),
    ...memory.messages,
  ];


  const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", messages, 
  });

  const answer = response.choices[0].message.content;

  memory.messages.push({
    role: "assistant",
    content: answer,
  })
    return answer;
  
}


console.log(await runAgent("My name is Maha"));
console.log(await runAgent("What is my name?"));
console.log(await runAgent("What do you know about me?"));


