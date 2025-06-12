// utils/parseUserMentions.tsx
import React from 'react';
import { UserHoverCardWrapper } from '../components/UserHoverCard';

export function parseUserMentions(text: string): React.ReactNode[] {
  const parts = text.split(/(u\/[a-zA-Z0-9_]+)/g); // split by u/username mentions

  return parts.map((part, index) => {
    const match = part.match(/^u\/([a-zA-Z0-9_]+)$/);
    if (match) {
      const username = match[1];
      return (
        <UserHoverCardWrapper key={index} username={username}>
          u/{username}
        </UserHoverCardWrapper>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
