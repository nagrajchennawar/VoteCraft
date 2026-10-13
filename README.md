# VoteSphere

A responsive React + Vite voting prototype. Polls and votes are stored in the current browser's `localStorage`; the remembered voter name is stored in `sessionStorage`.

## Run locally

1. Install Node.js 18 or later.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

Run `npm run build` to create the production bundle in `dist/`, or `npm run preview` to preview that bundle.

## GitHub and Vercel

1. Create an empty GitHub repository, then from this folder run `git init`, `git add .`, `git commit -m "Build VoteSphere voting app"`, `git branch -M main`, `git remote add origin <your-repository-url>`, and `git push -u origin main`.
2. In Vercel, import the GitHub repository. Vercel detects Vite automatically; use `npm run build` as the build command and `dist` as the output directory.
3. Deploy and share the URL Vercel assigns to your project.

## Prototype security and data limits

This application deliberately has no backend and is a demonstration, not a secure or shared voting system. Browser storage is editable by its user, is not shared between devices, and cannot enforce one-vote-per-person across browsers. The Admin data view asks for a demo password and groups voter choices under their poll names, but that password is embedded in the React bundle and can be found or bypassed by visitors. This is only a casual UI gate; it does not make voter-level records private.

Do not use this prototype for sensitive, confidential, or binding votes. For production, add a backend and database, validate votes server-side, apply database uniqueness constraints, and protect admin APIs with server-side authentication/authorization and secure session cookies. Never send private voter records through public APIs.
