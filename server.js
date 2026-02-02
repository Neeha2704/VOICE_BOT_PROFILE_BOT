import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

console.log("API key loaded:", process.env.OPENAI_API_KEY?.startsWith("sk-"));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// API endpoint
app.post("/api/ask", async (req, res) => {
  try {
    const question = req.body.question;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are answering as ME.

Profile:
- Mining Engineering student at IIT (ISM) Dhanbad
- Interested in data, machine learning, and problem-solving
- Honest, concise, reflective
- Interview-style answers
- No exaggeration or buzzwords
          `
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.4
    });

    res.json({
      answer: completion.choices[0].message.content
    });
  } catch (error) {

  // Fallback when OpenAI quota is exceeded
  if (error.code === "insufficient_quota") {
  const q = req.body.question.toLowerCase();

  let answer =
    "I’m an engineering student from IIT (ISM) Dhanbad with a strong interest in machine learning, data-driven systems, and applied problem-solving. I focus on building practical, production-oriented solutions and growing as an engineer in fast-moving environments.";

  if (q.includes("life") || q.includes("story") || q.includes("background")) {
    answer =
      "I’m an engineering student from IIT (ISM) Dhanbad with a strong interest in machine learning, data-driven systems, and applied problem-solving. Over the last few years, I’ve worked on ML, analytics, and software projects while building a habit of learning technologies independently and shipping working solutions. I’m now focused on developing production-oriented AI systems and growing as an engineer in fast-moving environments.";
  }

  else if (q.includes("superpower") || q.includes("strength")) {
    answer =
      "My strongest skill is structured problem-solving. I break vague or complex problems into clear components, identify what actually matters, and move forward with practical solutions instead of over-engineering.";
  }

  else if (q.includes("grow") || q.includes("improve")) {
    answer =
      "First, building deeper expertise in machine learning systems beyond individual models, including data quality, evaluation, and trade-offs. Second, designing reliable, user-facing AI applications rather than isolated experiments. Third, improving speed and decision-making in high-ownership, fast-execution environments.";
  }

  else if (q.includes("misconception") || q.includes("coworker")) {
    answer =
      "Some people initially assume I’m reserved because I don’t speak impulsively. In reality, I’m highly focused and analytical—I prefer understanding the problem clearly before contributing, which helps me give more precise and useful input.";
  }

  else if (q.includes("boundary") || q.includes("limit") || q.includes("challenge")) {
    answer =
      "I push my limits by taking ownership of problems that are slightly beyond my current skill set and closing the gap through focused learning and execution. I regularly rebuild systems from scratch, test assumptions, and iterate quickly until I reach clarity and control over the solution.";
  }

  return res.json({ answer });
}


  // Generic error fallback
  res.status(500).json({
    answer: "Something went wrong while generating the response."
  });
}


});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


