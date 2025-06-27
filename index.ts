import {
	END,
	MemorySaver,
	MessagesAnnotation,
	START,
	StateGraph,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

const config = { configurable: { thread_id: uuidv4() } };

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY || "";

const llm = new ChatOpenAI({
	model: "o4-mini",
	maxRetries: 2,
	apiKey: API_KEY,
});

const callModel = async (state: typeof MessagesAnnotation.State) => {
	const response = await llm.invoke(state.messages);
	return { messages: response };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
	// Define the node and edge
	.addNode("model", callModel)
	.addEdge(START, "model")
	.addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

const input = [
	{
		role: "user",
		content: "Hi! I'm Bob.",
	},
];
const output = await app.invoke({ messages: input }, config);
// The output contains all messages in the state.
// This will log the last message in the conversation.
console.log(output.messages);

const input2 = [
	{
		role: "user",
		content: "What's my name?",
	},
];
const output2 = await app.invoke({ messages: input2 }, config);
console.log(output2.messages[output2.messages.length - 1]);
