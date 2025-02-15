import React, { useState } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      content: newPost,
      author: 'Anonymous User',
      timestamp: new Date().toLocaleString(),
      upvotes: 0,
      downvotes: 0,
      comments: []
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleVote = (postId, voteType) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          upvotes: voteType === 'up' ? post.upvotes + 1 : post.upvotes,
          downvotes: voteType === 'down' ? post.downvotes + 1 : post.downvotes
        };
      }
      return post;
    }).sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)));
  };

  const handleAddComment = (postId, comment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now(),
            content: comment,
            author: 'Anonymous User',
            timestamp: new Date().toLocaleString()
          }]
        };
      }
      return post;
    }));
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
                <span className="post-author">{post.author}</span>
                <span className="post-timestamp">{post.timestamp}</span>
              </div>
              <div className="post-content">{post.content}</div>
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
                  <div className="vote-divider"></div>
                  <span className="vote-count downvote-count">{post.downvotes}</span>
                  <button
                    onClick={() => handleVote(post.id, 'down')}
                    className="vote-button downvote-button"
                    title="Downvote"
                  >
                    ↓
                  </button>
                </div>
                <CommentSection
                  comments={post.comments}
                  onAddComment={(comment) => handleAddComment(post.id, comment)}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function CommentSection({ comments, onAddComment }) {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
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
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-timestamp">{comment.timestamp}</span>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="comment-form">
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
