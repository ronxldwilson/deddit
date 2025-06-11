'use client';
// app/posts/[postId]/page.tsx

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useSearchParams } from "next/navigation";


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
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);


  const searchParams = useSearchParams();


  useEffect(() => {
    async function fetchComments(postId: string) {
      try {
        const res = await fetch(`http://localhost:8000/posts/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    }

    if (typeof postId === "string") {
      fetchPost(postId);
      fetchComments(postId);
    }
  }, [postId]);

  async function fetchPost(postId: string) {
    try {
      const res = await fetch(`http://localhost:8000/posts/${postId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setPost(null);
      } else {
        const data = await res.json();
        setPost(data);
      }
    } catch (err) {
      console.error("Failed to fetch post", err);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }

  const handleCommentSubmit = async () => {
    const userID = searchParams.get("userID");
    if (!newComment.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/comments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          author_id: userID,
          post_id: post?.id,
          parent_id: null,
        }),
      });

      if (res.ok) {
        setNewComment("");
        const updatedComments = await fetch(`http://localhost:8000/posts/${post?.id}/comments`).then(r => r.json());
        setComments(updatedComments);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-black">Loading post...</div>;
  }

  if (!post) {
    return <div className="p-6 text-center text-red-600">Post not found.</div>;
  }

  function CommentThread({ comment }: { comment: Comment }) {
    const [collapsed, setCollapsed] = useState(false);
    const [voteCount, setVoteCount] = useState(comment.votes);
    
    const searchParams = useSearchParams();
    const userID = searchParams.get("userID");
    
    console.log(voteCount);
    console.log(comment.votes);
    const handleVote = async (value: 1 | -1) => {
      try {
        await fetch(`http://localhost:8000/comments/${comment.id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userID, value }),
        });

        // Optimistically update
        setVoteCount((prev) => prev + value);
      } catch (err) {
        console.error("Vote failed", err);
      }
    };

    return (
      <div className="pl-4 border-l border-gray-300">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 mb-1">
            u/{comment.author_username} · {new Date(comment.created_at).toLocaleString()}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs text-blue-600 ml-2 hover:underline"
          >
            [{collapsed ? "+" : "–"}]
          </button>
        </div>

        {!collapsed && (
          <>
            <div className="text-gray-800 mb-2">{comment.content}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => handleVote(1)} className="hover:text-red-500">▲</button>
              <span>{voteCount}</span>
              <button onClick={() => handleVote(-1)} className="hover:text-blue-500">▼</button>
            </div>
            {comment.children.map((child) => (
              <CommentThread key={child.id} comment={child} />
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center p-6 bg-gray-100 min-h-screen">
      <div className="flex max-w-4xl w-full gap-4">
        {/* Votes Sidebar */}
        <div className="flex flex-col items-center bg-white p-2 rounded-lg shadow h-fit">
          <button className="text-black hover:text-red-500">▲</button>
          <span className="font-semibold text-sm my-1 text-black">{post.votes}</span>
          <button className="text-black hover:text-blue-500">▼</button>
        </div>

        {/* Post and Comments */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">
            Posted by <span className="font-medium">u/{post.author.username}</span> in <span className="font-medium">r/{post.subreddit}</span>
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

          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentThread key={comment.id} comment={comment} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
