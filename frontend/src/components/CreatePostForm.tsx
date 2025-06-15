'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CreatePostFormProps {
    userId: string | null;
}

const availableSubreddits = [
    'general',
    'technology',
    'gaming',
    'science',
    'movies',
    'music',
    'books',
    'sports',
];

export const CreatePostForm = ({ userId }: CreatePostFormProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [effectiveUserId, setEffectiveUserId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subreddit, setSubreddit] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const searchUserId = searchParams.get('userId');
        if (searchUserId && searchUserId !== 'undefined') {
            setEffectiveUserId(searchUserId);
        } else if (userId && userId !== 'undefined') {
            setEffectiveUserId(userId);
        } else {
            const localStorageUserId = localStorage.getItem('userId');
            if (localStorageUserId) {
                setEffectiveUserId(localStorageUserId);
            }
        }
    }, [searchParams, userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!effectiveUserId) {
            alert('User ID not found. Please log in again.');
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);

        // Add a forced delay to prevent double click burst
        setTimeout(() => {
            setIsSubmitting(false);
        }, 2000); // 2 seconds delay (you can adjust this)

        try {
            const res = await fetch('/api/create-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    subreddit,
                    user_id: effectiveUserId,
                }),
            });

            if (res.ok) {
                router.push('/');
            } else {
                alert('Error creating post');
            }
        } catch (err) {
            console.error(err);
            alert('Unexpected error occurred.');
        }
    };

    return (
        <div className="flex justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 space-y-6 transition duration-200"
            >
                <h2 className="text-3xl font-semibold text-gray-800">Create a New Post</h2>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        placeholder="Enter your post title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                        placeholder="Write your post content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Subreddit</label>
                    <select
                        value={subreddit}
                        onChange={(e) => setSubreddit(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    >
                        {availableSubreddits.map((sub) => (
                            <option key={sub} value={sub}>
                                {sub}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-semibold py-2 px-4 rounded-lg transition duration-150 ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};
