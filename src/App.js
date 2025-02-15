import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  // 🚀 Fetch Posts from Supabase on Load
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('messages') // Table name in Supabase
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching posts:', error);
      else setPosts(data);
    };

    fetchPosts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // 🚀 Submit a New Post
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const { data, error } = await supabase
      .from('messages')
      .insert([{ text: newPost, upvotes: 0 }]);

    if (error) console.error('Error adding post:', error);
    else setNewPost('');
  };

  // 🚀 Handle Upvotes
  const handleVote = async (postId, voteType) => {
    const post = posts.find(post => post.id === postId);
    if (!post) return;

    const updatedUpvotes = voteType === 'up' ? post.upvotes + 1 : post.upvotes;

    const { error } = await supabase
      .from('messages')
      .update({ upvotes: updatedUpvotes })
      .eq('id', postId);

    if (error) console.error('Error updating votes:', error);
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
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <span className="post-author">Anonymous User</span>
                <span className="post-timestamp">{new Date(post.created_at).toLocaleString()}</span>
              </div>
              <div className="post-content">{post.text}</div>
              <div className="post-actions">
                <div className="vote-buttons">
                  <button
                    onClick={() => handleVote(post.id, 'up')}
                    className="vote-button upvote-button"
                    title="Upvote"
                  >
                    ↑
                  </button>
                  <span className="vote-count upvote-count">{post.upvotes}</span>
                </div>
              </div>
              <CommentSection postId={post.id} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 🚀 Fetch Comments for Post
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) console.error('Error fetching comments:', error);
      else setComments(data);
    };

    fetchComments();
  }, [postId]);

  // 🚀 Add New Comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, text: newComment }]);

    if (error) console.error('Error adding comment:', error);
    else setNewComment('');
  };

  return (
    <div className="comments-section">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="toggle-comments"
      >
        {comments.length} Comments
      </button>

      {isExpanded && (
        <>
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">Anonymous User</span>
                  <span className="comment-timestamp">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <div className="comment-content">{comment.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit">Comment</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;