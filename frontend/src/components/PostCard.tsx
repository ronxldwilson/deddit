'use client';

import React, { useState } from "react";
import { ArrowUp, ArrowDown, Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { parseUserMentions } from "../utils/parseUserMentions";

interface PostCardProps {
  id: string;
  title: string;
  author: string;
  content: string;
  subreddit: string;
  votes: number;
  userID: string;
  isInitiallySaved: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  author,
  subreddit,
  votes,
  userID,
  content,
  isInitiallySaved,
}) => {
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null);
  const [voteCount, setVoteCount] = useState(votes);
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isVoting, setIsVoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleVote = async (type: "up" | "down" | "neutral") => {
    if (isVoting) return;
    setIsVoting(true);

    const numericPostId = parseInt(id);
    if (isNaN(numericPostId)) {
      console.error("Invalid post_id:", id);
      setIsVoting(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: numericPostId, user_id: userID, vote: type }),
      });

      const data = await res.json();
      if (data.new_votes !== undefined) {
        setVoteCount(data.new_votes);
      }
    } catch (err) {
      console.error("Voting failed", err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleUpvote = () => {
    if (isVoting) return;
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
    if (isVoting) return;
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

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await fetch(`http://localhost:8000/api/save_post/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userID }),
      });
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Save post failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-yellow rounded-xl shadow-lg hover:shadow-md transition-shadow border border-gray-100 p-4 flex gap-4">
      {/* Voting Column */}
      <div className="flex flex-col items-center w-10 text-gray-500 select-none">
        <button
          onClick={handleUpvote}
          className={`transition-colors ${voteState === "up" ? "text-orange-500" : "hover:text-orange-500"}`}
        >
          <ArrowUp size={18} />
        </button>
        <span className="text-sm font-semibold">{voteCount}</span>
        <button
          onClick={handleDownvote}
          className={`transition-colors ${voteState === "down" ? "text-blue-500" : "hover:text-blue-500"}`}
        >
          <ArrowDown size={18} />
        </button>

        <button
          onClick={handleSave}
          className="mt-2 hover:text-purple-600 transition-colors"
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      <Link href={`/posts/${id}?userID=${userID}`} className="block flex-grow">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            <span className="font-medium text-black">r/{subreddit}</span> · Posted by {parseUserMentions(`u/${author}`)}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-700 mt-2 whitespace-pre-wrap">
            {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
          </p>
        </div>
      </Link>
    </div>
  );
};
