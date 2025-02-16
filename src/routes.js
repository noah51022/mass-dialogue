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
    Analyze and provide detailed insights about:
    1. Current state of roads and bridges
    2. Public transportation systems (MBTA)
    3. Water and sewage systems
    4. Critical maintenance requirements
    5. Recommended improvements
    
    Format your response as a detailed report with clear sections and specific recommendations.`
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
    Research and analyze:
    1. Current AI implementations in infrastructure
    2. Smart city technologies
    3. Automated maintenance systems
    4. AI-driven traffic management
    5. Predictive infrastructure maintenance
    
    Format your response as a detailed report with specific examples and future possibilities.`
});

// Define the infrastructure analysis task
export const researchTask = new Task({
  id: 'boston-infrastructure-analysis',
  title: "Boston Infrastructure Analysis",
  description: `Conduct a comprehensive analysis of Boston's infrastructure. Your task:

  1. Assess the current state of:
     - Roads and bridges (condition, age, maintenance history)
     - Public transportation (MBTA system, buses, trains)
     - Water and sewage infrastructure
     - Other critical infrastructure

  2. Identify:
     - Major maintenance issues
     - Safety concerns
     - Capacity problems
     - Aging infrastructure risks

  3. Provide:
     - Specific recommendations for improvements
     - Priority areas needing immediate attention
     - Long-term infrastructure development suggestions
     - Cost-effective maintenance strategies`,
  expectedOutput: 'A detailed infrastructure analysis report with current status, issues, and recommendations',
  agent: researchAgent,
  execute: async (input, context) => {
    const prompt = `Based on your knowledge and analysis, provide a comprehensive report on Boston's infrastructure:

    1. Current Infrastructure Status:
    - Detailed assessment of roads, bridges, and tunnels
    - MBTA system evaluation
    - Water and sewage system analysis
    
    2. Critical Issues:
    - Identify major maintenance problems
    - List urgent safety concerns
    - Highlight capacity limitations
    
    3. Recommendations:
    - Specific improvement proposals
    - Priority projects
    - Timeline suggestions
    - Budget considerations

    Please provide specific details and examples where possible.`;

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
  description: `Research and analyze AI applications in public infrastructure:

  1. Current Implementation:
     - Smart city initiatives
     - AI-powered monitoring systems
     - Automated maintenance programs
     - Traffic management systems

  2. Identify:
     - Successful AI implementations
     - Emerging technologies
     - Integration challenges
     - Future possibilities

  3. Provide:
     - Current use cases
     - Implementation strategies
     - Success metrics
     - Future recommendations`,
  expectedOutput: 'A detailed analysis of AI applications in public infrastructure',
  agent: aiResearchAgent,
  execute: async (input, context) => {
    const prompt = `Provide a comprehensive analysis of AI applications in public infrastructure:

    1. Current AI Applications:
    - Smart city implementations
    - AI-driven monitoring systems
    - Automated maintenance solutions
    
    2. Impact Analysis:
    - Success stories
    - Implementation challenges
    - Performance metrics
    
    3. Future Outlook:
    - Emerging technologies
    - Integration opportunities
    - Development roadmap

    Please provide specific examples and real-world applications.`;

    const response = await context.llm.chat([
      { role: "system", content: context.agent.systemPrompt },
      { role: "user", content: prompt }
    ]);

    return response.content;
  }
});

// Create team with both agents
export const aiTeam = new Team({
  name: 'Infrastructure Research Team',
  agents: [researchAgent, aiResearchAgent],
  tasks: [researchTask, aiResearchTask],
  options: {
    emitEvents: true,
    eventInterval: 1000
  }
});
