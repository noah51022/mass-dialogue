import React, { useState, useEffect } from 'react';
import { supabase, supabaseMisconfigured } from './supabaseClient';
import ReportPage from './ReportGenerate'; // Update import path
import AgentsPage from './components/AgentsPage.jsx';
import {
  infrastructureTeam,
  aiTeam,
  infrastructureTask,
  aiTask,
  infrastructureAgent,
  aiAgent
} from './routes.js';
import './App.css';

const MAX_POST_LENGTH = 5000;
const MAX_COMMENT_LENGTH = 2000;
const MAX_SEARCH_LENGTH = 200;

function sanitizeInput(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('forum');
  const [userUpvotedPosts, setUserUpvotedPosts] = useState({});
  const [filterKeyword, setFilterKeyword] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  // 🚀 Fetch Posts from Supabase
  const fetchPosts = async () => {
    if (supabaseMisconfigured) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*');

    if (error) console.error('Error fetching posts:', error);
    else {
      let filteredData = data;

      // Apply filter if filterKeyword exists
      if (filterKeyword) {
        filteredData = data.filter((post) =>
          post.text.toLowerCase().includes(filterKeyword.toLowerCase())
        );
      }

      // Sort the data based on sortBy
      if (sortBy === 'created_at') {
        filteredData = filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortBy === 'upvotes') {
        filteredData = filteredData.sort((a, b) => b.upvotes - a.upvotes);
      }

      setPosts(filteredData);

    }
  };

  useEffect(() => {
    if (supabaseMisconfigured) return;
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
  }, [filterKeyword, sortBy]); // Re-fetch posts when filterKeyword or sortBy changes

  // 🚀 Submit a New Post
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    const trimmed = newPost.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_POST_LENGTH) {
      alert(`Post must be under ${MAX_POST_LENGTH} characters.`);
      return;
    }
    const sanitized = sanitizeInput(trimmed);

    const { error } = await supabase
      .from('messages')
      .insert([{ text: sanitized, upvotes: 0 }]);

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
          <button
            className={`tab-button ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            Agents
          </button>
        </div>


        {/* Conditionally render the search-filter-container based on active tab */}
        {activeTab === 'forum' && (
          <div className="search-filter-container">
            <input
              type="text"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value.slice(0, MAX_SEARCH_LENGTH))}
              placeholder="Search posts by keyword..."
              className="search-bar"
              maxLength={MAX_SEARCH_LENGTH}
            />
            <div className="sorting-dropdown">
              <label htmlFor="sortBy">Sort by: </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="created_at">Date</option>
                <option value="upvotes">Upvotes</option>
              </select>
            </div>
          </div>
        )}
      </header>

      <main className="forum-content">
        {supabaseMisconfigured && (
          <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '8px', margin: '1rem', textAlign: 'center' }}>
            Supabase is not configured. Set <code>REACT_APP_SUPABASE_URL</code> and <code>REACT_APP_SUPABASE_KEY</code> in your <code>.env</code> file.
          </div>
        )}
        {activeTab === 'forum' ? (
          <>
            <div className="post-form">
              <form onSubmit={handleSubmitPost}>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  maxLength={MAX_POST_LENGTH}
                />
                <div className="post-form-buttons">
                  <button type="submit">Post Message</button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('agents')}
                    className="agent-analysis-button"
                  >
                    Get Agent Analysis
                  </button>
                </div>
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
                        className={`vote-button upvote-button ${userUpvotedPosts[post.id] ? 'active' : ''
                          }`}
                        title="Toggle Upvote"
                        style={{
                          color: userUpvotedPosts[post.id] ? '#2ecc71' : '#888', // Green when upvoted, Gray otherwise
                        }}
                      >
                        ↑
                      </button>
                      <span
                        className="vote-count upvote-count"
                        style={{
                          color: userUpvotedPosts[post.id] ? '#2ecc71' : '#888', // Green when upvoted, Gray otherwise
                        }}
                      >
                        {post.upvotes}
                      </span>
                    </div>
                  </div>
                  {/* ✅ Comment Section for Each Post */}
                  <CommentSection postId={post.id} fetchPosts={fetchPosts} />
                </div>
              ))}
            </div>
          </>
        ) : activeTab === 'report' ? (
          <ReportPage />
        ) : activeTab === 'agents' ? (
          <AgentsPage />
        ) : null}
      </main>
    </div>
  );
}

// 🚀 COMMENT SYSTEM
function CommentSection({ postId, fetchPosts }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 🚀 Fetch Comments for the Post
  const fetchComments = async () => {
    if (supabaseMisconfigured) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching comments:', error);
    else setComments(data || []);
  };

  useEffect(() => {
    if (supabaseMisconfigured) return;
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
    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      alert(`Comment must be under ${MAX_COMMENT_LENGTH} characters.`);
      return;
    }
    const sanitized = sanitizeInput(trimmed);

    const { error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, text: sanitized }]);

    if (error) console.error('Error adding comment:', error);
    else {
      setNewComment('');
      fetchComments(); // Refresh comments
      fetchPosts(); // Refresh all posts
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
              maxLength={MAX_COMMENT_LENGTH}
            />
            <button type="submit">Comment</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;