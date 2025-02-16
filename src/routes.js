import { Agent, Task, Team } from 'kaibanjs';

// Create an AI agent with a specific role and goal
export const researchAgent = new Agent({
  name: 'Research Agent',
  role: 'Infrastructure Analyst',
  goal: 'Find data on public infrastructure and their maintenance needs in Boston and surrounding areas',
});

// Define a task for the agent
export const researchTask = new Task({
  description: 'Collect data on public infrastructure and their maintenance needs in Boston and surrounding areas',
  expectedOutput: 'A summarized report of public infrastructure maintenance needs',
  agent: researchAgent,
});

// Assemble a team with the agent and task
export const aiTeam = new Team({
  name: 'Infrastructure Research Team',
  agents: [researchAgent],
  tasks: [researchTask],
  env: { OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY },
});
