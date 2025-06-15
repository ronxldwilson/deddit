"use client";

import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    logEvent(sessionId, ActionType.PAGE_VIEW, {
      text: `User visited the ${isRegister ? "register" : "login"} page`,
      page_url: window.location.href,
    });
  }, [isRegister, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = Math.round(rect.left);
    const y = Math.round(rect.top);

    logEvent(sessionId, ActionType.CLICK, {
      text: "User clicked on the create post button",
      page_url: window.location.href,
      element_identifier: "create-post-button",
      coordinates: { x, y }, // ✅ now int
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
        logEvent(sessionId, ActionType.CUSTOM, {
          text: `User successfully ${isRegister ? "registered" : "logged in"} with username "${username}"`,
          custom_action: isRegister ? "user_register_success" : "user_login_success",
          data: { userId: data.userId },
        });
        onLoginSuccess(data.userId);
      } else {
        const errText = data.detail || (isRegister ? "Registration failed" : "Login failed");
        setError(errText);
        logEvent(sessionId, ActionType.CUSTOM, {
          text: `User ${isRegister ? "registration" : "login"} failed: ${errText}`,
          custom_action: isRegister ? "user_register_error" : "user_login_error",
          data: { username },
        });
      }
    } catch (error) {
      const errText = isRegister ? "Registration error (network or server)" : "Login error (network or server)";
      setError(errText);
      logEvent(sessionId, ActionType.CUSTOM, {
        text: `Caught exception during ${isRegister ? "registration" : "login"}: ${String(error)}`,
        custom_action: "exception",
        data: { username, error: String(error) },
      });
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
      text: `User typed into the password field`,
      page_url: window.location.href,
      element_identifier: "login-password",
      key: value,
    });
  };

  const toggleMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setIsRegister(!isRegister);
    setError(null);
    logEvent(sessionId, ActionType.CLICK, {
      text: `User toggled auth mode to ${!isRegister ? "register" : "login"}`,
      page_url: window.location.href,
      element_identifier: "toggle-auth-mode",
      coordinates: { x: Math.round(rect.left), y: Math.round(rect.top) },
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto mt-12">
      <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">
        {isRegister ? "Create an account" : "Sign in to Deddit"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-black mb-1">
            Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => handleTypeUsername(e.target.value)}
            onFocus={() =>
              logEvent(sessionId, ActionType.HOVER, {
                text: "User focused on the username input field",
                page_url: window.location.href,
                element_identifier: "login-username",
              })
            }
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg bg-gray-50 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            placeholder="e.g. blueberry123"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => handleTypePassword(e.target.value)}
            onFocus={() =>
              logEvent(sessionId, ActionType.HOVER, {
                text: "User focused on the password input field",
                page_url: window.location.href,
                element_identifier: "login-password",
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-gray-50 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            placeholder="******"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-100 border border-red-200 px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
        >
          {isRegister ? "Register" : "Sign In"}
        </button>

        <div className="text-center pt-2">
          <button
            id="toggle-auth-mode"
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:underline"
          >
            {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
};
