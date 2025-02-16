// reportGenerator.js
import { supabase } from './supabaseClient.js';
import OpenAI from 'openai'; // Changed from require to import

// Function to generate report
export const generateReport = async (apiKey) => {
  try {
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

    return data.choices[0].message.content;
  } catch (err) {
    console.error('Full error:', err);
    throw new Error(`Failed to generate report: ${err.message}`);
  }
};