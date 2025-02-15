import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/ReportPage.css';

const OpenAI = require('openai');
require('dotenv').config(); // Load environment variables from .env file

function ReportPage() {
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define the API key constant
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('API Key loaded:', !!apiKey); // Will log true if key exists, false if undefined
      // Fetch messages from Supabase
      const { data: messages, error: fetchError } = await supabase
        .from('messages')
        .select('text, created_at, upvotes')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!messages || messages.length === 0) {
        throw new Error('No messages found to generate report');
      }

      // Prepare messages for OpenAI
      const messagesText = messages.map(msg => ({
        text: msg.text,
        upvotes: msg.upvotes,
        date: new Date(msg.created_at).toLocaleDateString()
      }));

      console.log('Sending request to OpenAI...'); // Debug log

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "You are a helpful assistant that summarizes forum discussions."
          }, {
            role: "user",
            content: `Please provide a concise summary of these forum messages, highlighting the main topics, trends, and most engaged discussions based on upvotes: ${JSON.stringify(messagesText)}`
          }],
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `OpenAI API failed with status ${response.status}: ${errorData ? JSON.stringify(errorData) : 'No error details available'
          }`
        );
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Unexpected response format from OpenAI');
      }

      setReport(data.choices[0].message.content);
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
        onClick={generateReport}
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