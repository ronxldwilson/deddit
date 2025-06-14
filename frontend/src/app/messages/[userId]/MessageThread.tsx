'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Props {
  otherUsername: string;
}

const BACKEND_URL = 'http://localhost:8000';

export function MessageThread({ otherUsername }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/users/id-from-username/?username=${otherUsername}`)
      .then((res) => res.json())
      .then((data) => {
        const id = data.id || data.user_id;
        if (id) {
          setReceiverId(id);
        }
      })
      .catch((err) => {
        console.error('Error fetching receiver ID:', err);
      });
  }, [otherUsername]);

  useEffect(() => {
    if (userId && receiverId) {
      console.log('🔍 Fetching thread between', userId, 'and', receiverId);
      fetchMessages(userId, receiverId);
    }
  }, [userId, receiverId]);

  const fetchMessages = async (currentUserId: string, receiverId: string) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/messages/thread?user1=${currentUserId}&user2=${receiverId}`
      );
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !receiverId) return;

    const content = newMessage;
    setNewMessage('');

    try {
      const res = await fetch(`${BACKEND_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: userId,
          receiver_id: receiverId,
          content,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const saved = await res.json();
      setMessages((prev) => [...prev, saved]);
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };



  const scrollToBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
        Chat with <span className="text-blue-600">@{otherUsername}</span>
      </h2>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto border rounded-lg p-4 bg-gray-50 shadow-sm">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-xl shadow-sm ${isOwn
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
              >
                <div className="text-sm">{msg.content}</div>
                <div className="text-xs mt-1 opacity-80 text-right">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
