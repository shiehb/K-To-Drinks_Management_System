# Project Setup and Usage

This project consists of a frontend and a backend. Below are the steps to set up and run the development servers.

-----------------------------------------------------------------------


http://k-to-drinks-management-system.onrender.com/
### Backend Setup and Usage

Name:  JERICHO URBANO
Email: jerichourbano.01.01.04@gmail.com
Teams:
  Nigguss: Owner Reviewer
────────────────────┐
 Netlify Site Info  │
────────────────────┘
Current site: stately-brioche-cceac8
Admin URL:    https://app.netlify.com/sites/stately-brioche-cceac8
Site URL:     https://k-to-drinks.netlify.app/
Site Id:      dec03552-0c26-46a1-855f-15e8ddc9f113


## Commands

### Frontend
- **`npm run dev`**: Starts the frontend development server. 

### Backend
1. Navigate to the backend directory:
   - cmd
  **`cd backend\user_management`**

2. Start the backend development server:
   - cmd
   **`py manage.py runserver`**

----------------------------------------------------------------

### Development URLs

Frontend
Access the frontend at: `http://localhost:5173/`

Login to the frontend
## Username: `admin`
## Password: `123`

Backend API Endpoints
Fetch all users:
GET `http://127.0.0.1:8000/api/users/`

Add a new user:
POST `http://127.0.0.1:8000/api/users/`

Update a user:
PUT `http://127.0.0.1:8000/api/users/1/`

Archive a user:
PUT `http://127.0.0.1:8000/api/users/1/archive/`

Unarchive a user:
PUT `http://127.0.0.1:8000/api/users/1/unarchive/`

Delete a user:
DELETE `http://localhost:8000/api/users/1/delete/`

Admin user
Access the admin panel at: `http://127.0.0.1:8000/admin/`
## Username: `admin`
## Password: `123`
