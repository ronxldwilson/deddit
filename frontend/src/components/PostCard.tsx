import React from "react";

interface PostCardProps {
  id: string;
  title: string;
  author: string;
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
    <div className="bg-white p-4 shadow-sm rounded-md hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        <div className="w-12 flex-shrink-0 text-center">
          <div className="font-bold text-lg">{votes}</div>
          <div className="text-xs text-gray-500">votes</div>
        </div>
        <div className="ml-4 flex-grow">
          <div className="text-sm text-gray-500 mb-1">
            r/{subreddit} • Posted by u/{author}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      </div>
    </div>
  );
};
