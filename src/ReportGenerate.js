import React, { useState } from 'react';
import '../src/ReportGenerate.css';
import { generateReport } from '../src/reportGenerator.js';

function ReportPage() {
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Define the API key constant
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('API Key loaded:', !!apiKey); // Will log true if key exists, false if undefined
      
      // Call the imported generateReport function
      const reportContent = await generateReport(apiKey);
      setReport(reportContent);
      
    } catch (err) {
      console.error('Full error:', err); // Debug log
      setError(`Failed to generate report: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-page">
      <h1>Forum Report Generator</h1>
      <button
        onClick={handleGenerateReport}
        disabled={isLoading}
        className="generate-button"
      >
        {isLoading ? 'Generating...' : 'Generate Report'}
      </button>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {report && (
        <div className="report-container">
          <h2>Forum Summary Report</h2>
          <div className="report-content">
            {report.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPage;