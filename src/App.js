import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [votedPosts, setVotedPosts] = useState(new Set()); // Tracks if a user has voted

  // 🚀 Fetch Posts from Supabase on Load
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('❌ Error fetching posts:', error);
      else setPosts(data);
    };

    fetchPosts();

    // ✅ Subscribe to real-time updates for new messages
    const subscription = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log('📩 New message received:', payload.new);
        setPosts((prevPosts) => [payload.new, ...prevPosts]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // 🚀 Submit a New Message
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    // ✅ Insert new message into Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert([{ text: newPost, upvotes: 0 }])
      .select();

    if (error) {
      console.error('❌ Error adding post:', error);
      alert('Error posting message. Check Supabase setup.');
      return;
    }

    console.log('✅ New Post Added:', data);

    // ✅ Update UI instantly
    if (data && data.length > 0) {
      setPosts((prevPosts) => [data[0], ...prevPosts]);
    }

    setNewPost(''); // Clear input field
  };

  // 🚀 Handle Upvote (Only Once)
  const handleUpvote = async (postId) => {
    if (votedPosts.has(postId)) return; // Prevent multiple votes

    const post = posts.find(post => post.id === postId);
    if (!post) return;

    const newUpvotes = post.upvotes + 1;

    // ✅ Update in Supabase
    const { error } = await supabase
      .from('messages')
      .update({ upvotes: newUpvotes })
      .eq('id', postId);

    if (error) {
      console.error('❌ Error updating votes:', error);
      return;
    }

    console.log(`✅ Upvoted post ${postId}`);

    // ✅ Update UI instantly
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, upvotes: newUpvotes } : p
      )
    );

    // ✅ Mark post as voted to prevent multiple votes
    setVotedPosts((prevVoted) => new Set(prevVoted).add(postId));
  };

  return (
    <div className="App">
      <header className="forum-header">
        <h1>Mass Dialogue Forum</h1>
      </header>

      <main className="forum-content">
        <div className="post-form">
          <form onSubmit={handleSubmitPost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
            <button type="submit">Post Message</button>
          </form>
        </div>

        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <span className="post-author">Anonymous User</span>
                  <span className="post-timestamp">{new Date(post.created_at).toLocaleString()}</span>
                </div>
                <div className="post-content">{post.text}</div>
                <div className="post-actions">
                  <div 
                    className="vote-buttons" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      flexDirection: 'row' 
                    }}
                  >
                    <span 
                      className="vote-count upvote-count" 
                      style={{ fontSize: '18px', fontWeight: 'bold' }}
                    >
                      {post.upvotes}
                    </span>
                    <span>Upvotes</span>
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className="vote-button upvote-button"
                      title="Upvote"
                      style={{ 
                        cursor: votedPosts.has(post.id) ? 'not-allowed' : 'pointer', 
                        fontSize: '16px', 
                        padding: '5px', 
                        opacity: votedPosts.has(post.id) ? 0.5 : 1 
                      }}
                      disabled={votedPosts.has(post.id)} // Disable button if already voted
                    >
                      ➕
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No messages yet. Be the first to post!</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;