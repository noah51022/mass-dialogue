// src/App.jsx
import React, { useState, useEffect } from 'react';
import { aiTeam, researchTask, aiResearchTask } from '../routes.js';
import '../styles/AgentsPage.css';

function AgentsPage() {
  const [infrastructureResult, setInfrastructureResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infrastructureState, setInfrastructureState] = useState('TODO');
  const [aiState, setAiState] = useState('TODO');

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

    // Add event listener
    if (aiTeam.events) {
      aiTeam.events.on('taskUpdate', handleTaskUpdate);
    }

    // Cleanup function
    return () => {
      if (aiTeam.events && aiTeam.events.off) {
        aiTeam.events.off('taskUpdate', handleTaskUpdate);
      }
    };
  }, []);

  const startWorkflow = async (taskId, setResult, setState) => {
    setState('TODO');
    setIsLoading(true);
    setError(null);

    try {
      const workflowResult = await aiTeam.start({
        tasks: [{
          id: taskId,
          input: {}
        }]
      });

      if (workflowResult && workflowResult.result) {
        setResult(workflowResult.result);
        setState('DONE');
      } else {
        throw new Error("No analysis results received");
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
      setError(error.message);
      setState('FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'TODO': return '#ffc107';
      case 'DOING': return '#17a2b8';
      case 'DONE': return '#28a745';
      case 'FAILED': return '#dc3545';
      default: return '#ddd';
    }
  };

  return (
    <div className="agents-page">
      <h1>Infrastructure Analysis System</h1>
      <div className="agents-grid">
        {/* Infrastructure Analysis Section */}
        <div className="agent-section">
          <h2>Infrastructure Analysis</h2>
          <div className="agents-controls">
            <button
              onClick={() => startWorkflow(researchTask.id, setInfrastructureResult, setInfrastructureState)}
              disabled={isLoading}
              className="agent-button"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Infrastructure'}
            </button>
          </div>

          <div className="state-container">
            <h3>Current State</h3>
            <div
              className={`state-indicator ${infrastructureState.toLowerCase()}`}
              style={{ borderColor: getStateColor(infrastructureState) }}
            >
              <div className="state-title">{researchTask.title}</div>
              <div className="state-status">{infrastructureState}</div>
              {isLoading && infrastructureState === 'DOING' && (
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
            </div>
          )}
        </div>

        {/* AI Research Section */}
        <div className="agent-section">
          <h2>AI in Infrastructure</h2>
          <div className="agents-controls">
            <button
              onClick={() => startWorkflow(aiResearchTask.id, setAiResult, setAiState)}
              disabled={isLoading}
              className="agent-button"
            >
              {isLoading ? 'Researching...' : 'Research AI Applications'}
            </button>
          </div>

          <div className="state-container">
            <h3>Current State</h3>
            <div
              className={`state-indicator ${aiState.toLowerCase()}`}
              style={{ borderColor: getStateColor(aiState) }}
            >
              <div className="state-title">{aiResearchTask.title}</div>
              <div className="state-status">{aiState}</div>
              {isLoading && aiState === 'DOING' && (
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
