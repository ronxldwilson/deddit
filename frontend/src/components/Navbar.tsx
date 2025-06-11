"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, PlusSquare, User, LogOut, Search } from "lucide-react";
import { logEvent, ActionType } from "../services/analyticsLogger";

interface NavbarProps {
  userId?: string;
  sessionId?: string;
}

export const Navbar: React.FC <NavbarProps> = ({userId, sessionId}) => {
  const [search, setSearch] = useState("");
  const router = useRouter();
  console.log("Rendering Navbar with user id:", userId, "and session id:", sessionId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      console.log("Searching for:", search);
      // TODO: Implement actual search functionality
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // const sessionId = localStorage.getItem("sessionId");
    // const userId = localStorage.getItem("userId");

    // Log the logout event
    if (sessionId && userId) {
      logEvent(sessionId, ActionType.CLICK, {
        text: "User clicked the logout button",
        page_url: window.location.href,
        element_identifier: "logout-btn",
        coordinates: { x: 0, y: 0 },
      });
    }

    // Clear user-related storage
    // localStorage.removeItem("userId");
    // localStorage.removeItem("sessionId");
    // Redirect to login page
    router.push("/");
  };

  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-red-600 cursor-pointer hover:opacity-90">
          Deddit
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center w-full max-w-md mx-6">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-2.5 text-black" />
            <input
              type="text"
              placeholder="Search Deddit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </form>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 text-sm text-gray-700">
          <button className="flex items-center gap-1 hover:text-black">
            <Home size={16} />
            Home
          </button>
          <button
            className="flex items-center gap-1 hover:text-black"
            onClick={() => router.push(`/create-post?userId=${userId}`)}
            >
            <PlusSquare size={16} />
            Create Post
          </button>
          <button className="flex items-center gap-1 hover:text-black">
            <User size={16} />
            Profile
          </button>
          <button
            className="flex items-center gap-1 text-red-500 hover:text-red-700"
            onClick={handleLogout}
            id="logout-btn"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
};
