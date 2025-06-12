'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const profile = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
            <p className="text-lg">This is the profile page.</p>
        </div>
    );
}

export default profile;
