Done: 
1. Create Post (text, link, image)
2. Edit Post
3. Delete Post - Not working in the profile view
4. Comment on Post
5. Nested Comments (threaded)
6. Edit Comment
7. Delete Comment 
8. Upvote/Downvote Post
10. Save Post
11. Save Comment
12. Sort posts (hot/new/top)
19. Comment collapse/expand
20. Vote score indicator (e.g. +123)
21. Sign Up / Login
24. User profile page
25. User karma - Show Total number of posts/ comments that are made in profile section
26. Profile bio
27. User avatars
29. User history (posts/comments)
32. Subreddit description and rules
33. Subreddit banner and icon
51. Global search
54. Trending subreddits
55. Popular posts
89. Sticky top nav

Add Search functionality
Add Logout Button
UserHoverCard
Add popular communitites section

Fixed Bug List
1. Saved Posts side nav 
2. My Comments side nav
3. Logout button on different screens 
Navbar make it more resilient
Fix Search Page
Profile in Navbar in Post Details Page



__________________________________________________________________________________

# Bug List:

Save button doesn't properly retain state in Post Page
When moving from State post page and saving a post and going back to the home page, the save state is not retained

When a post is saved in home page and then gone to the same post, the save state is not retained

when we go to a subreddit, the post card shows r/tech but when you open it, it will show r/meme

Create post button idempotency is missing

Subreddit posts are not unique

make the saved post entirely DB dependent and not localstorage dependent

Fix Saved Posts and My Comments page

# Broken Links

__________________________________________________________________________________
To Do:

Highlight
########################### 
9. Upvote/Downvote Comment
########################### 


82. Infinite scroll for posts/comments
13. Sort comments (best/new/controversial)

31. Create Subreddit feature
31.5 Create subreddit by user
34. Subreddit moderators
35. Subreddit settings (visibility, post types)

Fix the Limit of votes for comments
Add Peer To Peer message
improve the save post and save comment page ui

14. NSFW flag and toggle
16. Spoiler tag support
22. Password reset
41. Report post/comment
30. Follow/unfollow user
36. Subscribe/unsubscribe from subreddits
52. Subreddit-specific search
53. Search by user
56. Recently created subreddits
57. Tag support for posts
58. Suggested subreddits
61. In-app notifications
67. Comment replies notification
69. Message threading
70. Read/unread message status
91. Post view count
88. Animated vote button feedback
90. Floating compose post button






### 🧱 Core Functionality (Posts, Comments, Voting)
15. Post Flair
17. Markdown formatting in posts/comments
18. Post preview

### 👥 User Accounts

23. OAuth with Google/GitHub
28. User settings (email, password, preferences)

### 🌐 Subreddits ("Subdeddit" Support)
37. Filter posts by flair
38. Moderation queue
39. Post approval/rejection
40. Subreddit sidebar (markdown)

### 🛡️ Moderation Tools

42. Admin dashboard
43. Auto-moderation rules
44. Ban user from subreddit
45. Remove post/comment
46. Shadowban support
47. View user reports
48. Warn users
49. Lock post/comments
50. Mute user in subreddit

### 🔍 Search & Discovery
59. Search autocomplete
60. Search filters (date range, type)

### 📩 Notifications & Messaging

62. Email notifications
63. Mentions (@username)
64. Private messages
65. Mod mail
66. Notification settings
68. New follower notification

### 💬 Real-Time Features

71. Live comments (WebSocket)
72. Real-time upvote count
73. Real-time mod queue updates
74. Live subreddit chat
75. Post edit history
76. Comment edit history
77. Online user count
78. Typing indicators in chat
79. Live AMA threads
80. Real-time subreddit activity feed

### 🎨 UI / UX Enhancements

81. Dark mode / light mode toggle
83. Mobile responsive design
84. PWA support
85. Drag-and-drop image uploader
86. Image zoom modal
87. User tooltips (hover info)

### 📊 Analytics & Insights

92. Comment count stats
93. Subreddit growth analytics
94. Daily active users (DAU)
95. Karma breakdown chart
96. Moderator activity log
97. Upvote/downvote ratio
98. Popular time of day/week
99. Traffic source (referrer stats)
100. Report generation/export
