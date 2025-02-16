// src/agentWorkflow.js
import { Agent, Task, Team } from 'kaibanjs';
import OpenAI from 'openai';

// Initialize OpenAI client with a more specific name
const aiClient = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Explicitly allow browser usage
});

// Create the Infrastructure Analysis agent
export const researchAgent = new Agent({
  name: 'Infrastructure Analyst',
  role: 'Infrastructure Analyst',
  goal: 'Analyze and provide insights on Boston\'s infrastructure',
  background: 'Expert in urban planning and infrastructure analysis',
  llmConfig: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  }
});

// Create the AI Infrastructure Research agent
export const aiResearchAgent = new Agent({
  name: 'AI Technology Analyst',
  role: 'AI Technology Analyst',
  goal: 'Research AI applications in infrastructure',
  background: 'Expert in AI and smart city technologies',
  llmConfig: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  }
});

// Define the infrastructure analysis task
export const researchTask = new Task({
  id: 'boston-infrastructure-analysis',
  title: "Boston Infrastructure Analysis",
  description: `Analyze Boston's infrastructure focusing on:
    1. Current state of roads and bridges
    2. Public transportation systems (MBTA)
    3. Water and sewage systems
    4. Key maintenance issues
    5. Recommended improvements`,
  agent: researchAgent,
  async execute() {
    const analysisSteps = [
      {
        role: 'system',
        content: `${this.agent.background}
          You are conducting a thorough analysis of Boston's infrastructure.
          Base your analysis on current data and real infrastructure conditions.
          Provide specific examples and data points where possible.`
      },
      {
        role: 'user',
        content: this.description
      }
    ];

    try {
      // Initial research phase
      const initialAnalysis = await aiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: analysisSteps,
        temperature: 0.7
      });

      // Validation and enhancement phase
      const enhancedAnalysis = await aiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          ...analysisSteps,
          {
            role: 'assistant',
            content: initialAnalysis.choices[0].message.content
          },
          {
            role: 'system',
            content: `Review the analysis above. Enhance it with:
              1. Specific data points and statistics
              2. Recent infrastructure developments
              3. Critical areas needing immediate attention
              4. Cost estimates where applicable`
          }
        ],
        temperature: 0.5
      });

      return enhancedAnalysis.choices[0].message.content;
    } catch (error) {
      console.error('Infrastructure analysis error:', error);
      throw error;
    }
  }
});

// Define the AI research task
export const aiResearchTask = new Task({
  id: 'ai-infrastructure-research',
  title: "AI in Infrastructure Research",
  description: `Research AI applications in public infrastructure:
    1. Current AI implementations in infrastructure management
    2. Smart city technologies and their integration
    3. Key benefits and measurable impacts
    4. Implementation challenges and solutions
    5. Future possibilities and recommendations`,
  agent: aiResearchAgent,
  async execute() {
    const researchSteps = [
      {
        role: 'system',
        content: `${this.agent.background}
          You are researching current and potential AI applications in infrastructure.
          Focus on real-world implementations and concrete examples.
          Include specific case studies and measurable outcomes.`
      },
      {
        role: 'user',
        content: this.description
      }
    ];

    try {
      // Initial research phase
      const initialResearch = await aiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: researchSteps,
        temperature: 0.7
      });

      // Validation and enhancement phase
      const enhancedResearch = await aiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          ...researchSteps,
          {
            role: 'assistant',
            content: initialResearch.choices[0].message.content
          },
          {
            role: 'system',
            content: `Review the research above. Enhance it with:
              1. Specific AI implementation examples
              2. Real success metrics and ROI data
              3. Technical implementation details
              4. Integration challenges and solutions
              5. Future technology roadmap`
          }
        ],
        temperature: 0.5
      });

      return enhancedResearch.choices[0].message.content;
    } catch (error) {
      console.error('AI research error:', error);
      throw error;
    }
  }
});

// Create teams with their respective tasks
export const infrastructureTeam = new Team({
  name: 'Infrastructure Analysis Team',
  agents: [researchAgent],
  tasks: [researchTask],
  async onStart() {
    try {
      const output = await this.tasks[0].execute();
      return {
        result: output,
        tasks: [{
          id: this.tasks[0].id,
          output: output
        }]
      };
    } catch (error) {
      console.error('Error in infrastructure team:', error);
      throw error;
    }
  }
});

export const aiResearchTeam = new Team({
  name: 'AI Research Team',
  agents: [aiResearchAgent],
  tasks: [aiResearchTask],
  async onStart() {
    try {
      const output = await this.tasks[0].execute();
      return {
        result: output,
        tasks: [{
          id: this.tasks[0].id,
          output: output
        }]
      };
    } catch (error) {
      console.error('Error in AI research team:', error);
      throw error;
    }
  }
});
