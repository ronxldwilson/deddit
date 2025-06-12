'use client';

import React, { useState, useMemo } from 'react';
import { faker } from '@faker-js/faker';

interface UserHoverCardWrapperProps {
    username: string;
    children: React.ReactNode;
}

export const UserHoverCardWrapper: React.FC<UserHoverCardWrapperProps> = ({ username, children }) => {
    const [showCard, setShowCard] = useState(false);

    // Memoize fake data so it doesn't change on every render
    const fakeUser = useMemo(() => {
        faker.seed(username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));

        return {
            bio: faker.person.bio(),
            joined: faker.date.past({ years: 3 }).toLocaleDateString(),
            karma: faker.number.int({ min: 100, max: 15000 }),
            avatar: faker.image.avatarGitHub(),
            location: faker.location.city(),
        };
    }, [username]);
    return (
        <span
            className="relative group"
            onMouseEnter={() => setShowCard(true)}
            onMouseLeave={() => setShowCard(false)}
        >
            <span className="text-blue-600 cursor-pointer">{children}</span>

            {showCard && (
                <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-300 shadow-xl rounded-2xl p-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center space-x-3">
                        <img
                            src={fakeUser.avatar}
                            alt={`${username}'s avatar`}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <h4 className="font-semibold text-md">@{username}</h4>
                            <p className="text-xs text-gray-500">{fakeUser.location}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-3">{fakeUser.bio}</p>
                    <div className="text-xs text-gray-500 mt-3 border-t pt-2">
                        <p>Karma: <span className="font-medium text-black">{fakeUser.karma}</span></p>
                        <p>Joined: {fakeUser.joined}</p>
                    </div>
                </div>
            )}
        </span>
    );
};
