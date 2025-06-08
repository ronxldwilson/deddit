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
    console.log("Form submitted:", { username, password, isRegister });

    logEvent(sessionId, ActionType.CLICK, {
      text: `User clicked on the ${isRegister ? "register" : "login"} button`,
      page_url: window.location.href,
      element_identifier: isRegister ? "register-submit-btn" : "login-submit-btn",
      coordinates: { x: 0, y: 0 }
    });

    try {
      const endpoint = isRegister ? "register" : "login";
      const url = `http://localhost:8000/api/${endpoint}?session_id=${sessionId}`;
      console.log("Making request to:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        console.log("Success! Calling onLoginSuccess with:", data.userId);
        onLoginSuccess(data.userId);
      } else {
        console.log("Error response:", data);
        setError(data.detail || (isRegister ? "Registration failed" : "Invalid username or password"));
      }
    } catch (error) {
      console.error("Request failed:", error);
      setError(isRegister ? "Failed to register. Please try again." : "Failed to login. Please try again.");
    }
  };

  const handleTypeUsername = (value: string) => {
    setUsername(value);
    logEvent(sessionId, ActionType.KEY_PRESS, {
      text: `User typed "${value}" into the username field`,
      page_url: window.location.href,
      element_identifier: "login-username",
      key: value
    });
  };

  const handleTypePassword = (value: string) => {
    setPassword(value);
    logEvent(sessionId, ActionType.KEY_PRESS, {
      text: `User typed "${value}" into the password field`,
      page_url: window.location.href,
      element_identifier: "login-password",
      key: value
    });
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    console.log("Toggled to:", isRegister ? "login" : "register");
    logEvent(sessionId, ActionType.CLICK, {
      text: `User clicked on the toggle button to switch to ${isRegister ? "login" : "register"} mode`,
      page_url: window.location.href,
      element_identifier: "toggle-auth-mode",
      coordinates: { x: 0, y: 0 }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {isRegister ? "Create Account" : "Welcome Back"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleTypeUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => handleTypePassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {isRegister ? "Create Account" : "Sign In"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
          >
            {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
};