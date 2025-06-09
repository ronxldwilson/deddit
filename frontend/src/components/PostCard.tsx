import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react"; // optional, if using lucide icons

interface PostCardProps {
  id: string;
  title: string;
  author: string ;
  subreddit: string;
  votes: number;
}

export const PostCard: React.FC<PostCardProps> = ({
  title,
  author,
  subreddit,
  votes,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4 flex gap-4">
      {/* Voting Column */}
      <div className="flex flex-col items-center w-10 text-gray-500 select-none">
        <button className="hover:text-orange-500 transition-colors">
          <ArrowUp size={18} />
        </button>
        <span className="text-sm font-semibold">{votes}</span>
        <button className="hover:text-blue-500 transition-colors">
          <ArrowDown size={18} />
        </button>
      </div>

      {/* Post Content */}
      <div className="flex-grow">
        <div className="text-sm text-gray-500 mb-1">
          <span className="font-medium text-black">r/{subreddit}</span> · Posted by u/{author}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {/* Optional bottom meta bar for future use */}
        {/* <div className="mt-2 text-xs text-gray-400">42 comments · 3h ago</div> */}
      </div>
    </div>
  );
};
