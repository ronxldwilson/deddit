'use client';

import { useState, useEffect } from "react";
import { LoginForm } from "../components/LoginForm";
import { FrontPage } from "../components/FrontPage";

declare global {
  interface Window {
    __SESSION_ID__?: string;
  }
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const alreadyInitialized = sessionStorage.getItem("sessionInitialized");
    if (alreadyInitialized) {
      // Get existing sessionId from sessionStorage if needed
      const existingSessionId = sessionStorage.getItem("sessionId");
      if (existingSessionId) {
        setSessionId(existingSessionId);
        window.__SESSION_ID__ = existingSessionId;
      }
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) setUserId(storedUserId);
      return;
    }

    fetch("http://localhost:8000/_synthetic/new_session?seed=123", {
      method: "POST",
    })
      .then(async (r) => {
        const text = await r.text();
        return JSON.parse(text);
      })
      .then((d) => {
        if (!d.session_id) throw new Error("No session_id in response");

        setSessionId(d.session_id);
        window.__SESSION_ID__ = d.session_id;

        // Mark session initialized
        sessionStorage.setItem("sessionInitialized", "true");
        sessionStorage.setItem("sessionId", d.session_id);

        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);
      })
      .catch((error) => {
        console.error("Failed to initialize session:", error);
      });
  }, []);

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center bg-white min-h-screen">
        <div className="text-lg">Initializing session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-full bg-gradient-to-b from-gray-50 via-white to-gray-100 pb-12">
      <div className="mx-auto py-8 px-4">
        {!userId ? (
          <LoginForm
            sessionId={sessionId}
            onLoginSuccess={(id) => {
              localStorage.setItem("userId", id);
              setUserId(id);
            }}
          />

        ) : (
          <FrontPage
            userId={userId}
            sessionId={sessionId}
            onLogout={() => {
              // Clear userId
              localStorage.removeItem("userId");
              setUserId(null);

              // Clear session data
              setSessionId(null);
              sessionStorage.removeItem("sessionInitialized");
              sessionStorage.removeItem("sessionId");

              // Clear global session reference
              if (window.__SESSION_ID__) {
                delete window.__SESSION_ID__;
              }
              window.location.href = '/'; // Redirect to home
            }}
          />
        )}
      </div>
    </div>
  );
}
