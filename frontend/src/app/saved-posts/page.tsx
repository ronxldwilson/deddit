'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { faker } from '@faker-js/faker';
import { Navbar } from '../../components/Navbar';
import { LeftSideBar } from '@/components/LeftSideBar';

interface Post {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

const sections = ['Saved Posts'];

export default function SavedPostsPage() {
    const searchParams = useSearchParams();
    const userId = (searchParams.get('userId') === 'undefined' || null) ? searchParams.get('userId') : localStorage.getItem('userId');

    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const savedPostsRes = await fetch(`http://localhost:8000/users/${userId}/saved_posts`);

                setSavedPosts(await savedPostsRes.json());
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
            <div className="flex justify-center bg-white items-center h-screen">
                <p className='text-black'>Loading Saved Posts...</p>
            </div>
        );
    }

    const renderSection = () => {

        switch (activeSection) {
            case 'Saved Posts':
                return savedPosts.length ? (
                    savedPosts.map((post) => (
                        <div key={post.id} className="bg-white border p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg text-blue-700">{post.title}</h3>
                            <p className="text-gray-700">{post.content}</p>
                            <span className="text-xs text-gray-400">
                                Saved on {faker.date.past().toLocaleDateString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No saved posts.</p>
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
                    userId={userId || localStorage.getItem('userId') || ''}
                    sessionId={window.__SESSION_ID__ || ''}
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
                        userId={userId ?? undefined}
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
