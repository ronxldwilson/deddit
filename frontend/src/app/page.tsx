'use client';

import { useState, useEffect } from "react";
import { LoginForm } from "../components/LoginForm";
import { NotesList } from "../components/NotesList";

declare global {
  interface Window {
    __SESSION_ID__: string;
  }
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize session on component mount
    console.log("Initializing session...");
    fetch("http://localhost:8000/_synthetic/new_session?seed=123", {
      method: "POST",
    })
      .then(async (r) => {
        console.log("Session response status:", r.status);
        const text = await r.text();
        console.log("Raw response:", text);
        return JSON.parse(text);
      })
      .then((d) => {
        console.log("Session data:", d);
        if (!d.session_id) {
          throw new Error("No session_id in response");
        }
        setSessionId(d.session_id);
        window.__SESSION_ID__ = d.session_id;
        console.log("Session ID stored:", d.session_id);
      })
      .catch((error) => {
        console.error("Failed to initialize session:", error);
      });
  }, []);

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Initializing session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {!userId ? (
          <LoginForm 
            sessionId={sessionId} 
            onLoginSuccess={setUserId} 
          />
        ) : (
          <NotesList 
            sessionId={sessionId} 
            userId={userId} 
          />
        )}
      </div>
    </div>
  );
}
