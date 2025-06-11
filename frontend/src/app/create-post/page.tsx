'use client';

import { CreatePostForm } from '@/components/CreatePostForm';
import { useSearchParams } from 'next/navigation';

interface CreatePostPageProps {
    userId: string | null;
}

export default function CreatePostPage() {
    // Assuming session user ID is stored globally
    // const userId = typeof window !== 'undefined' ? window.__USER_ID__ : null;

    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    console.log('Rendering CreatePostPage with use rId:', userId);
    if (!userId) {
        return <div className="text-center mt-10 text-red-500">Please log in to create a post.</div>;
    }

    return (
        <main className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded shadow">
            <CreatePostForm userId={userId} />
        </main>
    );
}
