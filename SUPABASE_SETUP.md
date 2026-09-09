# NOVA NOTES — Supabase Setup & Deployment Guide

This guide details the complete 14-step setup process for connecting Supabase PostgreSQL and Google Authentication to Nova Notes.

---

### Step 1: Where to create the project
1. Open your web browser and navigate to: **[https://supabase.com](https://supabase.com)**
2. Click **Start your project** or **Sign In** using your GitHub, Google, or email credentials.

---

### Step 2: What to click
1. Inside your Supabase Dashboard, click the green **New Project** button.
2. Select your Organization.
3. In the project creation form, enter:
   - **Name**: `nova-notes`
   - **Database Password**: Set a strong, secure password and save it in a safe place.
   - **Region**: Choose the region closest to your users (e.g. `ap-south-1` for Mumbai / India, or `us-east-1` for US).
   - **Pricing Plan**: Free tier is sufficient for complete placement preparation and testing.
4. Click **Create new project** and allow ~2 minutes for PostgreSQL provisioning.

---

### Step 3: Where to enable Google Authentication
1. In the Supabase left navigation panel, click the **Authentication** icon (padlock/user icon).
2. Under the **Configuration** subsection, click **Providers**.
3. Scroll through the provider list to locate **Google**.
4. Click on **Google** and toggle the switch to **Enable Google provider: ON**.

---

### Step 4: Where to configure OAuth (Google Cloud Console)
1. In a new browser tab, open the **[Google Cloud Console](https://console.cloud.google.com)**.
2. Select or create a Google Cloud Project for OAuth credentials.
3. Navigate to **APIs & Services** → **OAuth consent screen**:
   - Choose User Type: **External**.
   - Fill in App name ("Nova Notes"), User support email, and Developer contact information.
   - Click Save and Continue.
4. Navigate to **APIs & Services** → **Credentials**:
   - Click **+ CREATE CREDENTIALS** at the top.
   - Select **OAuth client ID**.
   - Application type: choose **Web application**.
   - Name: `Nova Notes Supabase Auth`.

---

### Step 5: What redirect URL to use
1. In your Supabase Dashboard under **Authentication** → **Providers** → **Google**, copy the value displayed in the **Callback URL (for OAuth)** field.
   It looks like:
   ```text
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
2. In Google Cloud Console under your new OAuth Client ID:
   - Under **Authorized JavaScript origins**, add your app domain and Supabase domain:
     - `https://<your-project-id>.supabase.co`
     - `https://ais-dev-cxhak5zwm74lr6n2exyy57-777159642364.asia-east1.run.app` (or your active APP_URL)
   - Under **Authorized redirect URIs**, paste your Supabase Callback URL:
     - `https://<your-project-id>.supabase.co/auth/v1/callback`
3. Click **Create**. Copy the generated **Client ID** and **Client Secret**.
4. Return to Supabase → **Authentication** → **Providers** → **Google**, paste the **Client ID** and **Client Secret**, and click **Save**.

---

### Step 6: Where to get the Project URL
1. In your Supabase project left sidebar, click **Project Settings** (gear icon at the bottom).
2. Click **API** under Configuration.
3. Under **Project API configuration**, copy the **Project URL**:
   ```text
   https://<your-project-ref>.supabase.co
   ```

---

### Step 7: Where to get the publishable / anon key
1. On the same **Project Settings** → **API** page, look under **Project API keys**.
2. Locate the key labeled **`anon` `public`**.
3. Click the copy icon to copy the JWT string (starts with `eyJ...`).

---

### Step 8: Where to put each environment variable
In the root directory of this project (or via the Settings / Secrets menu in Google AI Studio), add the following environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."

# Server-Side Authorized Admin Email
ADMIN_EMAIL="bathrinarayanan53@gmail.com"

# Google Gemini AI API Key (Injected by AI Studio)
GEMINI_API_KEY="AIzaSy..."
```

---

### Step 9: How to run migrations
1. In your Supabase left sidebar, click the **SQL Editor** icon (`>_`).
2. Click **+ New query**.
3. Open the file `supabase/schema.sql` (or `supabase/migrations/20260909_nova_notes_schema.sql`) from this codebase.
4. Copy the entire file content and paste it into the Supabase SQL query editor.
5. Click the green **Run** button at the bottom right.
6. Supabase will execute the DDL, creating all 16 tables, custom enum types, automated signup triggers, indexes, and Row Level Security (RLS) policies. You should see `Success. No rows returned`.

---

### Step 10: How to seed the database
The migration script automatically seeds the initial placement roles (`Python Developer`, `Data Analyst`, `Full Stack Developer`, `Machine Learning Engineer`, `Data Engineer`, `AI Engineer`) and baseline configuration. You can verify this by clicking **Table Editor** → `roles` in the left sidebar.

---

### Step 11: How to create the first account
1. Open the Nova Notes application in your browser.
2. On the Welcome / Login screen, make sure **Student Login** is selected.
3. Click **Continue with Google**.
4. Complete the Google authentication dialog.
5. The PostgreSQL trigger `on_auth_user_created` automatically inserts a record into `public.profiles` with your Google email, display name, and sets the default role to `student`.
6. You are immediately directed to your Student Dashboard.

---

### Step 12: How to promote the project owner to admin (Single Admin Mandate)
1. Go back to your Supabase Dashboard and open the **SQL Editor** (`>_`).
2. Run this single SQL command:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'bathrinarayanan53@gmail.com';
   ```
3. Your account is now officially verified as the sole System Administrator in the database!

---

### Step 13: How to test Student Login
1. On the Nova Notes Login page, select the **Student Login** tab.
2. Click **Continue with Google** (using any test student Google account).
3. The app authenticates and launches the **Student Dashboard**, showing:
   - Placement Readiness Index
   - 6 Career Roles
   - Diagnostic Assessment History
   - Ungraded Practice Sandboxes (MCQ, Pseudocode, Real Coding, Interview Practice)
   - Verified that admin-only tabs (`Admin Controls`) are hidden from navigation.

---

### Step 14: How to test Admin Login
1. On the Nova Notes Login page, select the **Admin Login** tab.
2. **Authorized Test**:
   - Sign in with `bathrinarayanan53@gmail.com`.
   - The server validates the email against `ADMIN_EMAIL`.
   - The system grants access and opens the **Admin Dashboard** with Candidate Management, Question Bank CRUD, System Configurations, and Test Features.
3. **Unauthorized Test**:
   - Change the account on the Login page to any other email (e.g. `student@novanotes.edu`).
   - Click **Continue with Google** while on the Admin Login tab.
   - The server rejects the request and the app renders the **Admin Access Denied** card:
     > *"Admin Access Denied: This portal is strictly reserved for the designated administrator."*
   - Administrative features remain inaccessible to unauthorized accounts.
