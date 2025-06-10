import React, { useState, useCallback, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface PostCardTestProps {
    userId: string;
    sessionId: string;
    sort: string
}

export const PostCardTest: React.FC<PostCardTestProps> = ({ userId, sessionId, sort }) => {
    const [test, setTest] = useState<string>("Testing");
    const [posts, setPosts] = useState<any[]>(["Dummy post"]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    
    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:8000/posts?sort=${sort}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            } else {
                const errData = await res.json();
                setError(errData.detail || 'Failed to fetch posts');
            }
        } catch {
            setError('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    }, [userId, sort]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts, sessionId]);


    useEffect(() => {
        if (posts.length > 0) {
            console.log('First post object:', posts[0]);
            console.log('All keys in first post:', Object.keys(posts[0]));
        }
    }, [posts]);

    console.log("posts", posts)

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4 flex gap-4">
            {posts.map((post) => (
                <div key={post.id} className="flex gap-4 w-full">
                    <div className="flex flex-col items-center">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <ArrowUp className="h-5 w-5 text-gray-500" />
                        </button>
                        <span className="text-sm text-gray-700">{post.votes}</span>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <ArrowDown className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-grow">
                        <div className="text-sm text-gray-500 mb-1">
                            <span className="font-medium text-black">r/{post.subreddit}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">{post.content}</p>
                    </div>
                </div>
            ))}



            {/* Content Section
            <div className="flex-grow">
                <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium text-black">r/{test}</span> · Posted by u/{}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{}</h2>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap"></p>
            </div> */}
        </div>
    );
};