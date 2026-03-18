# Recruit - AI Powered Recruitment Platform

Recruit is a state-of-the-art AI-powered recruitment platform designed to streamline the hiring process using advanced AI interviews, automated candidate matching, and seamless scheduling.

## 🚀 Features

- **AI Interviews**: Natural language voice and text-based interviews using Gemini 2.0 and Cartesia voice synthesis.
- **Smart Dashboard**: Comprehensive overview of candidates, jobs, and interview statuses.
- **Job Management**: Create and manage job listings with AI-assisted job description generation.
- **Candidate Tracking**: Track candidate progress from application to final analysis.
- **Automated Analysis**: Get detailed AI-generated reports on candidate performance and skills.

## 🛠 Tech Stack

- **Frontend**: Next.js, React, Vanilla CSS (Neural Aesthetic), Framer Motion.
- **Backend**: Node.js, Express, MongoDB.
- **AI/ML**: OpenRouter (Gemini 2.0 Flash), Cartesia Voice API.
- **Database**: MongoDB with Mongoose.

## 📦 Project Structure

```text
├── frontend/          # Next.js application
├── backend/           # Express server and database models
├── RESTART_INSTRUCTIONS.md # Guide to restart the environment
└── restart-servers.ps1 # Automation script for servers
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or a cloud URI)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aadil-hussain-786/Recruit.git
   cd Recruit
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with your MONGO_URI, JWT_SECRET, and API keys
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local file
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.