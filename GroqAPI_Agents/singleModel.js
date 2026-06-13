import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Real tool functions
function calculator(expression) {
  return Function(`"use strict"; return (${expression})`)();
}

function getCurrentTime() {
  return new Date().toLocaleString();
}

function getWeather(city) {
  return `The weather in ${city} is sunny with a temperature of 25°C.`;
}

function searchWeb(query) {
  return `Searching web for "${query}". Demo result: AI agents use LLMs and tools to complete tasks.`;
}

// Tool definitions
const tools = [
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Use this tool for math calculations.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Math expression like 2 + 2",
          },
        },
        required: ["expression"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCurrentTime",
      description: "Use this tool to get the current date and time.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Use this tool to get weather for a city.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "City name like Lahore or Islamabad",
          },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchWeb",
      description: "Use this tool to search information.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
        },
        required: ["query"],
      },
    },
  },
];

const availableTools = {
  calculator,
  getCurrentTime,
  getWeather,
  searchWeb,
};

async function runAgent(userInput) {
  const messages = [
    {
      role: "system",
      content: "You are a helpful AI agent. Use tools when needed.",
    },
    {
      role: "user",
      content: userInput,
    },
  ];

  const firstResponse = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    tools,
    tool_choice: "auto",
  });

  const modelReply = firstResponse.choices[0].message;
  messages.push(modelReply);

  if (!modelReply.tool_calls || modelReply.tool_calls.length === 0) {
    return modelReply.content;
  }

  for (const toolCall of modelReply.tool_calls) {
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);

    const toolFunction = availableTools[toolName];

    let toolResult;

    if (toolName === "calculator") {
      toolResult = toolFunction(toolArgs.expression);
    }

    if (toolName === "getCurrentTime") {
      toolResult = toolFunction();
    }

    if (toolName === "getWeather") {
      toolResult = toolFunction(toolArgs.city);
    }

    if (toolName === "searchWeb") {
      toolResult = toolFunction(toolArgs.query);
    }

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: String(toolResult),
    });
  }

  const finalResponse = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
  });

  return finalResponse.choices[0].message.content;
}

// const answer = await runAgent("What is 2 + 2?");
// console.log(answer);


const answer = await runAgent("What time is it?");
console.log(answer);