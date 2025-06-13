'use client';

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { parseUserMentions } from '../../../utils/parseUserMentions';
import { Navbar } from "@/components/Navbar";

interface Author {
  username: string;
  id: string;
  created_at: string;
  updated_at: string | null;
  password: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  author_username: string;
  parent_id: number | null;
  children: Comment[];
  votes: number;
  post_id: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  subreddit: string;
  votes: number;
  userID: number;
  author: Author;
  comments?: Comment[];
}

export default function PostPage() {
  const { postId } = useParams();
  const searchParams = useSearchParams();
  const userID = searchParams.get("userID");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [saveStatus, setSaveStatus] = useState<null | 'saving' | 'saved'>(null);
  const [savedComments, setSavedComments] = useState<{ [id: number]: 'saving' | 'saved' | null }>({});


  useEffect(() => {
    if (typeof postId === "string") {
      fetchPost(postId);
      fetchComments(postId);
    }
  }, [postId]);

  async function fetchPost(postId: string) {
    try {
      const res = await fetch(`http://localhost:8000/posts/${postId}`, { cache: "no-store" });
      if (res.ok) setPost(await res.json());
    } catch (err) {
      console.error("Failed to fetch post", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments(postId: string) {
    try {
      const res = await fetch(`http://localhost:8000/posts/${postId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !userID || !post?.id) return;

    try {
      const res = await fetch("http://localhost:8000/comments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          author_id: userID,
          post_id: post.id,
          parent_id: null,
        }),
      });

      if (res.ok) {
        setNewComment("");
        fetchComments(String(post.id));
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleSave = async (id: number, type: 'post' | 'comment') => {
    if (!userID) return alert("Login required to save.");

    const endpoint = type === 'post' ? `/api/save_post/${id}` : `/api/save_comment/${id}`;
    if (type === 'comment') {
      setSavedComments(prev => ({ ...prev, [id]: 'saving' }));
    } else {
      setSaveStatus("saving");
    }

    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userID }),
      });

      if (res.ok) {
        if (type === 'comment') {
          setSavedComments(prev => ({ ...prev, [id]: 'saved' }));
          setTimeout(() => setSavedComments(prev => ({ ...prev, [id]: null })), 1000);
        } else {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus(null), 1000);
        }
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };


  function CommentThread({ comment }: { comment: Comment }) {
    const [collapsed, setCollapsed] = useState(false);
    const [voteCount, setVoteCount] = useState(comment.votes);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleReplySubmit = async () => {
      if (!replyText.trim() || !userID) return;

      try {
        const res = await fetch("http://localhost:8000/comments/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: replyText,
            author_id: userID,
            post_id: comment.post_id,
            parent_id: comment.id,
          }),
        });

        if (res.ok) {
          setReplyText("");
          setReplying(false);
          fetchComments(String(comment.post_id));
        }
      } catch (err) {
        console.error("Failed to post reply:", err);
      }
    };

    const handleVote = async (value: 1 | -1) => {
      try {
        const res = await fetch(`http://localhost:8000/comments/${comment.id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userID, value }),
        });

        if (res.ok) {
          const updated = await fetch(`http://localhost:8000/comments/${comment.id}`).then(r => r.json());
          setVoteCount(updated.votes);
        } else {
          const error = await res.json();
          alert(error.detail);
        }
      } catch (err) {
        console.error("Vote failed", err);
      }
    };

    return (
      <>
        <div className="pl-4 border-l border-gray-300 my-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{parseUserMentions(`u/${comment.author_username}`)} · {new Date(comment.created_at).toLocaleString()}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(comment.id, "comment")}
                className="text-green-600 hover:underline"
              >
                {
                  savedComments[comment.id] === "saving"
                    ? "Saving..."
                    : savedComments[comment.id] === "saved"
                      ? "Saved!"
                      : "Save"
                }
              </button>

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-blue-600 hover:underline"
              >
                [{collapsed ? "+" : "–"}]
              </button>
            </div>
          </div>

          {!collapsed && (
            <>
              <div className="text-gray-800 mb-2">{comment.content}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <button onClick={() => handleVote(1)} className="hover:text-red-500">▲</button>
                <span>{voteCount}</span>
                <button onClick={() => handleVote(-1)} className="hover:text-blue-500">▼</button>
                <button onClick={() => setReplying(!replying)} className="text-blue-600 hover:underline ml-2">Reply</button>
              </div>

              {replying && (
                <div className="mt-2 ml-4">
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg text-black"
                    rows={2}
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    className="mt-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={handleReplySubmit}
                  >
                    Submit Reply
                  </button>
                </div>
              )}

              {comment.children.map((child) => (
                <CommentThread key={child.id} comment={child} />
              ))}
            </>
          )}
        </div>
      </>
    );
  }

  if (loading) return <div className="p-6 text-center text-black">Loading post...</div>;
  if (!post) return <div className="p-6 text-center text-red-600">Post not found.</div>;

  return (
    <>
    <Navbar userId="{userID}" />
      <div className="flex justify-center p-20 bg-gray-100 min-h-screen">
        <div className="flex max-w-4xl w-full gap-4">
          {/* Votes Sidebar */}
          <div className="flex flex-col items-center bg-white p-2 rounded-lg shadow h-fit">
            <button className="text-black hover:text-red-500">▲</button>
            <span className="font-semibold text-sm my-1 text-black">{post.votes}</span>
            <button className="text-black hover:text-blue-500">▼</button>
            <button
              className="text-xs mt-2 text-green-600 hover:underline"
              onClick={() => handleSave(post.id, "post")}
            >
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Post"}
            </button>
          </div>

          {/* Post and Comments */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-2">
              Posted by <span className="font-medium">{parseUserMentions(`u/${post.author.username}`)}</span> in <span className="font-medium">r/{post.subreddit}</span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-black">{post.title}</h1>
            <div className="text-gray-800 whitespace-pre-wrap mb-6">{post.content}</div>

            {/* Comment Input */}
            <div className="mb-6">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg mb-2 text-black"
                rows={3}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleCommentSubmit}
              >
                Post Comment
              </button>
            </div>

            {/* Comment Threads */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentThread key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
