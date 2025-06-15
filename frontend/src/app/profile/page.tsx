'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { faker } from '@faker-js/faker';
import { Navbar } from '../../components/Navbar';
import { LeftSideBar } from '@/components/LeftSideBar';


import { logEvent, ActionType } from '../../services/analyticsLogger'

import { Trash2, Pencil } from 'lucide-react';

interface User {
    id: string;
    username: string;
    bio?: string;
}

interface Post {
    subreddit: string;
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
    parent_id?: number | null;
}

const sections = ['Profile', 'Posts', 'Comments', 'Saved Posts', 'Saved Comments'];

// Extract the component that uses useSearchParams into a separate component
function ProfileContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('users') ? searchParams.get('users') : localStorage.getItem('userId');
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSessionId((window as any).__SESSION_ID__ ?? '');
        }
    }, []);

    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [savedComments, setSavedComments] = useState<Comment[]>([]);
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [loading, setLoading] = useState(true);

    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');

    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');

    const getSeededFaker = (seedString: string) => {
        const seed = Array.from(seedString).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        faker.seed(seed);
        return faker;
    };

    // Log page view on component mount
    useEffect(() => {
        if (sessionId) {
            logEvent(sessionId, ActionType.PAGE_VIEW, {
                text: `Profile page viewed for user ${userId}`,
                page_url: window.location.href
            });
        }
    }, [sessionId, userId]);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [userRes, postsRes, commentsRes, savedPostsRes, savedCommentsRes] = await Promise.all([
                    fetch(`http://localhost:8000/users/${userId}`),
                    fetch(`http://localhost:8000/users/${userId}/posts`),
                    fetch(`http://localhost:8000/users/${userId}/comments`),
                    fetch(`http://localhost:8000/users/${userId}/saved_posts`),
                    fetch(`http://localhost:8000/users/${userId}/saved_comments`)
                ]);

                const userData = await userRes.json();
                const postsData = await postsRes.json();
                const commentsData = await commentsRes.json();
                const savedPostsData = await savedPostsRes.json();
                const savedCommentsData = await savedCommentsRes.json();

                setUser(userData);
                setPosts(postsData);
                setComments(commentsData);
                setSavedPosts(savedPostsData);
                setSavedComments(savedCommentsData);

                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Profile data loaded successfully',
                        custom_action: 'profile_data_loaded',
                        data: {
                            userId,
                            postsCount: postsData.length,
                            commentsCount: commentsData.length,
                            savedPostsCount: savedPostsData.length,
                            savedCommentsCount: savedCommentsData.length
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Error fetching profile data',
                        custom_action: 'profile_fetch_error',
                        data: { error: error?.toString(), userId }
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, sessionId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>User not found.</p>
            </div>
        );
    }

    const handleSectionClick = (section: string) => {
        setActiveSection(section);

        // Log section navigation
        if (sessionId) {
            logEvent(sessionId, ActionType.CLICK, {
                text: `Clicked on ${section} section`,
                page_url: window.location.href,
                element_identifier: `section-${section.toLowerCase().replace(' ', '-')}`,
                coordinates: { x: 0, y: 0 }
            });
        }
    };

    const handleDeletePost = async (postId: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this post?');
        if (!confirmDelete) {
            // Log cancellation
            if (sessionId) {
                logEvent(sessionId, ActionType.CUSTOM, {
                    text: 'Post deletion cancelled',
                    custom_action: 'post_delete_cancelled',
                    data: { postId }
                });
            }
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/posts/${postId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setPosts((prev) => prev.filter((post) => post.id !== postId));
                setSavedPosts((prev) => prev.filter((post) => post.id !== postId));

                // Log successful deletion
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Post deleted successfully',
                        custom_action: 'post_deleted',
                        data: { postId, userId }
                    });
                }
            } else {
                console.error('Failed to delete post');
                // Log deletion failure
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Failed to delete post',
                        custom_action: 'post_delete_failed',
                        data: { postId, statusCode: res.status }
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            // Log error
            if (sessionId) {
                logEvent(sessionId, ActionType.CUSTOM, {
                    text: 'Error deleting post',
                    custom_action: 'post_delete_error',
                    data: { postId, error: error?.toString() }
                });
            }
        }
    };

    const handleEditPostStart = (post: Post) => {
        setEditingPostId(post.id);
        setEditedTitle(post.title);
        setEditedContent(post.content);

        // Log edit start
        if (sessionId) {
            logEvent(sessionId, ActionType.CLICK, {
                text: 'Started editing post',
                page_url: window.location.href,
                element_identifier: `edit-post-${post.id}`,
                coordinates: { x: 0, y: 0 }
            });
        }
    };

    const handleSaveEdit = async (postId: string) => {
        try {
            const res = await fetch(`http://localhost:8000/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editedTitle,
                    content: editedContent,
                }),
            });

            if (res.ok) {
                const updatedPost = await res.json();
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId ? updatedPost : post
                    )
                );
                setEditingPostId(null);

                // Log successful edit
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Post edited successfully',
                        custom_action: 'post_edited',
                        data: {
                            postId,
                            titleChanged: editedTitle !== posts.find(p => p.id === postId)?.title,
                            contentChanged: editedContent !== posts.find(p => p.id === postId)?.content
                        }
                    });
                }
            } else {
                console.error('Failed to save edit');
                // Log edit failure
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Failed to save post edit',
                        custom_action: 'post_edit_failed',
                        data: { postId, statusCode: res.status }
                    });
                }
            }
        } catch (error) {
            console.error('Error saving post edit:', error);
            // Log error
            if (sessionId) {
                logEvent(sessionId, ActionType.CUSTOM, {
                    text: 'Error saving post edit',
                    custom_action: 'post_edit_error',
                    data: { postId, error: error?.toString() }
                });
            }
        }
    };

    const handleEditCancel = (postId: string) => {
        setEditingPostId(null);

        // Log edit cancellation
        if (sessionId) {
            logEvent(sessionId, ActionType.CUSTOM, {
                text: 'Post edit cancelled',
                custom_action: 'post_edit_cancelled',
                data: { postId }
            });
        }
    };

    const handleEditCommentStart = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditedCommentContent(comment.content);

        // Log comment edit start
        if (sessionId) {
            logEvent(sessionId, ActionType.CLICK, {
                text: 'Started editing comment',
                page_url: window.location.href,
                element_identifier: `edit-comment-${comment.id}`,
                coordinates: { x: 0, y: 0 }
            });
        }
    };

    const handleSaveCommentEdit = async (commentId: number) => {
        try {
            const res = await fetch(`http://localhost:8000/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editedCommentContent,
                    author_id: user?.id,
                    post_id: comments.find(c => c.id === commentId)?.post_id,
                    parent_id: comments.find(c => c.id === commentId)?.parent_id || null,
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setComments((prev) =>
                    prev.map((c) => (c.id === commentId ? { ...c, content: updated.content } : c))
                );
                setEditingCommentId(null);

                // Log successful comment edit
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Comment edited successfully',
                        custom_action: 'comment_edited',
                        data: { commentId, userId }
                    });
                }
            } else {
                console.error('Failed to edit comment');
                // Log comment edit failure
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Failed to edit comment',
                        custom_action: 'comment_edit_failed',
                        data: { commentId, statusCode: res.status }
                    });
                }
            }
        } catch (err) {
            console.error('Error editing comment:', err);
            // Log error
            if (sessionId) {
                logEvent(sessionId, ActionType.CUSTOM, {
                    text: 'Error editing comment',
                    custom_action: 'comment_edit_error',
                    data: { commentId, error: err?.toString() }
                });
            }
        }
    };

    const handleCommentEditCancel = (commentId: number) => {
        setEditingCommentId(null);

        // Log comment edit cancellation
        if (sessionId) {
            logEvent(sessionId, ActionType.CUSTOM, {
                text: 'Comment edit cancelled',
                custom_action: 'comment_edit_cancelled',
                data: { commentId }
            });
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
        if (!confirmDelete) {
            // Log cancellation
            if (sessionId) {
                logEvent(sessionId, ActionType.CUSTOM, {
                    text: 'Comment deletion cancelled',
                    custom_action: 'comment_delete_cancelled',
                    data: { commentId }
                });
            }
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setComments((prev) => prev.filter((c) => c.id !== commentId));

                // Log successful deletion
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Comment deleted successfully',
                        custom_action: 'comment_deleted',
                        data: { commentId, userId }
                    });
                }
            } else {
                console.error('Failed to delete comment');
                // Log deletion failure
                if (sessionId) {
                    logEvent(sessionId, ActionType.CUSTOM, {
                        text: 'Failed to delete comment',
                        custom_action: 'comment_delete_failed',
                        data: { commentId, statusCode: res.status }
                    });
                }
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            // Log error
            if (sessionId) {
                logEvent(sessionId, ActionType.CUSTOM, {
                    text: 'Error deleting comment',
                    custom_action: 'comment_delete_error',
                    data: { commentId, error: err?.toString() }
                });
            }
        }
    };

    const renderSection = () => {
        if (!user) return null;

        const faker = getSeededFaker(user.username);
        const fakeBio = faker.person.bio();
        switch (activeSection) {
            case 'Profile':
                return (

                    <div className="w-full max-w-md bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-6 space-y-6">
                        {/* Profile Avatar */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                                {user.username[0].toUpperCase()}
                            </div>
                        </div>

                        {/* Username + Bio */}
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-semibold text-gray-900">@{user.username}</h2>
                            <p className="text-gray-600 text-base">{fakeBio}</p>
                        </div>

                        {/* Stats with Flex */}
                        <div className="flex justify-between border-t pt-4 text-sm text-gray-700">
                            {/* Post Karma */}
                            <div className="flex flex-col items-center flex-1 px-2 bg-blue-50 rounded-lg py-3">
                                <div className="text-xl font-bold text-gray-900">
                                    {faker.number.int({ min: 100, max: 5000 })}
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-gray-700 font-medium">
                                    {/* <User size={16} /> */}
                                    Post Karma
                                </div>
                            </div>

                            {/* Comment Karma */}
                            <div className="flex flex-col items-center flex-1 px-2 bg-purple-50 rounded-lg py-3 mx-2">
                                <div className="text-xl font-bold text-gray-900">
                                    {faker.number.int({ min: 100, max: 3000 })}
                                </div>
                                <div className="flex items-center text-center gap-1 mt-1 text-gray-700 font-medium">
                                    {/* <MessageSquareText size={16} /> */}
                                    Comment Karma
                                </div>
                            </div>

                            {/* Joined */}
                            <div className="flex flex-col items-center flex-1 px-2 bg-green-50 rounded-lg py-3">
                                <div className="text-xl font-bold text-gray-900">
                                    {faker.date.past({ years: 3 }).toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-gray-700 font-medium">
                                    {/* <CalendarDays size={16} /> */}
                                    Joined
                                </div>
                            </div>
                        </div>
                    </div>



                );

            case 'Posts':
                return posts.length ? (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white border p-4 rounded-lg shadow-sm relative"
                        >
                            {editingPostId === post.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        className="w-full p-2 mb-2 border text-black rounded"
                                    />
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="w-full p-2 mb-2 border text-black rounded"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSaveEdit(post.id)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => handleEditCancel(post.id)}
                                            className="px-4 py-2 bg-gray-300 text-black rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-black">r/{post.subreddit}</h4>
                                    <h3 className="font-semibold text-lg text-blue-700">{post.title}</h3>
                                    <p className="text-gray-700">{post.content}</p>
                                    <span className="text-xs text-black">
                                        Posted on {faker.date.past().toLocaleDateString()}
                                    </span>

                                    <div className="absolute right-3 top-3 flex items-center space-x-3">
                                        <button
                                            onClick={() => handleEditPostStart(post)}
                                            className="text-blue-500 hover:text-blue-700 transition"
                                            title="Edit"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePost(post.id);
                                            }}
                                            className="text-red-500 hover:text-red-700 transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No posts yet.</p>
                );

            case 'Comments':
                return comments.length ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white border p-4 rounded-lg shadow-sm relative">
                            {editingCommentId === comment.id ? (
                                <>
                                    <textarea
                                        value={editedCommentContent}
                                        onChange={(e) => setEditedCommentContent(e.target.value)}
                                        className="w-full p-2 mb-2 border text-black rounded"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSaveCommentEdit(comment.id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => handleCommentEditCancel(comment.id)}
                                            className="px-4 py-2 bg-gray-300 text-black rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-700">{comment.content}</p>
                                    <span className="text-xs text-gray-400">
                                        On <span className="font-semibold text-blue-700">{comment.post_title}</span> •{' '}
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                    <div className="absolute right-2 top-2 flex gap-2">
                                        <button
                                            onClick={() => handleEditCommentStart(comment)}
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            <Pencil />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            <Trash2 />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No comments yet.</p>
                );

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
            case 'Saved Comments':
                return savedComments.length ? (
                    savedComments.map((comment) => (
                        <div key={comment.id} className="bg-white border p-4 rounded-lg shadow-sm">
                            <p className="text-gray-700">{comment.content}</p>
                            <span className="text-xs text-gray-400">
                                Saved On <span className="font-semibold text-blue-700">{comment.post_title}</span> •{' '}
                                {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No saved comments.</p>
                );
            default:
                return null;
        }
    };

    console.log(userId)
    console.log(sessionId)

    return (
        <>
            <div className="min-h-screen bg-white">
                <Navbar
                    userId={userId || localStorage.getItem('userId') || ''}
                    sessionId={sessionId}
                    onLogout={() => {
                        // Log logout event
                        if (sessionId) {
                            logEvent(sessionId, ActionType.CUSTOM, {
                                text: 'User logged out from profile page',
                                custom_action: 'logout',
                                data: { userId, page: 'profile' }
                            });
                        }

                        localStorage.removeItem("userId");
                        sessionStorage.removeItem("sessionInitialized");
                        sessionStorage.removeItem("sessionId");

                        if (window.__SESSION_ID__) {
                            delete window.__SESSION_ID__;
                        }
                        window.location.href = '/';
                    }}
                />
                <div className="flex max-w-full mx-auto px-6 py-20 space-x-8">
                    <LeftSideBar />
                    <div className='max-w-7xl px-12 flex space-x-8'>
                        <aside className="w-60 max-h-fit bg-white border rounded-xl shadow-md p-4 space-y-4">
                            {sections.map((section) => {
                                const kebabSectionId = `section-${section.toLowerCase().replace(/\s+/g, '-')}`;
                                return (
                                    <button
                                        key={section}
                                        id={kebabSectionId}
                                        onClick={() => handleSectionClick(section)}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === section
                                            ? 'bg-blue-100 text-blue-800 font-semibold'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {section}
                                    </button>
                                );
                            })}
                        </aside>

                        <main className="flex-1 space-y-6">{renderSection()}</main>
                    </div>
                </div>
            </div>
        </>
    );
}

// Loading component for Suspense fallback
function ProfileLoading() {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Loading profile...</p>
        </div>
    );
}

// Main component that wraps ProfileContent with Suspense
export default function ProfilePage() {
    return (
        <Suspense fallback={<ProfileLoading />}>
            <ProfileContent />
        </Suspense>
    );
}