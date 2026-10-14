# BookLeaf frontend

React, Vite, Tailwind CSS, React Router, and Axios. Code uses functional components,
useState/useEffect, and one shared Axios client in src/services/api.js.

## Run locally

1. Run `npm ci`.
2. Copy `.env.example` to `.env` if you need to change the backend URL.
3. Start the backend on port 5000.
4. Run `npm run dev` and open the URL shown by Vite.

The API defaults to http://localhost:5000/api. Only the public backend URL belongs
in the frontend environment. Gemini keys and database credentials stay in the backend.

## Implemented

- Login, errors, loading state, role-based redirects, and logout.
- Protected author and admin pages.
- My Books with royalties, sales, and production details.
- Admin queue with status/category/priority/date filters and ticket details.
- Admin status/category/priority updates, self-assignment, public responses, and private notes.
- AI draft loads on ticket open, with manual editing and manual fallback.
- Author ticket creation, list, details, and public support responses.
- Automatic updates: ticket list every 10 seconds, details every 8 seconds.
- Optional attachment picker is UI only; files are not uploaded or sent.
- Session-expiry handling and retry buttons for failed page loads.

The login token and user are stored in sessionStorage for this simple demo.
Backend authentication and ownership checks enforce access; frontend route guards
only control navigation. For production, consider HttpOnly cookie authentication.

## Demo logins

Seed the backend first. Author: priya.sharma@email.com. Admin: admin@bookleaf.local.
Both newly seeded accounts use Bookleaf@123. Existing account passwords are not reset by seeding.

## Checks

- `npm run lint`
- `npm run build`

## Next steps

Browser end-to-end verification, deployment, and final assessment documentation remain.
The admin queue has a manual refresh button. Author pages poll for updates.
AI drafts never send automatically, and manual input is preserved while a draft loads.
Use Load AI draft after changing ticket settings to request updated context.
For deployment, set VITE_API_URL before building and configure the host to serve
index.html for client-side routes such as /author/books.
