# 🧠 Deddit

**Deddit** is a full-stack Reddit clone built with **Next.js (App Router)** on the frontend and **FastAPI** on the backend. It simulates a real-world social discussion platform, complete with posts, comments, subreddits, votes, and detailed user interaction analytics.

### Getting Started 

1. Using docker 

```bash 
docker-compose up --build
```

2. Frontend available on : 

```html 
http://localhost:3000
```

3. Backend available on : 

```html 
http://localhost:8000
```


# 🚀 Features
Deddit is a full-featured, full-stack social discussion platform inspired by Reddit, rebuilt from scratch with modern technologies. Every piece of the user experience is intentionally crafted to replicate a production-ready, interactive community forum — complete with frontend analytics, database-backed state, and modular design.

## 📝 Posts

- Create Posts: Users can publish new posts to various subreddits

- Edit & Update: Users can edit and update their own posts 

- Delete Posts: Posts can be removed by their author.

- Post Sorting: View posts by Hot, New, or Top — dynamically re-sorted using simple heuristics (votes + age).

- Vote System: Full upvote/downvote mechanism for posts with a dynamic score display (e.g. +123).

- Save Posts: Posts can be saved for later, with DB persistence per user — not just local storage.

## 💬 Comments & Threads

- Nested Comments: Fully threaded comment system supports infinite nesting and context-based replies.

- Comment Creation: Write and submit comments inline using a streamlined input experience.

- Edit & Delete Comments: Users can edit or delete their comments. Changes persist instantly.

- Vote on Comments: Comment threads also support upvotes/downvotes, encouraging community moderation.

- Collapse/Expand Threads: Long comment trees can be collapsed for better readability.

- Save Comments: Individual comments can be bookmarked just like posts — great for revisiting important replies.

## 🧑‍🤝‍🧑 Users & Profiles

- Authentication: Simple username-based auth with sign-up and login flows.

- User Profiles: Dedicated profile pages displaying user’s bio, avatar, and stats.

- Karma System: Aggregated karma score shown in profiles — based on total upvotes on posts/comments.

- Activity Feed: View all posts and comments by a user in one place (User History).

- Profile Editing: Users can customize bios and update their avatar.

- UserHoverCard: Hover on usernames to preview basic user info without navigating away.

## 🧵 Subreddits & Communities

- Subreddit:  Currently seeded for testing.

- Subreddit Pages: Community landing pages with unique banners, icons, and color styling.

- Subreddit Description: Each community displays its own rules, theme, and welcome message.

- Trending Communities: Frontpage highlights active or fast-growing subreddits.

- Popular Posts: "Popular" filter aggregates high-performing content across communities.


## 🔍 Search & Discovery

- Global Search: Search across posts and subreddits.

# 🎯 User Interaction Logging (Analytics)

- Granular Logging: Every interaction is logged with rich metadata.

- Action types: CLICK, SCROLL, HOVER, KEY_PRESS, DB_UPDATE and others

- Contextual payload: includes human-readable text, DOM identifiers, page URLs, and more.

- Frontend Logging: Real-time interaction tracking via a unified logEvent interface.

- Backend Logging: All DB actions (insert/update/delete) are logged with intent summaries.

- Session-based: Events are tied to session IDs, enabling isolated UX tracking.

## 🧩 UI & Navigation
- Sticky Navigation: Top bar remains visible while scrolling for easy access.

- Left Sidebar: Includes saved items, personal links, and quick navigation.

- Idempotent Submit Buttons: Create buttons are protected against duplicate submissions.

## 🛠 Tech Stack

### Frontend
- **Next.js** (App Router)
- **React**
- **TailwindCSS**
- **Lucide Icons**

### Backend
- **FastAPI**
- **SQLAlchemy** (with SQLite)
- **Pydantic**
- **Uvicorn**

### Utilities
- **faker.js** for generating synthetic data
- **Custom analytics logger** for frontend/backend event tracking

