import React, { useState, useEffect } from 'react';
import './ReportGenerate.css';
import { supabase } from './supabaseClient';

function ReportGenerate() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('text, created_at, upvotes')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    if (!apiKey.trim()) {
      setError('Please enter a valid OpenAI API key');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      
      if (messages.length === 0) {
        throw new Error('No messages found to generate report');
      }

      // Prepare messages for OpenAI
      const messagesText = messages.map(msg => ({
        text: msg.text,
        upvotes: msg.upvotes,
        date: new Date(msg.created_at).toLocaleDateString()
      }));

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
            content: `Take in these messages and then give a list of important posts that have been submitted.
            Prioritize the posts that have the most upvotes, only give a max of 3 posts. and then after giving a list then provide a summary of the posts.
            Don't give the posts in a JSON format. Use a regular text format. ${JSON.stringify(messagesText)}`
          }],
          max_tokens: 250
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `OpenAI API failed with status ${response.status}: ${errorData ? JSON.stringify(errorData) : 'No error details available'}`
        );
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Unexpected response format from OpenAI');
      }

      setReport(data.choices[0].message.content);
    } catch (err) {
      console.error('Full error:', err);
      setError(`Failed to generate report: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="report-container">
      <h2>Generate Report</h2>
      
      <div className="api-key-section">
        <label htmlFor="api-key">OpenAI API Key:</label>
        <input
          type="password"
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
        />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        onClick={generateReport} 
        disabled={generating || loading || messages.length === 0}
        className="generate-button"
      >
        {generating ? 'Generating...' : 'Generate Report'}
      </button>
      
      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p>No messages found to generate report</p>
      ) : (
        <div className="message-count">
          <p>{messages.length} messages available for report generation</p>
        </div>
      )}
      
      {report && (
        <div className="report-result">
          <h3>Generated Report</h3>
          <div className="report-content">
            {report.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportGenerate;