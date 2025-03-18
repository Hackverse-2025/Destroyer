require("dotenv").config();
import express from "express";
import cors from "cors";
import { getSystemPrompt } from "./promts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_URL = "https://api.gemini.com/v1/chat/completions";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;

    try {
        const response = await axios.post(GEMINI_API_URL, {
            messages: [{
                role: 'user',
                content: prompt
            }],
            model: 'gemini-1',
            max_tokens: 200,
            system: "Return either node or react based on what you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
        }, {
            headers: {
                'Authorization': `Bearer ${GEMINI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const answer = response.data.choices[0].message.content.trim();
        if (answer === "react") {
            res.json({
                prompts: [
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [reactBasePrompt]
            });
            return;
        }

        if (answer === "node") {
            res.json({
                prompts: [
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [nodeBasePrompt]
            });
            return;
        }

        res.status(403).json({ message: "You can't access this" });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;

    try {
        const response = await axios.post(GEMINI_API_URL, {
            messages: messages,
            model: 'gemini-1',
            max_tokens: 8000,
            system: getSystemPrompt()
        }, {
            headers: {
                'Authorization': `Bearer ${GEMINI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ response: response.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));