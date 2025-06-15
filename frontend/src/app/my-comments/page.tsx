'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { faker } from '@faker-js/faker';
import { Navbar } from '../../components/Navbar';
import { LeftSideBar } from '@/components/LeftSideBar';

interface User {
    id: string;
    username: string;
    bio?: string;
}

interface Post {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    post_id: number;
    post_title: string;
}

const sections = ['Comments'];

export default function CommentPage() {
    const searchParams = useSearchParams();
    const userIdRaw = ((searchParams.get('userId') === "undefined") || null) ?? localStorage.getItem('userId');
    const userId = userIdRaw === null ? undefined : userIdRaw;

    const [comments, setComments] = useState<Comment[]>([]);
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const commentsRes = await fetch(`http://localhost:8000/users/${userId}/comments`);

                setComments(await commentsRes.json());
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center bg-white h-screen">
                <p className='text-black'>Loading My Comments...</p>
            </div>
        );
    }

    const renderSection = () => {

        switch (activeSection) {
            case 'Comments':
                return comments.length ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white border p-4 rounded-lg shadow-sm">
                            <p className="text-gray-700">{comment.content}</p>
                            <span className="text-xs text-gray-400">
                                On <span className="font-semibold text-blue-700">{comment.post_title}</span> •{' '}
                                {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No comments yet.</p>
                );

            default:
                return null;
        }
    };
    // Get sessionId from window if available, otherwise undefined
    const sessionId = typeof window !== 'undefined' && (window as any).__SESSION_ID__ ? (window as any).__SESSION_ID__ : undefined;

    return (
        <>
            <div className="min-h-screen bg-white">

                <Navbar
                    userId={typeof userId === 'string' && userId ? userId : (localStorage.getItem('userId') || '')}
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
                <div className="flex max-w-full mx-auto px-6 py-20 space-x-8">

                    <LeftSideBar
                        userId={typeof userId === 'string' ? userId : undefined}
                        sessionId={sessionId}

                    />
                    <div className="flex max-w-6xl px-6 bg-white space-x-8">
                        {/* Sidebar */}
                        <aside className="w-60 max-h-fit bg-white border rounded-xl shadow-md p-4 space-y-4">
                            {sections.map((section) => (
                                <button
                                    key={section}
                                    onClick={() => setActiveSection(section)}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === section
                                        ? 'bg-blue-100 text-blue-800 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {section}
                                </button>
                            ))}
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 space-y-6">{renderSection()}</main>
                    </div>
                </div>
            </div>
        </>
    );
}
