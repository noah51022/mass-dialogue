import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ReportPage from './ReportGenerate'; // Update import path
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('forum'); // Add this for tab state
  const [userUpvotedPosts, setUserUpvotedPosts] = useState({}); // Stores upvoted posts per user session

  // 🚀 Fetch Posts from Supabase
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching posts:', error);
    else setPosts(data);
  };

  useEffect(() => {
    fetchPosts();

    // ✅ Subscribe to real-time updates for posts
    const postsSubscription = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        fetchPosts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
    };
  }, []);

  // 🚀 Submit a New Post
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ text: newPost, upvotes: 0 }]);

    if (error) {
      console.error('Error adding post:', error);
    } else {
      setNewPost('');
      fetchPosts();
    }
  };

  // 🚀 Handle Upvote Toggle (Upvote/Remove Upvote)
  const handleVote = async (postId) => {
    const post = posts.find((post) => post.id === postId);
    if (!post) return;

    const hasUpvoted = userUpvotedPosts[postId] || false; // Check if user has upvoted
    const newUpvotes = hasUpvoted ? post.upvotes - 1 : post.upvotes + 1; // Toggle upvote

    const { error } = await supabase
      .from('messages')
      .update({ upvotes: newUpvotes })
      .eq('id', postId);

    if (error) console.error('Error updating votes:', error);
    else {
      setUserUpvotedPosts((prev) => ({
        ...prev,
        [postId]: !hasUpvoted, // Toggle local state
      }));
      fetchPosts(); // Refresh posts to update UI
    }
  };

  return (
    <div className="App">
      <header className="forum-header">
        <h1>Mass Dialogue Forum</h1>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'forum' ? 'active' : ''}`}
            onClick={() => setActiveTab('forum')}
          >
            Forum
          </button>
          <button
            className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            Generate Report
          </button>
        </div>
      </header>

      <main className="forum-content">
        {activeTab === 'forum' ? (
          <>
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
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="post-author">Anonymous User</span>
                    <span className="post-timestamp">
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="post-content">{post.text}</div>
                  <div className="post-actions">
                    <div className="vote-buttons">
                      <button
                        onClick={() => handleVote(post.id)}
                        className={`vote-button upvote-button ${
                          userUpvotedPosts[post.id] ? 'active' : ''
                        }`}
                        title="Toggle Upvote"
                      >
                        ↑
                      </button>
                      <span className="vote-count upvote-count">
                        {post.upvotes}
                      </span>
                    </div>
                  </div>
                  {/* ✅ Comment Section for Each Post */}
                  <CommentSection postId={post.id} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <ReportPage />
        )}
      </main>
    </div>
  );
}

// 🚀 COMMENT SYSTEM
function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 🚀 Fetch Comments for the Post
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching comments:', error);
    else setComments(data || []);
  };

  useEffect(() => {
    fetchComments();

    // ✅ Subscribe to real-time updates for comments
    const commentsSubscription = supabase
      .channel(`comments-channel-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        fetchComments
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [postId]);

  // 🚀 Add New Comment (Auto-Refresh)
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, text: newComment }]);

    if (error) console.error('Error adding comment:', error);
    else {
      setNewComment('');
      fetchComments(); // ✅ Auto-refresh after comment submission
    }
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
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">Anonymous User</span>
                  <span className="comment-timestamp">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
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