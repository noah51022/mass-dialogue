// src/routes.js
import { Agent, Task, Team } from 'kaibanjs';

// Infrastructure Analysis
const infrastructureAgent = new Agent({
  name: 'Infrastructure Analyst',
  role: 'Infrastructure Analyst',
  goal: 'Analyze Boston infrastructure',
  background: 'Expert in urban infrastructure analysis with deep knowledge of civil engineering and public transportation systems',
  systemPrompt: `You are an expert infrastructure analyst tasked with providing a detailed analysis of Boston's infrastructure.
    Your analysis should be data-driven, specific, and actionable.
    Focus on current conditions, maintenance needs, and concrete improvement recommendations.
    Use real examples and cite specific locations or systems when possible.
    Avoid generic statements and provide measurable metrics where applicable.`,
  llmConfig: {
    provider: 'openai',
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1500
  }
});

const infrastructureTask = new Task({
  id: 'boston-infrastructure-analysis',
  title: "Boston Infrastructure Analysis",
  description: `Analyze Boston's infrastructure focusing on:
    1. Current state of roads and bridges (include specific examples and conditions)
    2. Public transportation systems (MBTA) - include recent performance metrics
    3. Water and sewage systems - focus on age, capacity, and maintenance needs
    4. Key maintenance issues with specific locations and estimated costs
    5. Recommended improvements with priority levels and timeline
    
    Format your response with clear sections and bullet points where appropriate.
    Include specific examples, locations, and data points to support your analysis.`,
  agent: infrastructureAgent,
  metadata: {
    requiresValidation: true,
    outputFormat: 'detailed-report'
  }
});

// AI Research
const aiAgent = new Agent({
  name: 'AI Technology Analyst',
  role: 'AI Technology Analyst',
  goal: 'Analyze current AI infrastructure implementations',
  background: 'Expert in AI applications for urban infrastructure with experience in smart city implementations',
  systemPrompt: `As an AI infrastructure analyst, provide a detailed analysis of existing AI implementations in public infrastructure.
    Do not conduct research - instead analyze and report on these specific implementations:
    
    1. Pittsburgh's Surtrac AI traffic system: Report actual performance metrics and results
    2. London Underground's AI predictive maintenance system: Include specific outcomes
    3. Singapore's Smart Nation sensors and systems: Detail real impact metrics
    4. Barcelona's smart city initiatives: Include actual efficiency gains
    5. Dubai's AI-powered infrastructure monitoring: Report concrete benefits
    
    For each system, you must include:
    - Specific technologies in use
    - Actual performance metrics
    - Real cost savings
    - Concrete implementation challenges
    - Verified results
    
    Base your analysis only on existing deployments and verified data.`,
  llmConfig: {
    provider: 'openai',
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1500
  }
});

const aiTask = new Task({
  id: 'ai-infrastructure-research',
  title: "AI in Infrastructure Research",
  description: `Analyze current AI applications in public infrastructure focusing on:
    1. Traffic Management Systems
       - Identify cities using AI traffic control (e.g., Pittsburgh's Surtrac)
       - List specific AI technologies deployed
       - Include traffic flow improvement metrics
       - Document cost savings and efficiency gains

    2. Public Transportation Optimization
       - Detail AI systems used in metro systems (e.g., London's Tube)
       - Describe predictive maintenance implementations
       - Show on-time performance improvements
       - Include passenger satisfaction metrics

    3. Infrastructure Monitoring
       - List cities using AI for bridge/road monitoring
       - Describe sensor systems and AI analysis methods
       - Include maintenance cost reductions
       - Show early warning success rates

    4. Utility Management
       - Detail smart grid AI implementations
       - Show energy efficiency improvements
       - Include waste reduction metrics
       - Document cost savings

    5. Emergency Response Systems
       - Describe AI emergency response systems
       - Show response time improvements
       - Include incident prediction accuracy
       - List cities with successful implementations`,
  agent: aiAgent,
  metadata: {
    requiresValidation: true,
    outputFormat: 'detailed-report'
  }
});

// Teams with enhanced configuration
const infrastructureTeam = new Team({
  name: 'Infrastructure Team',
  agents: [infrastructureAgent],
  tasks: [infrastructureTask],
  env: {
    OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY
  },
  config: {
    validateOutputs: true,
    maxRetries: 2,
    useStructuredOutput: true
  }
});

const aiTeam = new Team({
  name: 'AI Research Team',
  agents: [aiAgent],
  tasks: [aiTask],
  env: {
    OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY
  },
  config: {
    validateOutputs: true,
    maxRetries: 2,
    useStructuredOutput: true
  }
});

export {
  infrastructureAgent,
  infrastructureTask,
  infrastructureTeam,
  aiAgent,
  aiTask,
  aiTeam
};
