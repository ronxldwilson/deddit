'use client';

import { CreatePostForm } from '@/components/CreatePostForm';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { LeftSideBar } from '../../components/LeftSideBar';


interface CreatePostPageProps {
    userId: string | null;
}

export default function CreatePostPage() {
    // Assuming session user ID is stored globally
    // const userId = typeof window !== 'undefined' ? window.__USER_ID__ : null;

    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    if (!userId) {
        return <div className="text-center mt-10 text-red-500">Please log in to create a post.</div>;
    }

    return (
        <main className="min-h-screen p-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <Navbar
                    userId={userId}
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

                <div className="flex mt-20">
                    {/* Left Sidebar */}
                    <div className="w-64">
                        <LeftSideBar userId={userId} />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <CreatePostForm userId={userId} />
                    </div>
                </div>
            </div>
        </main>

    );
}
