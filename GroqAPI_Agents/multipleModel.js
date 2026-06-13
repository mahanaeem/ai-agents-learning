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
      content: `
You are a helpful AI agent.
Use tools when needed.
If the user asks multiple things, complete ALL parts before final answer.
When the user asks for time, use getCurrentTime tool.
When the user asks for math, use calculator tool.
Do not answer until all requested parts are completed.
Use valid JSON arguments only.
Do not write XML tags.
`,
    },
    {
      role: "user",
      content: userInput,
    },
  ];

  for (let i = 0; i < 5; i++) {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      tools,
      tool_choice: "auto",
    });

    const modelReply = response.choices[0].message;
    console.log(JSON.stringify(modelReply, null, 2));
    messages.push(modelReply);

    console.log("MODEL REPLY:", modelReply);

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

      console.log("TOOL USED:", toolName);
      console.log("TOOL RESULT:", toolResult);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: String(toolResult),
      });
    }
  }

  return "Agent stopped after 5 steps.";
}


// const answer = await runAgent("What is the current time and what is 2 + 2?");
// console.log(answer);


const answer = await runAgent("Use tools to answer both: what is the current time, and what is 2 + 2?");
console.log(answer);