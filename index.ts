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

// needed to use .env files
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// loads .env file
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY || "";

// adapter
const llm = new ChatOpenAI({
	model: "o4-mini",
	maxRetries: 2,
	apiKey: API_KEY,
});

// prompt template for formatting queries
const promptTemplate2 = ChatPromptTemplate.fromMessages([
	[
		"system",
		"You are a helpful assistant. Answer all questions to the best of your ability in {language}.",
	],
	["placeholder", "{messages}"],
]);

// Define the State. since we are adding language we use Annoation root and add "language" which is of Annotation<string>
const GraphAnnotation = Annotation.Root({
	...MessagesAnnotation.spec,
	language: Annotation<string>(),
});

// Define the function that calls the model
const callModel3 = async (state: typeof GraphAnnotation.State) => {
	const prompt = await promptTemplate2.invoke(state);
	const response = await llm.invoke(prompt);
	return { messages: [response] };
};

// langgraph for work flow
const workflow3 = new StateGraph(GraphAnnotation)
	.addNode("model", callModel3)
	.addEdge(START, "model")
	.addEdge("model", END);

// compile work flow with memory.
const app3 = workflow3.compile({ checkpointer: new MemorySaver() });

// add a thread id for context so app knows which chat it is using
const config4 = { configurable: { thread_id: uuidv4() } };

// user input + language
const input6 = {
	messages: [
		{
			role: "user",
			content: "Hi im bob",
		},
	],
	language: "Spanish",
};

// invoke. return last message
const output7 = await app3.invoke(input6, config4);
console.log(output7.messages[output7.messages.length - 1]);
