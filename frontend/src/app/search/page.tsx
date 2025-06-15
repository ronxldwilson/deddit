'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LeftSideBar } from '../../components/LeftSideBar';
import { Navbar } from '../../components/Navbar';
import Link from 'next/link';

interface Post {
    id: string;
    title: string;
    content: string;
    subreddit: string;
}

export default function SearchPage() {
    const params = useSearchParams();
    const query = params.get('q') || '';
    const [results, setResults] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') || '' : '';

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetch(`http://localhost:8000/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(setResults)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [query]);

    console.log(results)


    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar
                userId={userId}
                sessionId={sessionId}
                onLogout={() => {
                    // Clear userId
                    localStorage.removeItem("userId");
                    // setUserId(null);

                    // Clear session data
                    // setSessionId(null);
                    sessionStorage.removeItem("sessionInitialized");
                    sessionStorage.removeItem("sessionId");

                    // Clear global session reference
                    if (window.__SESSION_ID__) {
                        delete window.__SESSION_ID__;
                    }
                    window.location.href = '/'; // Redirect to home
                }}
            />

            <div className="flex max-w-7xl mx-auto pt-20 px-6 space-x-6">
                <aside className="w-64">
                    <LeftSideBar userId={userId} />
                </aside>

                <main className="flex-1 bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Search Results for <span className="text-blue-600">"{query}"</span>
                    </h1>

                    {loading ? (
                        <p className="text-gray-600">Loading...</p>
                    ) : results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((post) => (
                                <Link key={post.id} href={`/posts/${post.id}?userID=${userId}`}>
                                    <div className="border border-gray-200 p-4 rounded-lg hover:shadow transition cursor-pointer">
                                        <h2 className="text-sm text-black font-semibold">r/{post.subreddit}</h2>
                                        <p className="text-lg font-bold mt-1 text-gray-900">{post.title}</p>
                                        <p className="text-sm text-gray-700 mt-2">{post.content}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No results found.</p>
                    )}
                </main>
            </div>
        </div>
    );
}
