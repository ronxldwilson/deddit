'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { faker } from '@faker-js/faker';
import { useRouter } from 'next/navigation';

interface UserHoverCardWrapperProps {
  username: string;
  children: React.ReactNode;
}

export const UserHoverCardWrapper: React.FC<UserHoverCardWrapperProps> = ({ username, children }) => {
  const [showCard, setShowCard] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) setCurrentUserId(id);
  }, []);

  const fakeUser = useMemo(() => {
    faker.seed(username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    return {
      bio: faker.person.bio(),
      joined: faker.date.past({ years: 3 }).toLocaleDateString(),
      karma: faker.number.int({ min: 100, max: 15000 }),
      avatar: "dummy",
      location: faker.location.city(),
    };
  }, [username]);

  const handleMessage = () => {
    if (currentUserId && currentUserId !== username) {
      router.push(`/messages/${username}`);
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowCard(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 100); // delay in ms
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="text-blue-600 cursor-pointer">{children}</span>

      {showCard && (
        <div
          className="absolute z-50 mt-2 w-72 bg-white border border-gray-300 shadow-xl rounded-2xl p-4 left-1/2 -translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-white font-bold text-lg">
              {username[0].toUpperCase()}
            </div>

            <div>
              <h4 className="font-semibold text-md">@{username}</h4>
              <p className="text-xs text-gray-500">{fakeUser.location}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-3">{fakeUser.bio}</p>
          <div className="text-xs text-gray-500 mt-3 border-t pt-2">
            <p>
              Karma: <span className="font-medium text-black">{fakeUser.karma}</span>
            </p>
            <p>Joined: {fakeUser.joined}</p>
          </div>

          {/* {currentUserId && currentUserId !== username && (
            <button
              onClick={handleMessage}
              className="mt-3 w-full bg-blue-500 text-white text-sm py-1.5 rounded-md hover:bg-blue-600 transition"
            >
              Message
            </button>
          )} */}
        </div>
      )}
    </div>
  );
};
