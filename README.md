# Job Application Platform

A comprehensive platform for managing job applications, with features for resume analysis, cover letter generation, and application tracking.

## Features

- Resume upload and AI-powered analysis
- Cover letter generation with customizable tones
- Job application tracking with status updates and notes
- Google OAuth authentication
- Modern, responsive UI

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLite3, SQLAlchemy
- AI: OpenAI GPT-4
- Authentication: Google OAuth

## Prerequisites

- Node.js 18+
- Python 3.8+
- Google Cloud Platform account
- OpenAI API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd job-application-platform
```

### 2. Set up the backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations
alembic upgrade head

# Start the backend server
uvicorn main:app --reload
```

### 3. Set up the frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Google OAuth credentials

# Start the development server
npm run dev
```

### 4. Configure Google OAuth

1. Go to the Google Cloud Console
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - http://localhost:3000
6. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/google
7. Copy the client ID and client secret to your environment files

### 5. Get OpenAI API Key

1. Go to OpenAI's website
2. Create an account or sign in
3. Generate an API key
4. Add the key to your backend .env file

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Visit http://localhost:3000 in your browser

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for the interactive API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 