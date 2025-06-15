'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { parseUserMentions } from '../../../utils/parseUserMentions';
import { Navbar } from "@/components/Navbar";
import { ArrowUp, ArrowDown, Bookmark, BookmarkCheck } from "lucide-react";
import { LeftSideBar } from "@/components/LeftSideBar";
import {
  logEvent,
  ActionType,
  ClickPayload,
  KeyPressPayload,
  HoverPayload,
  PageViewPayload,
} from '../../../services/analyticsLogger';

declare global {
  interface Window {
    __SESSION_ID__?: string;
  }
}

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

  const [savedCommentIds, setSavedCommentIds] = useState<Set<number>>(new Set());
  const [userID, setUserID] = useState<string | null>(searchParams.get("userID"));

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [savedComments, setSavedComments] = useState<{ [id: number]: 'saving' | 'saved' | null }>({});

  // Post voting state
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);

  const sessionId = typeof window !== 'undefined' ? window.__SESSION_ID__ ?? '' : '';


  // Initialize userID from localStorage if not in URL params
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!userID && storedUserId) {
      setUserID(storedUserId);
    }
  }, [userID]);

  useEffect(() => {
    if (typeof postId === "string") {
      fetchPost(postId);
      fetchComments(postId);
    }
  }, [postId]);

  console.log(savedComments)
  // Initialize vote count and saved state when post loads
  useEffect(() => {
    if (post && userID) {
      setVoteCount(post.votes);

      // Check if post is saved
      const savedPostsKey = `savedPosts:${userID}`;
      const savedPosts = JSON.parse(localStorage.getItem(savedPostsKey) || "[]");
      setIsSaved(savedPosts.includes(post.id.toString()));
    }
  }, [post, userID]);

  // Log page view - improved with error handling and more details
  useEffect(() => {
    if (sessionId && postId) {
      const pageViewPayload: PageViewPayload = {
        text: `User viewed Post page - Post ID: ${postId}`,
        page_url: window.location.href,
      };

      try {
        logEvent(sessionId, ActionType.PAGE_VIEW, pageViewPayload);
      } catch (error) {
        console.error('Analytics logging failed:', error);
      }
    }
  }, [postId, sessionId]);

  // Fetch saved comments when userID changes
  useEffect(() => {
    if (!userID) return;

    const fetchSavedComments = async () => {
      try {
        const res = await fetch(`http://localhost:8000/users/${userID}/saved_comments`);
        if (!res.ok) throw new Error("Failed to fetch saved comments");

        const data = await res.json();
        const ids = new Set<number>(data.map((comment: { id: number }) => comment.id));
        setSavedCommentIds(ids);
      } catch (err) {
        console.error("Error fetching saved comments:", err);
      }
    };

    fetchSavedComments();
  }, [userID]);

  async function fetchPost(postId: string) {
    try {
      const res = await fetch(`http://localhost:8000/posts/${postId}`, { cache: "no-store" });
      if (res.ok) {
        const postData = await res.json();
        setPost(postData);
      } else {
        console.error('Failed to fetch post:', res.status, res.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch post", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments(postId: string) {
    try {
      const res = await fetch(`http://localhost:8000/posts/${postId}/comments`);
      if (res.ok) {
        setComments(await res.json());
      } else {
        console.error('Failed to fetch comments:', res.status, res.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }

  // Helper function for analytics logging with error handling
  const logAnalyticsEvent = (actionType: ActionType, payload: ClickPayload | KeyPressPayload | HoverPayload | PageViewPayload) => {
    if (sessionId) {
      try {
        logEvent(sessionId, actionType, payload);
      } catch (error) {
        console.error('Analytics logging failed:', error);
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !userID || !post?.id) return;

    // Analytics - improved with more context
    const rect = document.activeElement?.getBoundingClientRect();
    const clickPayload: ClickPayload = {
      text: `User posted comment on post ${post.id}`,
      page_url: window.location.href,
      element_identifier: 'comment-submit',
      coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
    };
    logAnalyticsEvent(ActionType.CLICK, clickPayload);

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

        // Analytics - successful comment post
        logAnalyticsEvent(ActionType.PAGE_VIEW, {
          text: 'Comment posted successfully',
          page_url: window.location.href,
        });
      } else {
        console.error('Failed to post comment:', res.status, res.statusText);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleVote = async (type: "up" | "down" | "neutral") => {
    if (!post || !userID) return;

    const votePayload = {
      post_id: post.id,
      user_id: userID,
      vote: type,
    };

    try {
      const res = await fetch("http://localhost:8000/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(votePayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.new_votes !== undefined) {
          setVoteCount(data.new_votes);
        }

        // Analytics - successful vote
        logAnalyticsEvent(ActionType.PAGE_VIEW, {
          text: `Vote ${type} successful on post ${post.id}`,
          page_url: window.location.href,
        });
      } else {
        const error = await res.json();
        console.error("Vote failed", error.detail);
      }
    } catch (err) {
      console.error("Error voting on post", err);
    }
  };

  const handleUpvote = () => {
    if (!post || !userID) return;

    // Analytics with improved context
    const rect = document.activeElement?.getBoundingClientRect();
    const clickPayload: ClickPayload = {
      text: `User upvoted post ${post.id}`,
      page_url: window.location.href,
      element_identifier: 'post-upvote',
      coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
    };
    logAnalyticsEvent(ActionType.CLICK, clickPayload);

    if (voteState === "up") {
      setVoteState(null);
      setVoteCount(voteCount - 1);
      handleVote("neutral");
    } else if (voteState === "down") {
      setVoteState("up");
      setVoteCount(voteCount + 2);
      handleVote("up");
    } else {
      setVoteState("up");
      setVoteCount(voteCount + 1);
      handleVote("up");
    }
  };

  const handleDownvote = () => {
    if (!post || !userID) return;

    // Analytics with improved context
    const rect = document.activeElement?.getBoundingClientRect();
    const clickPayload: ClickPayload = {
      text: `User downvoted post ${post.id}`,
      page_url: window.location.href,
      element_identifier: 'post-downvote',
      coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
    };
    logAnalyticsEvent(ActionType.CLICK, clickPayload);

    if (voteState === "down") {
      setVoteState(null);
      setVoteCount(voteCount + 1);
      handleVote("neutral");
    } else if (voteState === "up") {
      setVoteState("down");
      setVoteCount(voteCount - 2);
      handleVote("down");
    } else {
      setVoteState("down");
      setVoteCount(voteCount - 1);
      handleVote("down");
    }
  };

  const handleSavePost = async () => {
    if (!post || !userID) return;

    // Analytics
    const rect = document.activeElement?.getBoundingClientRect();
    const clickPayload: ClickPayload = {
      text: `User ${isSaved ? 'unsaved' : 'saved'} post ${post.id}`,
      page_url: window.location.href,
      element_identifier: 'post-save',
      coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
    };
    logAnalyticsEvent(ActionType.CLICK, clickPayload);

    try {
      await fetch(`http://localhost:8000/api/save_post/${post.id}`, {
        method: "POST",
        body: JSON.stringify({ user_id: userID }),
        headers: { "Content-Type": "application/json" },
      });

      const savedPostsKey = `savedPosts:${userID}`;
      const savedPosts = JSON.parse(localStorage.getItem(savedPostsKey) || "[]");
      let updatedPosts;

      if (isSaved) {
        updatedPosts = savedPosts.filter((postId: string) => postId !== post.id.toString());
      } else {
        updatedPosts = [...savedPosts, post.id.toString()];
      }

      localStorage.setItem(savedPostsKey, JSON.stringify(updatedPosts));
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleSaveComment = async (id: number) => {
    if (!userID) return alert("Login required to save.");

    setSavedComments(prev => ({ ...prev, [id]: 'saving' }));

    // Analytics
    const rect = document.activeElement?.getBoundingClientRect();
    const clickPayload: ClickPayload = {
      text: `User saved comment ${id}`,
      page_url: window.location.href,
      element_identifier: `comment-save-${id}`,
      coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
    };
    logAnalyticsEvent(ActionType.CLICK, clickPayload);

    try {
      const res = await fetch(`http://localhost:8000/api/save_comment/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userID }),
      });

      if (res.ok) {
        setSavedCommentIds(prev => new Set(prev).add(id));
        setTimeout(() => setSavedComments(prev => ({ ...prev, [id]: null })), 1000);
      } else {
        console.error('Failed to save comment:', res.status, res.statusText);
        setSavedComments(prev => ({ ...prev, [id]: null }));
      }
    } catch (err) {
      console.error("Save failed", err);
      setSavedComments(prev => ({ ...prev, [id]: null }));
    }
  };

  function CommentThread({ comment }: { comment: Comment }) {
    const [collapsed, setCollapsed] = useState(false);
    const [commentVoteCount, setCommentVoteCount] = useState(comment.votes);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleReplySubmit = async () => {
      if (!replyText.trim() || !userID) return;

      // Analytics
      const rect = document.activeElement?.getBoundingClientRect();
      const clickPayload: ClickPayload = {
        text: `User replied to comment ${comment.id} wih ${replyText} `,
        page_url: window.location.href,
        element_identifier: `comment-reply-submit-${comment.id}`,
        coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
      };
      logAnalyticsEvent(ActionType.CLICK, clickPayload);

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
        } else {
          console.error('Failed to post reply:', res.status, res.statusText);
        }
      } catch (err) {
        console.error("Failed to post reply:", err);
      }
    };

    const handleCommentVote = async (value: 1 | -1) => {
      if (!userID) return;

      // Analytics
      const rect = document.activeElement?.getBoundingClientRect();
      const clickPayload: ClickPayload = {
        text: `User ${value === 1 ? 'upvoted' : 'downvoted'} comment ${comment.id}`,
        page_url: window.location.href,
        element_identifier: `comment-${value === 1 ? 'upvote' : 'downvote'}-${comment.id}`,
        coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
      };
      logAnalyticsEvent(ActionType.CLICK, clickPayload);

      try {
        const res = await fetch(`http://localhost:8000/comments/${comment.id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userID, value }),
        });

        if (res.ok) {
          const updated = await fetch(`http://localhost:8000/comments/${comment.id}`).then(r => r.json());
          setCommentVoteCount(updated.votes);
        } else {
          const error = await res.json();
          alert(error.detail);
        }
      } catch (err) {
        console.error("Vote failed", err);
      }
    };

    return (
      <div className="pl-4 border-l border-gray-300 my-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>{parseUserMentions(`u/${comment.author_username}`)} · {new Date(comment.created_at).toLocaleString()}</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleSaveComment(comment.id)}
              className="text-green-600 hover:text-green-800"
            >
              {savedCommentIds.has(comment.id) ? (
                <BookmarkCheck className="w-4 h-4 text-green-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => {
                setCollapsed(!collapsed);
                // Analytics for comment collapse/expand
                const rect = document.activeElement?.getBoundingClientRect();
                const clickPayload: ClickPayload = {
                  text: `User ${collapsed ? 'expanded' : 'collapsed'} comment ${comment.id}`,
                  page_url: window.location.href,
                  element_identifier: `comment-toggle-${comment.id}`,
                  coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
                };
                logAnalyticsEvent(ActionType.CLICK, clickPayload);
              }}
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
              <button
                onClick={() => handleCommentVote(1)}
                className="hover:text-red-500"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <span>{commentVoteCount}</span>
              <button
                onClick={() => handleCommentVote(-1)}
                className="hover:text-blue-500"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setReplying(!replying);
                  // Analytics
                  const rect = document.activeElement?.getBoundingClientRect();
                  const clickPayload: ClickPayload = {
                    text: `User clicked reply on comment ${comment.id}`,
                    page_url: window.location.href,
                    element_identifier: `comment-reply-btn-${comment.id}`,
                    coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
                  };
                  logAnalyticsEvent(ActionType.CLICK, clickPayload);
                }}
                className="text-blue-600 hover:underline ml-2"
              >
                Reply
              </button>
            </div>

            {replying && (
              <div className="mt-2 ml-4">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg text-black"
                  rows={2}
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    const payload: KeyPressPayload = {
                      text: 'User typed in reply input',
                      page_url: window.location.href,
                      element_identifier: `comment-reply-input-${comment.id}`,
                      key: e.key,
                    };
                    logAnalyticsEvent(ActionType.KEY_PRESS, payload);
                  }}
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
    );
  }

  if (loading) return <div className="p-6 text-center text-black">Loading post...</div>;
  if (!post) return <div className="p-6 text-center text-red-600">Post not found.</div>;

  return (
    <>
      <Navbar
        userId={userID || localStorage.getItem('userId') || ''}
        sessionId={sessionId || ''}
        onLogout={() => {
          // Analytics - logout event
          const rect = document.activeElement?.getBoundingClientRect();
          logAnalyticsEvent(ActionType.CLICK, {
            text: 'User logged out from post page',
            page_url: window.location.href,
            element_identifier: 'logout-button',
            coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
          });

          localStorage.removeItem("userId");
          sessionStorage.removeItem("sessionInitialized");
          sessionStorage.removeItem("sessionId");

          if (window.__SESSION_ID__) {
            delete window.__SESSION_ID__;
          }
          window.location.href = '/';
        }}
      />
      <div className="flex py-20 bg-white min-h-screen">
        <div className="px-4">
          <LeftSideBar
            userId={userID ?? undefined}
            sessionId={sessionId || ""}
          />
        </div>

        {/* Post Voting Column */}
        <div className="flex flex-col items-center bg-white p-2 rounded-lg shadow h-fit text-black">
          <button
            onClick={handleUpvote}
            onMouseEnter={() => {
              const payload: HoverPayload = {
                text: 'User hovered on post upvote',
                page_url: window.location.href,
                element_identifier: 'post-upvote',
              };
              logAnalyticsEvent(ActionType.HOVER, payload);
            }}
            className={`transition-colors ${voteState === "up" ? "text-orange-500" : "hover:text-orange-500"}`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm my-1">{voteCount}</span>
          <button
            onClick={handleDownvote}
            onMouseEnter={() => {
              const payload: HoverPayload = {
                text: 'User hovered on post downvote',
                page_url: window.location.href,
                element_identifier: 'post-downvote',
              };
              logAnalyticsEvent(ActionType.HOVER, payload);
            }}
            className={`transition-colors ${voteState === "down" ? "text-blue-500" : "hover:text-blue-500"}`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            className="mt-2 hover:text-green-600 transition-colors"
            onClick={handleSavePost}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-green-600" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Post and Comments */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
          <div className="text-lg text-gray-600 mb-2">
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
              onKeyDown={(e) => {
                const payload: KeyPressPayload = {
                  text: 'User typed in comment input',
                  page_url: window.location.href,
                  element_identifier: 'comment-input',
                  key: e.key,
                };
                logAnalyticsEvent(ActionType.KEY_PRESS, payload);
              }}
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
    </>
  );
}