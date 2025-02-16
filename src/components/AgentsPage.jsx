// src/App.jsx
import React, { useState, useEffect } from 'react';
import { infrastructureTeam, aiResearchTeam, researchTask, aiResearchTask } from '../routes.js';
import '../styles/AgentsPage.css';

function AgentsPage() {
  const [infrastructureResult, setInfrastructureResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [isLoadingInfrastructure, setIsLoadingInfrastructure] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState(null);
  const [infrastructureState, setInfrastructureState] = useState('TO-DO');
  const [aiState, setAiState] = useState('TO-DO');

  // Set up event listener using useEffect
  useEffect(() => {
    const handleTaskUpdate = (event) => {
      console.log('Task update:', event);
      if (event.taskId === researchTask.id) {
        setInfrastructureState(event.status);
      } else if (event.taskId === aiResearchTask.id) {
        setAiState(event.status);
      }
    };

    if (infrastructureTeam.events) {
      infrastructureTeam.events.on('taskUpdate', handleTaskUpdate);
    }
    if (aiResearchTeam.events) {
      aiResearchTeam.events.on('taskUpdate', handleTaskUpdate);
    }

    return () => {
      if (infrastructureTeam.events && infrastructureTeam.events.off) {
        infrastructureTeam.events.off('taskUpdate', handleTaskUpdate);
      }
      if (aiResearchTeam.events && aiResearchTeam.events.off) {
        aiResearchTeam.events.off('taskUpdate', handleTaskUpdate);
      }
    };
  }, []);

  // Separate functions for each agent's workflow
  const startInfrastructureAnalysis = async () => {
    setInfrastructureState('TO-DO');
    setIsLoadingInfrastructure(true);
    setError(null);

    try {
      // Check if the state is "DOING"
      if (infrastructureState !== 'DOING') {
        setInfrastructureState('DOING'); // Update state to DOING
      }

      const workflowResult = await infrastructureTeam.start();

      if (workflowResult && workflowResult.result) {
        setInfrastructureResult(workflowResult.result);
        setInfrastructureState('DONE');
      } else {
        setInfrastructureState('FAILED'); // Update state to FAILED if no results
      }
    } catch (error) {
      console.error('Infrastructure workflow error:', error);
      setError(error.message);
      setInfrastructureState('FAILED');
    } finally {
      setIsLoadingInfrastructure(false);
    }
  };

  const startAIResearch = async () => {
    setAiState('TO-DO');
    setIsLoadingAI(true);
    setError(null);

    try {
      // Check if the state is "DOING"
      if (aiState !== 'DOING') {
        setAiState('DOING'); // Update state to DOING
      }

      const workflowResult = await aiResearchTeam.start();

      if (workflowResult && workflowResult.result) {
        setAiResult(workflowResult.result);
        setAiState('DONE');
      } else {
        setAiState('FAILED'); // Update state to FAILED if no results
      }
    } catch (error) {
      console.error('AI research workflow error:', error);
      setError(error.message);
      setAiState('FAILED');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'TO-DO': return '#ffc107';
      case 'DOING': return '#17a2b8';
      case 'DONE': return '#28a745';
      case 'FAILED': return '#dc3545';
      default: return '#ddd';
    }
  };

  return (
    <div className="agents-page">
      <h1>Infrastructure Analysis System</h1>
      <p style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}>(Powered by Agents 🤵‍♂️)</p>
      <div className="agents-grid">
        {/* Infrastructure Analysis Section */}
        <div className="agent-section">
          <h2>Boston Infrastructure Analysis</h2>
          <div className="agents-controls">
            <button
              onClick={startInfrastructureAnalysis}
              disabled={isLoadingInfrastructure}
              className="agent-button"
            >
              {isLoadingInfrastructure ? 'Analyzing...' : 'Analyze Infrastructure'}
            </button>
          </div>

          <div className="state-container">
            <div
              className={`state-indicator ${infrastructureState.toLowerCase()}`}
              style={{ borderColor: getStateColor(infrastructureState) }}
            >
              <div className="state-title">{researchTask.title}</div>
              <div className="state-status">{infrastructureState}</div>
              {isLoadingInfrastructure && infrastructureState === 'DOING' && (
                <div className="state-animation"></div>
              )}
            </div>
          </div>

          {infrastructureResult && (
            <div className="response-container">
              <h3>Analysis Results</h3>
              <div className="response-content">
                {infrastructureResult.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(infrastructureResult);
                  const button = document.querySelector('.copy-button');
                  button.textContent = 'Copied!';
                  setTimeout(() => {
                    button.textContent = 'Copy Results';
                  }, 2000);
                }}
              >
                Copy Results
              </button>
            </div>
          )}
        </div>

        {/* AI Research Section */}
        <div className="agent-section">
          <h2>AI in Infrastructure</h2>
          <div className="agents-controls">
            <button
              onClick={startAIResearch}
              disabled={isLoadingAI}
              className="agent-button"
            >
              {isLoadingAI ? 'Researching...' : 'Research AI Applications'}
            </button>
          </div>

          <div className="state-container">
            <div
              className={`state-indicator ${aiState.toLowerCase()}`}
              style={{ borderColor: getStateColor(aiState) }}
            >
              <div className="state-title">{aiResearchTask.title}</div>
              <div className="state-status">{aiState}</div>
              {isLoadingAI && aiState === 'DOING' && (
                <div className="state-animation"></div>
              )}
            </div>
          </div>

          {aiResult && (
            <div className="response-container">
              <h3>Research Results</h3>
              <div className="response-content">
                {aiResult.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(aiResult);
                  const button = document.querySelectorAll('.copy-button')[1];
                  button.textContent = 'Copied!';
                  setTimeout(() => {
                    button.textContent = 'Copy Results';
                  }, 2000);
                }}
              >
                Copy Results
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export default AgentsPage;
