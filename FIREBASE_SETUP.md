# Synerbit Ecosystem — Firebase & Admin Console Setup Guide

This guide walks you through connecting your live Firebase backend to the Synerbit client website and the Admin Console (`admin.synerbit.in`).

---

## 1. Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g. `synerbit-ecosystem`).
2. Add a **Web App** (`</>`) in Project Settings > General > Your apps.
3. Copy your `firebaseConfig` snippet.

---

## 2. Configure Firebase in the Codebase

Open [`src/firebase.js`](file:///Users/rajeev/.gemini/antigravity/scratch/synerbit-landing/src/firebase.js) and replace the placeholders:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "synerbit-ecosystem.firebaseapp.com",
  projectId: "synerbit-ecosystem",
  storageBucket: "synerbit-ecosystem.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:..."
};
```

*(Note: Until live credentials are provided, the system runs in **Persistent Demo Mode**, storing and retrieving data seamlessly via local storage so all features are interactive right away.)*

---

## 3. Enable Firebase Services

### A. Authentication
- Go to **Build > Authentication > Sign-in method**.
- Enable **Email/Password** (and optionally Google Provider).
- Create your Super Admin account (e.g. `rajeev@synerbit.in`).

### B. Cloud Firestore
- Go to **Build > Firestore Database** and create a database.
- The system automatically interacts with the following collections:
  - `products`: Product listings on `synerbit.in/products.html`.
  - `jobs`: Open career roles on `synerbit.in/jobs.html`.
  - `job_applications`: Candidate submissions with resume links.
  - `idea_submissions`: Founder SaaS concept proposals from `synerbit.in/submit-idea.html`.
  - `contact_messages`: Inquiries from contact forms.
  - `team`: Authorized console users and granular permission flags.

### C. Cloud Storage (for Resumes & Assets)
- Go to **Build > Storage** and create a default bucket.
- Resumes uploaded by job applicants will be automatically stored in the `resumes/` folder.

---

## 4. Subdomain Deployment (`admin.synerbit.in`)

To host the Admin Console on a dedicated subdomain:
1. **Option 1 (Vercel / Netlify)**:
   - Deploy this repository to a new Vercel/Netlify project.
   - Set custom domain to `admin.synerbit.in`.
   - Set rewrite / route to serve `/admin/index.html` as the root.
2. **Option 2 (Firebase Hosting)**:
   - Run `firebase init hosting` and configure a target for `admin.synerbit.in` pointing to `dist/admin`.
3. In your DNS provider (Cloudflare, GoDaddy, Namecheap), create a CNAME record:
   - **Type**: `CNAME`
   - **Name**: `admin`
   - **Value**: Your hosting provider's CNAME target.

---

## 5. Granular Role-Based Access Control (RBAC)

When you log in as Super Admin (`rajeev@synerbit.in`), navigate to the **Team & Roles** tab:
- Add any team member with their email address.
- Select checkboxes for the specific modules they are permitted to access:
  - [✓] Products Catalog
  - [✓] Job Openings
  - [✓] Job Applications
  - [ ] SaaS Idea Pitches
  - [✓] Contact Messages
- When that user signs in, unauthorized tabs and queues are completely hidden from their sidebar in real-time.
