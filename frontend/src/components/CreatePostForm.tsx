'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    logEvent,
    ActionType,
    ClickPayload,
    KeyPressPayload,
    HoverPayload,
    PageViewPayload,
} from '../services/analyticsLogger'; // adjust path

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

    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        const sid = sessionStorage.getItem("sessionId");
        if (sid) {
            setSessionId(sid);
        } else {
            console.warn("Session ID not found in sessionStorage.");
        }
    }, []);

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

        const pageViewPayload: PageViewPayload = {
            text: 'User viewed Create Post page',
            page_url: window.location.href,
        };
        logEvent(sessionId, ActionType.PAGE_VIEW, pageViewPayload);
    }, [searchParams, userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!effectiveUserId) {
            alert('User ID not found. Please log in again.');
            return;
        }

        if (isSubmitting) return;

        const submitBtn = document.getElementById('submit-post-button');
        const rect = submitBtn?.getBoundingClientRect();

        const clickPayload: ClickPayload = {
            text: 'User clicked Submit Post button',
            page_url: window.location.href,
            element_identifier: 'submit-post-button',
            coordinates: {
                x: rect?.left ?? 0,
                y: rect?.top ?? 0,
            },
        };
        logEvent(sessionId, ActionType.CLICK, clickPayload);

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
        }, 4000);

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
                        onChange={(e) => {
                            setTitle(e.target.value);
                            const payload: KeyPressPayload = {
                                text: 'User typed in post title field',
                                page_url: window.location.href,
                                element_identifier: 'title-input',
                                key: e.nativeEvent instanceof KeyboardEvent ? e.nativeEvent.key : '',
                            };
                            logEvent(sessionId, ActionType.KEY_PRESS, payload);
                        }}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        id="title-input"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                        placeholder="Write your post content here..."
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            const payload: KeyPressPayload = {
                                text: 'User typed in content field',
                                page_url: window.location.href,
                                element_identifier: 'content-textarea',
                                key: e.nativeEvent instanceof KeyboardEvent ? e.nativeEvent.key : '',
                            };
                            logEvent(sessionId, ActionType.KEY_PRESS, payload);
                        }}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        id="content-textarea"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Subreddit</label>
                    <select
                        id="subreddit-dropdown"
                        value={subreddit}
                        onChange={(e) => {
                            const selectedSubreddit = e.target.value;
                            setSubreddit(selectedSubreddit);

                            const payload: ClickPayload = {
                                text: `User selected subreddit: ${selectedSubreddit}`,
                                page_url: window.location.href,
                                element_identifier: 'subreddit-dropdown',
                                coordinates: {
                                    x: 0,
                                    y: 0
                                }
                            };

                            logEvent(sessionId, ActionType.CLICK, payload);
                        }}
                        onMouseEnter={() => {
                            const payload: HoverPayload = {
                                text: 'User hovered on subreddit dropdown',
                                page_url: window.location.href,
                                element_identifier: 'subreddit-dropdown',
                            };

                            logEvent(sessionId, ActionType.HOVER, payload);
                        }}
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
                        id="submit-post-button"
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
