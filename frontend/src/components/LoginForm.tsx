"use client";

import React, { useState } from "react";
import { logEvent, ActionType } from "../services/analyticsLogger";

interface LoginFormProps {
  sessionId: string;
  onLoginSuccess: (userId: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ sessionId, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    logEvent(sessionId, ActionType.CLICK, {
      text: `User clicked on the ${isRegister ? "register" : "login"} button`,
      page_url: window.location.href,
      element_identifier: isRegister ? "register-submit-btn" : "login-submit-btn",
      coordinates: { x: 0, y: 0 },
    });

    try {
      const endpoint = isRegister ? "register" : "login";
      const url = `http://localhost:8000/api/${endpoint}?session_id=${sessionId}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data.userId);
      } else {
        setError(data.detail || (isRegister ? "Registration failed" : "Invalid username or password"));
      }
    } catch (error) {
      setError(isRegister ? "Failed to register. Please try again." : "Failed to login. Please try again.");
    }
  };

  const handleTypeUsername = (value: string) => {
    setUsername(value);
    logEvent(sessionId, ActionType.KEY_PRESS, {
      text: `User typed "${value}" into the username field`,
      page_url: window.location.href,
      element_identifier: "login-username",
      key: value,
    });
  };

  const handleTypePassword = (value: string) => {
    setPassword(value);
    logEvent(sessionId, ActionType.KEY_PRESS, {
      text: `User typed "${value}" into the password field`,
      page_url: window.location.href,
      element_identifier: "login-password",
      key: value,
    });
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    logEvent(sessionId, ActionType.CLICK, {
      text: `User clicked on the toggle button to switch to ${isRegister ? "login" : "register"} mode`,
      page_url: window.location.href,
      element_identifier: "toggle-auth-mode",
      coordinates: { x: 0, y: 0 },
    });
  };

  return (
    <div className="bg-background border border-border rounded-2xl shadow-sm p-6 w-full max-w-md mx-auto">
      <h2 className="text-center text-2xl font-semibold text-foreground mb-6">
        {isRegister ? "Create an account" : "Sign in to Deddit"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleTypeUsername(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-input text-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. blueberry123"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => handleTypePassword(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-input text-sm  hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground bg-white text-black hover:bg-blue-500 transition"
        >
          {isRegister ? "Register" : "Sign In"}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:underline"
          >
            {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
};
