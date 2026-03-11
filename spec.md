# Lema Admin Portal

## Current State
- Custom email/password login with two-step device confirmation
- Trusted device tracking via localStorage
- Super Admin page with session monitoring, payment approvals, audit log, portal lock
- No login attempt lockout, no session timeout, no last-login display, no single-session enforcement, no noindex meta tag

## Requested Changes (Diff)

### Add
1. **noindex meta tag** in index.html to block Google/search engine indexing
2. **Login attempt lockout** -- after 5 failed attempts, lock that browser session for 5 minutes with a countdown timer shown on the login page
3. **Session timeout** -- auto-logout after 30 minutes of inactivity; reset timer on any user interaction; show a warning dialog at 2 minutes remaining
4. **Last login display** -- after successful login, show last login timestamp on the Dashboard (or as a small notice post-login)
5. **Single active session enforcement** -- on login, invalidate all previously active sessions; a new login kicks any existing session. If another session logs in while you're active, you get logged out with a message

### Modify
- `index.html`: add `<meta name="robots" content="noindex, nofollow" />`
- `LoginPage.tsx`: add failed-attempt counter with lockout logic and countdown; display last login time after credentials step
- `App.tsx`: add inactivity timer (30 min), warning at 28 min, auto-logout on timeout; on login check for and enforce single session
- `sessionStore.ts`: add helpers for lockout state, last login timestamp, and single-session enforcement (clear all active sessions on new login)
- `Dashboard.tsx`: display last login info banner

### Remove
- Nothing removed

## Implementation Plan
1. Update `index.html` with noindex/nofollow meta tags and proper title
2. Add lockout helpers to `sessionStore.ts`: `getLoginAttempts`, `incrementLoginAttempts`, `resetLoginAttempts`, `getLockoutUntil`, `setLockoutUntil`, `getLastLoginTime`, `setLastLoginTime`, `clearAllActiveSessions`
3. Update `LoginPage.tsx`:
   - On mount, check lockout -- if locked show countdown and disable form
   - On failed attempt, increment counter; at 5 lock for 5 minutes
   - On success, reset attempts, record last login time, call `clearAllActiveSessions` then register new session
   - Show last login time on credentials form if available
4. Update `App.tsx`:
   - Add inactivity timeout hook (reset on mousemove/keydown/click/scroll)
   - At 28 min show warning dialog with countdown
   - At 30 min auto-logout
   - On login success call single-session enforcement
5. Update `Dashboard.tsx` to show last login notice banner
