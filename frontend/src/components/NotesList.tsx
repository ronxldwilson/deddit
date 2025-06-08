"use client";

import React, { useEffect, useState, useCallback } from "react";
import { logEvent, ActionType } from "../services/analyticsLogger";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: number;
}

interface NotesListProps {
  userId: string;
  sessionId: string;
}

export const NotesList: React.FC<NotesListProps> = ({ userId, sessionId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/notes`,
        {
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            "x-user-id": userId 
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      } else {
        setError("Failed to fetch notes");
      }
    } catch {
      setError("Failed to fetch notes");
    }
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleTypeTitle = (value: string) => {
    setTitle(value);
    logEvent(sessionId, ActionType.KEY_PRESS, {
      text: `User typed "${value}" into the note title field`,
      page_url: window.location.href,
      element_identifier: "note-title",
      key: value
    });
  };

  const handleTypeContent = (value: string) => {
    setContent(value);
    logEvent(sessionId, ActionType.KEY_PRESS, {
      text: `User typed "${value}" into the note content field`,
      page_url: window.location.href,
      element_identifier: "note-content",
      key: value
    });
  };

  const createNote = async () => {
    logEvent(sessionId, ActionType.CLICK, {
      text: "User clicked on the create note button",
      page_url: window.location.href,
      element_identifier: "create-note-btn",
      coordinates: { x: 0, y: 0 }
    });

    try {
      const res = await fetch(
        `http://localhost:8000/api/notes`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({ title, content }),
        }
      );

      if (res.ok) {
        setTitle("");
        setContent("");
        fetchNotes();
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to create note");
      }
    } catch {
      setError("Failed to create note");
    }
  };

  const deleteNote = async (noteId: string) => {
    logEvent(sessionId, ActionType.CLICK, {
      text: "User clicked on the delete note button",
      page_url: window.location.href,
      element_identifier: "delete-note-btn",
      coordinates: { x: 0, y: 0 }
    });

    try {
      const res = await fetch(
        `http://localhost:8000/api/notes/${noteId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            "x-user-id": userId 
          },
        }
      );

      if (res.ok) {
        fetchNotes();
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to delete note");
      }
    } catch {
      setError("Failed to delete note");
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Notes List Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Notes</h2>
        <div className="space-y-4">
          {notes.map((n) => (
            <div key={n.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{n.title}</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{n.content}</p>
                </div>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Note Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Note</h3>
        <div className="space-y-4">
          <input
            data-testid="note-title-input"
            placeholder="Title"
            value={title}
            onChange={(e) => handleTypeTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
          />
          <textarea
            data-testid="note-content-input"
            placeholder="Content"
            value={content}
            onChange={(e) => handleTypeContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 min-h-[150px] resize-y"
          />
          <button
            data-testid="create-note-btn"
            onClick={createNote}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Create Note
          </button>
        </div>
      </div>
    </div>
  );
};