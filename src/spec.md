# Specification

## Summary
**Goal:** Build an Instagram-like social app called "instagram ai" with Internet Identity authentication, a feed, posting, interactions, profiles, following, and user search.

**Planned changes:**
- Add Internet Identity sign-in, an auth-gated app shell, and sign-out that returns users to the sign-in screen and clears user-specific UI state.
- Implement a single Motoko backend actor with persistent models/APIs for profiles, posts (caption + image), follows, likes, and comments, scoped to the caller principal and enforcing authenticated writes.
- Build a main feed UI (reverse-chronological) with post cards (image, author, caption, timestamp, like/count, comment preview) using React Query with loading/empty/error states and caching.
- Add a "New Post" flow with image selection/upload, optional caption input, client-side validation, submit to backend, and feed refresh without full reload.
- Implement like/unlike and comments (view/add) with immediate UI feedback and backend persistence/validation.
- Implement profile pages (view self/others) with display name, bio, optional avatar, post/follower/following counts, user post grid/list, and an edit flow for own profile.
- Implement follow/unfollow with correct UI state, count updates, and backend safeguards (no self-follow, idempotent operations).
- Add basic user discovery search by display name (and/or username if included) with loading/empty/error states and navigation to profiles.
- Apply a coherent distinctive (non-blue/purple) visual theme and responsive layout with consistent primary navigation across main screens.
- Add generated static image assets under `frontend/public/assets/generated` and use them for branding (auth screen/top nav) and empty feed state.

**User-visible outcome:** Users can sign in with Internet Identity to browse a feed, create image posts, like and comment, view and edit profiles, follow/unfollow others, and search for users in a responsive, themed "instagram ai" interface with branding and empty-state visuals.
