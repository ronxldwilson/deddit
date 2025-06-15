"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Home, PlusSquare, User, LogOut, Search } from "lucide-react";
import { logEvent, ActionType } from "../services/analyticsLogger";
import Link from "next/link";
import Logo from "../../public/Logo.png";
import Image from "next/image";

interface NavbarProps {
  userId: string;
  sessionId: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userId: propUserId,
  sessionId,
  onLogout = () => { },
}) => {
  const [search, setSearch] = useState("");
  const [localUserId, setLocalUserId] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId") || "";
      setLocalUserId(storedUserId);
    }
  }, []);

  const effectiveUserId = useMemo(() => {
    return propUserId?.trim() || localUserId;
  }, [propUserId, localUserId]);

  const logClick = (
    e: React.MouseEvent,
    text: string,
    identifier: string
  ) => {
    if (!sessionId) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = Math.round(rect.left);
    const y = Math.round(rect.top);
    logEvent(sessionId, ActionType.CLICK, {
      text,
      page_url: window.location.href,
      element_identifier: identifier,
      coordinates: { x, y },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    if (search.trim()) {
      logEvent(sessionId, ActionType.CLICK, {
        text: `User submitted search query: "${search.trim()}"`,
        page_url: window.location.href,
        element_identifier: "navbar-search-submit",
        coordinates: { x: 0, y: 0 },
      });
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    logClick(e, "User clicked the logout button", "logout-btn");

    try {
      await fetch(`http://localhost:8000/_synthetic/reset?session_id=${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Failed to call /reset:", err);
    }

    onLogout();
  };

  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-10">
      <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div
            id="navbar-logo"
            className="text-2xl font-bold text-red-600 cursor-pointer hover:opacity-90"
            onClick={(e) => {
              if (sessionId) {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                logEvent(sessionId, ActionType.CLICK, {
                  text: "User clicked the Deddit logo",
                  page_url: window.location.href,
                  element_identifier: "navbar-logo",
                  coordinates: { x: Math.round(rect.left), y: Math.round(rect.top) },
                });
              }
            }}
          >
            <Image src={Logo.src} alt="Deddit Logo" className="h-8 w-auto" />
          </div>
        </Link>

        {/* Search Bar */}
        <form
          id="navbar-search-submit"
          onSubmit={(e) => {
            e.preventDefault();
            if (search.trim()) {
              logEvent(sessionId, ActionType.KEY_PRESS, {
                text: "User submitted the search form",
                page_url: window.location.href,
                element_identifier: "navbar-search-submit",
                key: "Enter"
              });

              router.push(`/search?q=${encodeURIComponent(search.trim())}`);
            }
          }}
          className="flex items-center w-full max-w-md mx-6 space-x-2"
        >
          <div
            id="navbar-search-bar"
            className="relative w-full"
            onClick={(e) => {
              if (sessionId) {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                logEvent(sessionId, ActionType.CLICK, {
                  text: "User clicked the search input box",
                  page_url: window.location.href,
                  element_identifier: "navbar-search-bar",
                  coordinates: { x: Math.round(rect.left), y: Math.round(rect.top) }
                });
              }
            }}
          >
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500"
              onClick={(e) => {
                handleSearch(e); // manually call search on icon click
              }} />
            <input
              id="navbar-search-input"
              type="text"
              placeholder="search deddit"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (sessionId) {
                  logEvent(sessionId, ActionType.KEY_PRESS, {
                    text: "User typed in the search bar",
                    page_url: window.location.href,
                    element_identifier: "navbar-search-input",
                    key: e.target.value.slice(-1) || "Backspace"
                  });
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-sm text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            id="navbar-search-button"
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={(e) => {
              if (sessionId) {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                logEvent(sessionId, ActionType.CLICK, {
                  text: "User clicked the search button",
                  page_url: window.location.href,
                  element_identifier: "navbar-search-button",
                  coordinates: { x: Math.round(rect.left), y: Math.round(rect.top) }
                });
              }
            }}
          >
            Search
          </button>
        </form>


        {/* Navigation Links */}
        <div className="flex items-center space-x-6 text-sm text-gray-700">
          <Link href="/">
            <button
              id="navbar-home"
              className="flex items-center gap-1 hover:text-black"
              onClick={(e) =>
                logClick(e, "User clicked the Home button", "navbar-home")
              }
            >
              <Home size={16} />
              Home
            </button>
          </Link>

          <button
            id="navbar-create-post"
            className="flex items-center gap-1 hover:text-black"
            onClick={(e) => {
              logClick(e, "User clicked the Create Post button", "navbar-create-post");
              router.push(`/create-post?userId=${encodeURIComponent(effectiveUserId || "")}`);
            }}
          >
            <PlusSquare size={16} />
            Create Post
          </button>

          <button
            id="navbar-profile"
            className="flex items-center gap-1 hover:text-black"
            onClick={(e) => {
              logClick(e, "User clicked the Profile button", "navbar-profile");
              router.push(`/profile?users=${encodeURIComponent(effectiveUserId || "")}`);
            }}
          >
            <User size={16} />
            Profile
          </button>

          <button
            id="logout-btn"
            className="flex items-center gap-1 text-red-500 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
};
