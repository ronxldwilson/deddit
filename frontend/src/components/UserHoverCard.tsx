'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { faker } from '@faker-js/faker';
import { logEvent, ActionType } from '../services/analyticsLogger';

interface UserHoverCardWrapperProps {
  username: string;
  children: React.ReactNode;
}

export const UserHoverCardWrapper: React.FC<UserHoverCardWrapperProps> = ({
  username,
  children,
}) => {
  const [showCard, setShowCard] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  // const [currentUserId, setCurrentUserId] = useState<string | null>(null); // only used for "self" check
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get sessionId from localStorage
  useEffect(() => {
    const session = localStorage.getItem('sessionId');
    if (session) setSessionId(session);
  }, []);

  // // Get userId from localStorage (to compare with target username)
  // useEffect(() => {
  //   const user = localStorage.getItem('userId');
  //   if (user) setCurrentUserId(user);
  // }, []);

  // Generate mock user details
  const fakeUser = useMemo(() => {
    faker.seed(username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    return {
      bio: faker.person.bio(),
      joined: faker.date.past({ years: 3 }).toLocaleDateString(),
      location: faker.location.city(),
    };
  }, [username]);

  // const handleMessage = () => {
  //   if (sessionId && currentUserId !== username) {
  //    const rect = document.activeElement?.getBoundingClientRect();
  //     logEvent(sessionId, ActionType.CLICK, {
  //       text: `User clicked 'Message' on hover card of @${username}`,
  //       page_url: window.location.href,
  //       element_identifier: `user-hovercard-message-${username}`,
  //       coordinates: { x: Math.round(rect?.left ?? 0), y: Math.round(rect?.top ?? 0) },
  //     });

  //     logEvent(sessionId, ActionType.GO_TO_URL, {
  //       text: `User navigated to message page for @${username}`,
  //       page_url: window.location.href,
  //       target_url: `/messages/${username}`,
  //     });

  //     router.push(`/messages/${username}`);
  //   }
  // };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowCard(true);

    if (sessionId) {
      logEvent(sessionId, ActionType.HOVER, {
        text: `Hovered over @${username}'s hover card`,
        page_url: window.location.href,
        element_identifier: `user-hovercard-${username}`,
      });
    }
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 100);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="text-blue-700 font-light cursor-pointer text-base">
        {children}
      </span>

      {showCard && (
        <div
          className="absolute z-50 mt-3 w-80 bg-white border border-gray-200 shadow-xl rounded-xl p-5 left-1/2 -translate-x-1/2 transition-all duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-400 text-white font-bold text-lg flex items-center justify-center">
              {username[0].toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-lg">@{username}</h4>
            </div>
          </div>

          <p className="text-base text-gray-800 mt-4 leading-snug">{fakeUser.bio}</p>

          <div className="flex gap-4 text-center mt-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
              <div className="text-lg font-extrabold flex items-center justify-center gap-2">
                🔥 {faker.number.int({ min: 100, max: 5000 })}
              </div>
              <div className="mt-1 text-xs tracking-wide font-medium uppercase">Post Karma</div>
            </div>

            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-xl shadow-lg">
              <div className="text-lg font-extrabold justify-center gap-2">
                💬 {faker.number.int({ min: 100, max: 3000 })}
              </div>
              <div className="mt-1 text-xs tracking-wide font-medium uppercase">Comment Karma</div>
            </div>

            <div className="bg-gradient-to-r from-green-400 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                📅 {faker.date.past({ years: 3 }).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              <div className="mt-1 text-xs tracking-wide font-medium uppercase">Joined</div>
            </div>
          </div>

          {/* {sessionId && currentUserId !== username && (
            <button
              onClick={handleMessage}
              className="mt-4 w-full bg-blue-600 text-white text-base py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Message
            </button>
          )} */}
        </div>
      )}
    </div>
  );
};
