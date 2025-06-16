'use client';

export const dynamic = 'force-dynamic';

import CreatePostForm from '@/components/CreatePostForm';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { LeftSideBar } from '../../components/LeftSideBar';
import { Suspense } from 'react';

function CreatePostPageContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    if (!userId) {
        return <div className="text-center mt-10 text-red-500">Please log in to create a post.</div>;
    }
    // console.log("from create post page:", userId)

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

export default function CreatePostPage() {
    return (
        <Suspense fallback={< div className='text-white' > Loading...</div >}>
            <CreatePostPageContent />
        </Suspense >
    )
}
