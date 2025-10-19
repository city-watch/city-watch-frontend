# City Watch — Frontend Developer Documentation

City Watch is a civic engagement platform designed to connect citizens with city employees to report and resolve community issues efficiently. 
This repository contains the frontend portion of the system, built using React, Vite, and TailwindCSS. 
The frontend provides map-based issue reporting, login functionality, and role-based dashboard routing.

--------------------------------------------------------------------------------
TECH STACK
--------------------------------------------------------------------------------
Framework: React 18 (Vite)
Styling: Tailwind CSS
Routing: React Router DOM v6
Maps: Leaflet (react-leaflet)
API Communication: Fetch (REST JSON)
Deployment: Vite build system

--------------------------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------------------------
src/
├─ components/
│  ├─ Navbar.jsx
│  └─ Footer.jsx
│
├─ pages/
│  ├─ Home.jsx         # Landing page with login role selector
│  ├─ Login.jsx        # Role-based authentication form
│  ├─ Report.jsx       # Citizen issue submission with map
│  ├─ Dashboard.jsx    # Citizen dashboard (placeholder)
│  ├─ Employee.jsx     # Staff dashboard (placeholder)
│  └─ Admin.jsx        # Admin analytics view (placeholder)
│
├─ App.jsx             # Routing and layout
└─ main.jsx            # Vite entry point

--------------------------------------------------------------------------------
ROUTING OVERVIEW
--------------------------------------------------------------------------------
/                     → Home (Landing page with login dropdown)
/login?role=citizen   → Login (Citizen login)
/login?role=staff     → Login (Staff login)
/report               → Report (Civic issue submission form)
/dashboard            → Dashboard (Citizen dashboard)
/employee             → Employee (Staff dashboard)
/admin                → Admin (Admin analytics dashboard)

--------------------------------------------------------------------------------
LOCAL DEVELOPMENT SETUP
--------------------------------------------------------------------------------
1. Install dependencies:
   npm install

2. Set up environment variables:
   Create a .env file in the project root:
   VITE_API_URL=http://localhost:5000/api

3. Run the development server:
   npm run dev

4. Open http://localhost:5173

--------------------------------------------------------------------------------
AUTHENTICATION FLOW
--------------------------------------------------------------------------------
The system supports two login paths:
 - Citizen Login — for users submitting reports
 - Staff Login — for city employees managing issues

STEP 1: Role Selection
Users start at "/" and select a role from a dropdown in Home.jsx:
 - /login?role=citizen
 - /login?role=staff

STEP 2: Login Request
The Login.jsx form sends a POST request to:
   POST /api/login

Example Request Body:
{
  "email": "user@example.com",
  "password": "secret",
  "role": "citizen"
}

Expected Response:
{
  "token": "JWT_TOKEN_STRING",
  "role": "citizen"
}

Frontend stores:
localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);

Redirect:
 - Citizens → /dashboard
 - Staff → /employee

--------------------------------------------------------------------------------
REPORTING FLOW (Report.jsx)
--------------------------------------------------------------------------------
Citizens can submit new civic issues via an interactive Leaflet map.

Data collected:
 - Map coordinates (latitude, longitude)
 - Description text
 - Uploaded photo (required)

Frontend example submission:
{
  position: { lat: 40.7128, lng: -74.006 },
  description: "Broken streetlight on 5th Avenue",
  photo: "streetlight.jpg"
}

Expected backend endpoint:
   POST /api/reports

Multipart/form-data fields:
 - description (string)
 - lat (number)
 - lng (number)
 - photo (file)

Example response:
{
  "message": "Report submitted successfully",
  "reportId": "abc123",
  "status": "submitted"
}

--------------------------------------------------------------------------------
FRONTEND → BACKEND DATA CONTRACTS
--------------------------------------------------------------------------------
Action               | Endpoint             | Method | Example Payload
---------------------|---------------------|---------|----------------
Citizen login        | /api/login          | POST    | { email, password, role: "citizen" }
Staff login          | /api/login          | POST    | { email, password, role: "staff" }
Submit civic issue   | /api/reports        | POST    | { lat, lng, description, photo }
Get issues (future)  | /api/reports        | GET     | n/a
Update issue (staff) | /api/reports/:id    | PATCH   | { status: "resolved" }

--------------------------------------------------------------------------------
BACKEND IMPLEMENTATION EXPECTATIONS
--------------------------------------------------------------------------------
1. Authentication Routes
   - /api/login → Validate credentials, return { token, role }
   - Must support both "citizen" and "staff"
   - Enable CORS for origin http://localhost:5173

2. Report Management
   - /api/reports → Accept POST with civic issue data
   - Store lat, lng, description, and media file path
   - Optionally perform duplicate detection

3. Role-Based Access
   - Citizens: only view own issues
   - Staff: view and update all issues
   - Admin: analytics and configuration access (future)

--------------------------------------------------------------------------------
AUTHENTICATION AND STORAGE
--------------------------------------------------------------------------------
Frontend expects JWT authentication.

Token flow:
 - On login: backend returns token
 - Frontend stores token in localStorage
 - Future API calls should include Authorization: Bearer TOKEN

Logout behavior (Navbar suggestion):
localStorage.removeItem("token");
localStorage.removeItem("role");
navigate("/login");

--------------------------------------------------------------------------------
SYSTEM CONTEXT (From Specification)
--------------------------------------------------------------------------------
User Types:
 - Citizen
 - City Employee
 - Administrator

Key Features:
 - Report issues (with AI-assisted categorization)
 - Confirm existing reports (future)
 - Track issue status (citizens)
 - Merge and resolve reports (employees)
 - View analytics (managers)

Backend should support:
 - Issue lifecycle: Submitted → In Review → In Progress → Resolved → Archived
 - Role-based dashboards and permissions
 - Analytics endpoints for managers

--------------------------------------------------------------------------------
DEVELOPER NOTES
--------------------------------------------------------------------------------
 - /api/login and /api/reports are placeholders until backend is ready.
 - Leaflet icons are preconfigured for Vite.
 - Dashboard, Employee, and Admin pages are UI placeholders.
 - Theme: dark blue aesthetic (bg-cwDark, text-cwText, bg-cwBlue).

--------------------------------------------------------------------------------
API INTEGRATION CHECKLIST
--------------------------------------------------------------------------------
Task                        | Backend Responsibility
----------------------------|-------------------------
Setup /api/login            | Validate credentials, return token + role
Setup /api/reports          | Accept multipart form data for civic issues
Implement JWT middleware    | Protect dashboards
Add CORS config             | Allow http://localhost:5173
Serve uploaded media        | Host /uploads directory or equivalent

--------------------------------------------------------------------------------
FRONTEND CONTACTS
--------------------------------------------------------------------------------
Tyler Odeh Abbassi – Frontend Lead – tfa21@scarletmail.rutgers.edu
Mahir Shah – Frontend Engineer – mts245@scarletmail.rutgers.edu
Anthony Nguyen – Frontend Engineer – an951@scarletmail.rutgers.edu

--------------------------------------------------------------------------------
SUMMARY
--------------------------------------------------------------------------------
This frontend is fully prepared to integrate with a REST backend exposing:
 - POST /api/login → Authentication
 - POST /api/reports → Civic issue submission
 - GET /api/reports → Retrieve issues (future)
 - PATCH /api/reports/:id → Update issue status (future)

All data is transmitted as JSON or multipart/form-data,
with clear field naming and explicit role-based logic.
