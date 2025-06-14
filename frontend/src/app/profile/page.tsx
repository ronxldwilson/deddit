'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { faker } from '@faker-js/faker';
import { Navbar } from '../../components/Navbar';

import { Trash2 } from 'lucide-react'; // Lucide trash icon

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

const sections = ['Profile', 'Posts', 'Comments', 'Saved Posts', 'Saved Comments'];

export default function ProfilePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('users') ? searchParams.get('users') : localStorage.getItem('userId');

    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [savedComments, setSavedComments] = useState<Comment[]>([]);
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [loading, setLoading] = useState(true);


    const getSeededFaker = (seedString: string) => {
        const seed = Array.from(seedString).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        faker.seed(seed); // Just seed the global faker
        return faker;
    };

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

                setUser(await userRes.json());
                setPosts(await postsRes.json());
                setComments(await commentsRes.json());
                setSavedPosts(await savedPostsRes.json());
                setSavedComments(await savedCommentsRes.json());
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

    const handleDeletePost = async (postId: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this post?');
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:8000/posts/${postId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setPosts((prev) => prev.filter((post) => post.id !== postId));
                setSavedPosts((prev) => prev.filter((post) => post.id !== postId));
            } else {
                console.error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const renderSection = () => {
        if (!user) return null;

        const faker = getSeededFaker(user.username);
        const fakeAvatar = faker.image.avatar();
        const fakeBio = faker.person.bio();

        const router = useRouter();

        switch (activeSection) {
            case 'Profile':
                return (
                    <div className="space-y-4 bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <div className='space-y-4 '>

                            <img
                                src={fakeAvatar}
                                alt="avatar"
                                className="w-24 h-24 mx-auto rounded-full border-2 border-blue-400 shadow-md"
                            />

                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-semibold text-gray-900">@{user.username}</h2>
                                <p className="text-gray-700 text-lg">{fakeBio}</p>
                            </div>
                        </div>

                        <div className="flex justify-around text-sm text-gray-600 pt-2 border-t">
                            <div className="text-center">
                                <div className="text-xl py-4 font-bold text-black">{faker.number.int({ min: 100, max: 5000 })}</div>
                                <div>Post Karma</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl py-4 font-bold text-black">{faker.number.int({ min: 100, max: 3000 })}</div>
                                <div>Comment Karma</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl py-4 font-bold text-black">
                                    {faker.date.past({ years: 3 }).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </div>
                                <div>Joined</div>
                            </div>
                        </div>
                    </div>
                );

            case 'Posts':
                return posts.length ? (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white border p-4 rounded-lg shadow-sm relative cursor-pointer hover:bg-gray-50"
                            onClick={() => router.push(`/posts/${post.id}?userID=${userId}`)}
                        >
                            <h3 className="font-semibold text-lg text-blue-700">{post.title}</h3>

                            <p className="text-gray-700">{post.content}</p>

                            <span className="text-xs text-gray-400">
                                Posted on {faker.date.past().toLocaleDateString()}
                            </span>

                            {/* 🗑 Delete Button (Vertically Centered) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post.id);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
                                aria-label="Delete Post"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No posts yet.</p>
                );
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

    return (
        <>
            <div className="min-h-screen bg-white">

                <Navbar
                    userId={userId || localStorage.getItem('userId') || ''}
                    sessionId={window.__SESSION_ID__}
                    onLogout={() => {
                        localStorage.removeItem('userId');
                        window.location.href = '/'; // Redirect to home
                    }}
                />
                <div className="flex max-w-6xl mx-auto px-6 py-20 bg-white space-x-8">
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
        </>
    );
}
