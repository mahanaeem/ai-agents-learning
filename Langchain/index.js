import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { createAgent, tool } from "langchain";
import * as z from "zod";

const getWeather = tool(
  ({ city }) => {
    return {
      city,
      temperatureC: 35,
      source: "demo weather data",
    };
  },
  {
    name: "get_weather",
    description: "Get the current temperature for a city.",
    schema: z.object({
      city: z.string().describe("The city name"),
    }),
  }
);

const calculateDeliveryFee = tool(
  ({ baseFee, surchargePercent }) => {
    const surcharge = baseFee * (surchargePercent / 100);

    return {
      baseFee,
      surcharge,
      finalFee: baseFee + surcharge,
    };
  },
  {
    name: "calculate_delivery_fee",
    description: "Add a percentage surcharge to a delivery fee.",
    schema: z.object({
      baseFee: z.number().describe("Original delivery fee"),
      surchargePercent: z.number().describe("Surcharge percentage"),
    }),
  }
);


const discountCalculator = tool(
  ({ price, discountPercentage }) => {
    const discountAmount = price * (discountPercentage / 100);
    const finalPrice = price - discountAmount;

    return String(finalPrice);
  },
  {
    name: "discount_calculator",
    description: "Use this tool to calculate final price after discount.",
    schema: z.object({
      price: z.number().describe("Original price"),
      discountPercentage: z.number().describe("Discount percentage"),
    }),
  }
);

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

const agent = createAgent({
  model,
  tools: [getWeather, calculateDeliveryFee, discountCalculator],
  systemPrompt:
    "You are a delivery assistant. Use tools when needed and explain the final result clearly.",
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Check the weather in Islamabad. If it is above 30 degrees Celsius, calculate a 20% surcharge on a delivery fee of 200 PKR. Also, calculate the final price of an item that costs 500 PKR with a 15% discount.",
    },
  ],
});

const finalMessage = result.messages.at(-1);

console.log(finalMessage.content);
