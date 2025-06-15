'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { faker } from '@faker-js/faker';
import { Navbar } from '../../components/Navbar';
import { LeftSideBar } from '@/components/LeftSideBar';

import { logEvent, ActionType } from '../../services/analyticsLogger';
import { useRouter } from 'next/navigation';

interface Post {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

const sections = ['Saved Posts'];

declare global {
    interface Window {
        __SESSION_ID__?: string;
    }
}

function SavedPostsPageContent() {
    const searchParams = useSearchParams();
    const userId = (searchParams.get('userId') === 'undefined' || null) ? searchParams.get('userId') : localStorage.getItem('userId');

    const router = useRouter();

    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [loading, setLoading] = useState(true);

    // Get sessionId from window if available
    const sessionId = typeof window !== 'undefined' ? window.__SESSION_ID__ ?? '' : '';

    // Log page view on component mount
    useEffect(() => {
        if (sessionId) {
            logEvent(sessionId, ActionType.PAGE_VIEW, {
                text: `Saved Posts page viewed for user ${userId}`,
                page_url: window.location.href
            });
        }
    }, [sessionId, userId]);

    useEffect(() => {
        if (sessionId && savedPosts.length > 0 && activeSection === 'Saved Posts') {
            logEvent(sessionId, ActionType.CUSTOM, {
                text: 'Saved posts section viewed',
                custom_action: 'saved_posts_section_viewed',
                data: {
                    userId,
                    postsDisplayed: savedPosts.length,
                    isEmpty: savedPosts.length === 0
                }
            });
        }
    }, [sessionId, savedPosts.length, activeSection, userId]);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            setLoading(true);

            // Log data fetch start
            // if (sessionId) {
            //     logEvent(sessionId, ActionType.CUSTOM, {
            //         text: 'Started fetching saved posts data',
            //         custom_action: 'saved_posts_fetch_start',
            //         data: { userId }
            //     });
            // }

            try {
                const savedPostsRes = await fetch(`http://localhost:8000/users/${userId}/saved_posts`);

                if (savedPostsRes.ok) {
                    const postsData = await savedPostsRes.json();
                    setSavedPosts(postsData);

                    // Log successful data load
                    if (sessionId) {
                        logEvent(sessionId, ActionType.CUSTOM, {
                            text: 'Saved posts data loaded successfully',
                            custom_action: 'saved_posts_loaded',
                            data: {
                                userId,
                                postsCount: postsData.length,
                                responseStatus: savedPostsRes.status
                            }
                        });
                    }
                } else {
                    console.error('Failed to fetch saved posts:', savedPostsRes.status);

                    // Log fetch failure
                    if (sessionId) {
                        logEvent(sessionId, ActionType.CUSTOM, {
                            text: 'Failed to fetch saved posts',
                            custom_action: 'saved_posts_fetch_failed',
                            data: {
                                userId,
                                statusCode: savedPostsRes.status,
                                statusText: savedPostsRes.statusText
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching saved posts:', error);

                // Log error
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Error fetching saved posts data',
                        custom_action: 'saved_posts_fetch_error',
                        data: {
                            userId,
                            error: error?.toString(),
                            errorName: error instanceof Error ? error.name : 'Unknown'
                        }
                    });
                }
            } finally {
                setLoading(false);

                // Log data fetch completion
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Saved posts data fetch completed',
                        custom_action: 'saved_posts_fetch_complete',
                        data: { userId }
                    });
                }
            }
        };

        fetchData();
    }, [userId, sessionId]);

    if (loading) {
        return (
            <div className="flex justify-center bg-white items-center h-screen">
                <p className='text-black'>Loading Saved Posts...</p>
            </div>
        );
    }

    const handleSectionClick = (section: string) => {
        setActiveSection(section);

        // Log section navigation (though there's only one section currently)
        if (sessionId) {
            logEvent(sessionId, ActionType.CLICK, {
                text: `Clicked on ${section} section`,
                page_url: window.location.href,
                element_identifier: `section-${section.toLowerCase().replace(' ', '-')}`,
                coordinates: { x: 0, y: 0 }
            });
        }
    };

    const handlePostClick = (post: Post) => {
        // Log when user interacts with a saved post
        if (sessionId) {
            logEvent(sessionId, ActionType.CLICK, {
                text: `Clicked on saved post: ${post.title}`,
                page_url: window.location.href,
                element_identifier: `saved-post-${post.id}`,
                coordinates: { x: 0, y: 0 }
            });
        }

        // Route to the dedicated post page
        router.push(`/posts/${post.id}`);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'Saved Posts':
                // ✅ FIXED: Removed useEffect from here
                return savedPosts.length ? (
                    savedPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white border p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handlePostClick(post)}
                        >
                            <h3 className="font-semibold text-lg text-blue-700">{post.title}</h3>
                            <p className="text-gray-700">{post.content}</p>
                            <span className="text-xs text-gray-400">
                                Saved on {faker.date.past().toLocaleDateString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <div>
                        <p className="text-gray-500">No saved posts.</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="min-h-screen bg-white">
                <Navbar
                    userId={userId || localStorage.getItem('userId') || ''}
                    sessionId={sessionId || ''}
                    onLogout={() => {
                        // Log logout event
                        if (sessionId) {
                            logEvent(sessionId, ActionType.CUSTOM, {
                                text: 'User logged out from saved posts page',
                                custom_action: 'logout',
                                data: {
                                    userId,
                                    page: 'saved_posts',
                                    savedPostsCount: savedPosts.length
                                }
                            });
                        }

                        // Clear storage
                        localStorage.removeItem("userId");
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
                                    onClick={() => handleSectionClick(section)}
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

export default function SavedPostsPage() {
    return (
        <Suspense fallback={< div > Loading...</div >}>
            <SavedPostsPageContent />
        </Suspense >
    )
}