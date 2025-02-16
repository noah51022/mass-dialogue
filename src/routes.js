// src/agentWorkflow.js
import { Agent, Task, Team } from 'kaibanjs';

// Create the Infrastructure Analysis agent
export const researchAgent = new Agent({
  name: 'Boston Infrastructure Analyst',
  role: 'Infrastructure Analyst',
  goal: 'Analyze and provide insights on the current state of Boston\'s public infrastructure.',
  background: 'Expert in urban planning and infrastructure analysis',
  llmConfig: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  },
  systemPrompt: `You are an expert infrastructure analyst focusing on Boston's public infrastructure. 
    Provide a concise report on:
    1. Current state of roads and bridges
    2. Public transportation systems (MBTA)
    3. Water and sewage systems
    4. Key maintenance issues
    5. Recommended improvements`
});

// Create the AI Infrastructure Research agent
export const aiResearchAgent = new Agent({
  name: 'AI Infrastructure Researcher',
  role: 'AI Technology Analyst',
  goal: 'Research and analyze how AI is being implemented in public infrastructure systems',
  background: 'Expert in AI applications and smart city technologies',
  llmConfig: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  },
  systemPrompt: `You are an expert analyst specializing in AI applications in public infrastructure. 
    Summarize:
    1. Current AI implementations
    2. Smart city technologies
    3. Key benefits and challenges
    4. Future possibilities`
});

// Define the infrastructure analysis task
export const researchTask = new Task({
  id: 'boston-infrastructure-analysis',
  title: "Boston Infrastructure Analysis",
  description: `Analyze Boston's infrastructure focusing on:
  - Current state of roads, bridges, and public transport
  - Key maintenance issues
  - Recommendations for improvements`,
  expectedOutput: 'A concise report on Boston\'s infrastructure status and recommendations',
  agent: researchAgent,
  execute: async (input, context) => {
    const prompt = `Provide a brief report on Boston's infrastructure:

    1. Current state of roads and bridges
    2. Key maintenance issues
    3. Recommendations for improvements`;

    const response = await context.llm.chat([
      { role: "system", content: context.agent.systemPrompt },
      { role: "user", content: prompt }
    ]);

    return response.content;
  }
});

// Define the AI research task
export const aiResearchTask = new Task({
  id: 'ai-infrastructure-research',
  title: "AI in Infrastructure Research",
  description: `Research AI applications in public infrastructure:
  - Current implementations
  - Key benefits and challenges
  - Future possibilities`,
  expectedOutput: 'A brief analysis of AI applications in public infrastructure',
  agent: aiResearchAgent,
  execute: async (input, context) => {
    const prompt = `Summarize AI applications in public infrastructure:

    1. Current implementations
    2. Key benefits and challenges
    3. Future possibilities`;

    const response = await context.llm.chat([
      { role: "system", content: context.agent.systemPrompt },
      { role: "user", content: prompt }
    ]);

    return response.content;
  }
});

// Create separate teams for each agent
export const infrastructureTeam = new Team({
  name: 'Boston Infrastructure Team',
  agents: [researchAgent],
  tasks: [researchTask],
  options: {
    emitEvents: true,
    eventInterval: 1000
  }
});

export const aiResearchTeam = new Team({
  name: 'AI Research Team',
  agents: [aiResearchAgent],
  tasks: [aiResearchTask],
  options: {
    emitEvents: true,
    eventInterval: 1000
  }
});
