// biome-ignore assist/source/organizeImports: stupid
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
	START,
	END,
	StateGraph,
	MemorySaver,
	MessagesAnnotation,
	Annotation,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

import {
	SystemMessage,
	HumanMessage,
	AIMessage,
	trimMessages,
} from "@langchain/core/messages";

// needed to use .env files
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// loads .env file
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY || "";

// adapter
const model = new ChatOpenAI({
	model: "o4-mini",
	maxRetries: 2,
	apiKey: API_KEY,
});

const stream = await model.stream("Hello! Tell me about yourself.");
const chunks = [];
for await (const chunk of stream) {
	chunks.push(chunk);
	console.log(`${chunk.content}|`);
}
