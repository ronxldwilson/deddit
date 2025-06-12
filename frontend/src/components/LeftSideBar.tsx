import React from 'react'
import Link from 'next/link';

interface LeftSideBarProps {
    userId: string;
    sessionId: string;
}

export const LeftSideBar: React.FC<LeftSideBarProps> = ({
    userId,
    sessionId }) => {
    return (
        <>
            <aside className="w-64 hidden lg:block">
                <div className="sticky top-24 space-y-6">

                    <div className="bg-white border rounded-xl p-4 shadow-md">
                        <h2 className="text-base font-semibold text-gray-800 mb-2">Navigation</h2>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>
                                <Link
                                    href={{
                                        pathname: `/r/popular/}`,
                                        query: { userId: userId },
                                    }}
                                    className='hover:underline'
                                >
                                    🏠 Home
                                </Link>
                            </li>

                            <li><Link href="#" className="hover:underline">📈 Popular</Link></li>
                            <li><Link href="#" className="hover:underline">🌐 All</Link></li>
                        </ul>
                    </div>

                    <div className="bg-white border rounded-xl p-4 shadow-md">
                        <h2 className="text-base font-semibold text-gray-800 mb-2">My Stuff</h2>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li><Link href="#" className="hover:underline">💾 Saved Posts</Link></li>
                            <li><Link href="#" className="hover:underline">💬 My Comments</Link></li>
                        </ul>
                    </div>

                    <div className="bg-white border rounded-xl p-4 shadow-md">
                        <h2 className="text-base font-semibold text-gray-800 mb-2">Your Communities</h2>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li><Link href="#" className="hover:underline">r/technology</Link></li>
                            <li><Link href="#" className="hover:underline">r/gaming</Link></li>
                            <li><Link href="#" className="hover:underline">r/startups</Link></li>
                        </ul>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow">
                        + Create Post
                    </button>
                </div>
            </aside >

        </>
    )
}
