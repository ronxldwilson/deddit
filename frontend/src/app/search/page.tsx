// app/search/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LeftSideBar } from '../../components/LeftSideBar';

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

    useEffect(() => {
        if (query) {
            fetch(`http://localhost:8000/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(setResults)
                .catch(console.error);
        }
    }, [query]);


    return (
        <>
            <LeftSideBar/>
            <div className="max-w-3xl mx-auto mt-20 p-4 bg-white shadow-md rounded">
                <h1 className="text-2xl font-bold text-black mb-4">Search Results for "{query}"</h1>
                {results.length > 0 ? (
                    results.map((post) => (
                        <div
                            key={post.id}
                            className="border rounded p-4 mb-4 shadow hover:shadow-md transition"
                        >
                            <h2 className="text-lg font-semibold text-red-600">r/{post.subreddit}</h2>
                            <p className="text-xl font-bold mt-1">{post.title}</p>
                            <p className="text-sm text-gray-600 mt-2">{post.content}</p>
                        </div>
                    ))
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </>
    );
}
