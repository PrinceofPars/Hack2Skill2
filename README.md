# Smart Election Navigator

An interactive, AI-driven web application that provides localized, step-by-step guidance on voting procedures, registration timelines, and candidate information.

## 🌟 Features

- **Localized Timeline Generator**: Personalized countdown for registration, mail-in requests, and early voting based on ZIP code.
- **Interactive How-To Modules**: Step-by-step guides for first-time registration, absentee ballots, and ID requirements.
- **Ballot Previewer**: Clean display of who and what is on your local ballot (powered by Google Civic API).
- **AI FAQ Assistant**: Non-partisan AI chat grounded in verified state election laws.
- **Deadline Reminders**: Email and SMS alerts for upcoming voting deadlines.
- **Export Voting Plan**: Generate a personalized one-page PDF summary for Election Day.

## 🚀 Getting Started

This project is separated into a React/Vite frontend (`client`) and a Node.js/Express backend (`server`).

### Prerequisites
- Node.js (v16 or higher recommended)
- MongoDB account (optional, for saving sessions)
- Google Cloud account (optional, for live ballot data)

### 1. Setup the Backend (Server)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create or open the `.env` file in the `server` directory and ensure your API keys are added:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   
   # MongoDB (Optional)
   MONGODB_URI=your_mongodb_connection_string
   
   # Google Civic Information API (Optional - required for Ballot Preview)
   GOOGLE_CIVIC_API_KEY=your_google_civic_api_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server should now be running on http://localhost:5000*

### 2. Setup the Frontend (Client)

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application should now be running on http://localhost:5173*

## 🛠️ Technology Stack

- **Frontend**: React, Vite, React Router, CSS Variables (Custom Design System)
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **APIs**: Google Civic Information API
- **Utilities**: jsPDF (Client-side PDF generation), Nodemailer, Twilio (Reminders)
