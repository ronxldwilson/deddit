'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { LeftSideBar } from '@/components/LeftSideBar';
import { logEvent, ActionType } from '@/services/analyticsLogger';

interface Comment {
    id: number;
    content: string;
    created_at: string;
    post_id: number;
    post_title: string;
}

const sections = ['Comments'];

function CommentPageContent() {
    const searchParams = useSearchParams();
    const userIdRaw = ((searchParams.get('userId') === "undefined") || null) ?? localStorage.getItem('userId');
    const userId = userIdRaw === null ? undefined : userIdRaw;
    const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('sessionId') ?? undefined : undefined;

    const [comments, setComments] = useState<Comment[]>([]);
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            logEvent(sessionId, ActionType.PAGE_VIEW, {
                text: 'User visited My Comments page',
                page_url: window.location.href,
            });
        }
    }, [sessionId]);

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

    const handleSectionClick = (section: string) => {
        setActiveSection(section);
        if (sessionId) {
            const rect = document.activeElement?.getBoundingClientRect();
            logEvent(sessionId, ActionType.CLICK, {
                text: `User clicked section ${section}`,
                page_url: window.location.href,
                element_identifier: `sidebar-section-${section.toLowerCase()}`,
                coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
            });
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'Comments':
                return comments.length ? (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-white border p-4 rounded-lg shadow-sm"
                            id={`comment-${comment.id}`}
                            onMouseEnter={() => {
                                if (sessionId) {
                                    logEvent(sessionId, ActionType.HOVER, {
                                        text: `User hovered over comment ID ${comment.id}`,
                                        page_url: window.location.href,
                                        element_identifier: `comment-${comment.id}`,
                                    });
                                }
                            }}
                        >
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

    if (loading) {
        return (
            <div className="flex justify-center items-center bg-white h-screen">
                <p className='text-black'>Loading My Comments...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar
                userId={typeof userId === 'string' && userId ? userId : (localStorage.getItem('userId') || '')}
                sessionId={sessionId ?? ''}
                onLogout={() => {
                    localStorage.removeItem("userId");
                    sessionStorage.removeItem("sessionInitialized");
                    sessionStorage.removeItem("sessionId");
                    if (window.__SESSION_ID__) delete window.__SESSION_ID__;
                    window.location.href = '/';
                }}
            />

            <div className="flex max-w-full mx-auto px-6 py-20 space-x-8">
                <LeftSideBar
                    userId={typeof userId === 'string' ? userId : undefined}
                    sessionId={sessionId}
                />

                <div className="flex max-w-6xl px-6 bg-white space-x-8">
                    <aside className="w-60 max-h-fit bg-white border rounded-xl shadow-md p-4 space-y-4">
                        {sections.map((section) => (
                            <button
                                key={section}
                                id={`sidebar-section-${section.toLowerCase()}`}
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

                    <main className="flex-1 space-y-6">{renderSection()}</main>
                </div>
            </div>
        </div>
    );
}

export default function CommentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CommentPageContent />
        </Suspense>
    )
}