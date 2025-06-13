"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, PlusSquare, User, LogOut, Search } from "lucide-react";
import { logEvent, ActionType } from "../services/analyticsLogger";
import Link from "next/link";
import Logo from "../../public/Logo.png"; // Adjust the path as necessary

interface NavbarProps {
  userId?: string;
  sessionId?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userId, sessionId, onLogout }) => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // TODO: Implement actual search functionality
    }
  };

  const handleLogout = () => {
    if (sessionId && userId) {
      logEvent(sessionId, ActionType.CLICK, {
        text: "User clicked the logout button",
        page_url: window.location.href,
        element_identifier: "logout-btn",
        coordinates: { x: 0, y: 0 },
      });
    }

    // Call the parent's logout handler
    if (onLogout) {
      onLogout();
    }
  };
  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-10">
      <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        {/* <Link href={"/"} className="flex items-center">
          <div className="text-2xl font-bold text-red-600 cursor-pointer hover:opacity-90">
            Deddit
          </div>
        </Link> */}
        <Link href={"/"} className="flex items-center">
          <div className="text-2xl font-bold text-red-600 cursor-pointer hover:opacity-90">
            <img src={Logo.src} alt="Deddit Logo" className="h-8 w-auto" />
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center w-full max-w-md mx-6">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-2.5 text-black" />
            <input
              type="text"
              placeholder="Search Deddit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 text-sm text-gray-700">
          <Link href="/">
            <button className="flex items-center gap-1 hover:text-black">
              <Home size={16} />
              Home
            </button>
          </Link>
          <button
            className="flex items-center gap-1 hover:text-black"
            onClick={() => router.push(`/create-post?userId=${userId}`)}
          >
            <PlusSquare size={16} />
            Create Post
          </button>
          <button
            className="flex items-center gap-1 hover:text-black"
            onClick={() => router.push(`/profile?users=${userId}`)}
          >
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
    </nav >
  );
};
