// src/App.jsx
import React, { useState } from 'react';
import { aiTeam } from '../routes.js';

function App() {
  const [result, setResult] = useState(null);

  // Function to start the workflow
  const startWorkflow = async () => {
    try {
      const workflowResult = await aiTeam.start();
      setResult(workflowResult.output);
    } catch (error) {
      console.error('Workflow execution error:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>KaibanJS AI Agent Workflow</h1>
      <button onClick={startWorkflow}>Start Workflow</button>
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Workflow Result</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;
