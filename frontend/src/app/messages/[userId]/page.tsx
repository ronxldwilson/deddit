// app/messages/[userId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { MessageThread } from './MessageThread';
import React from 'react';

export default function MessagePage() {
  const { userId } = useParams();

  if (!userId || typeof userId !== 'string') {
    return <div>Invalid user ID</div>;
  }

  return <MessageThread otherUsername={userId} />;
}
