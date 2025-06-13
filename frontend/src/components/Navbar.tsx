"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Home, PlusSquare, User, LogOut, Search } from "lucide-react";
import { logEvent, ActionType } from "../services/analyticsLogger";
import Link from "next/link";
import Logo from "../../public/Logo.png";

interface NavbarProps {
  userId: string;
  sessionId: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userId: propUserId,
  sessionId,
  onLogout = () => {}, // No-op by default
}) => {
  const [search, setSearch] = useState("");
  const [localUserId, setLocalUserId] = useState<string>("");

  const router = useRouter();

  // Read from localStorage only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId") || "";
      setLocalUserId(storedUserId);
    }
  }, []);

  const effectiveUserId = useMemo(() => {
    return propUserId?.trim() || localUserId;
  }, [propUserId, localUserId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    if (sessionId && effectiveUserId) {
      logEvent(sessionId, ActionType.CLICK, {
        text: "User clicked the logout button",
        page_url: window.location.href,
        element_identifier: "logout-btn",
        coordinates: { x: 0, y: 0 },
      });
    }
    onLogout();
  };

  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-10">
      <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="text-2xl font-bold text-red-600 cursor-pointer hover:opacity-90">
            <img src={Logo.src} alt="Deddit Logo" className="h-8 w-auto" />
          </div>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full max-w-md mx-6 space-x-2"
        >
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Deddit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Search
          </button>
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
            onClick={() =>
              router.push(`/create-post?userId=${encodeURIComponent(effectiveUserId || "")}`)
            }
          >
            <PlusSquare size={16} />
            Create Post
          </button>

          <button
            className="flex items-center gap-1 hover:text-black"
            onClick={() =>
              router.push(`/profile?users=${encodeURIComponent(effectiveUserId || "")}`)
            }
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
    </nav>
  );
};
