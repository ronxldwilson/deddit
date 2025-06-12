// components/CreatePostForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreatePostFormProps {
    userId: string | null; // Assuming userId is a string
}

export const CreatePostForm = ({ userId }: CreatePostFormProps) => {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subreddit, setSubreddit] = useState('general');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/create-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                content,
                subreddit,
                user_id: userId,
            }),
        });

        if (res.ok) {
            router.push('/');
        } else {
            alert('Error creating post');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold text-black">Create a New Post</h2>

            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border px-4 py-2 rounded text-black"
                required
            />

            <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border px-4 py-2 rounded h-40 text-black"
                required
            />

            <input
                type="text"
                placeholder="Subreddit (default: general)"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="w-full border px-4 py-2 rounded text-black"
            />

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Submit
            </button>
        </form>
    );
};
