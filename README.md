# Pitch IQ — AI Startup Idea Validator

Pitch IQ lets founders validate startup ideas in under 60 seconds. You describe your idea, and the app runs it through Google Gemini to produce a scored viability breakdown, competitor map, target personas, SWOT analysis, and pivot suggestions. You can also export a PDF report or a 10-slide pitch deck, and chat with the AI about your results.

## What it does

Submit a startup idea with a brief description, sector, and business model. The backend spins up a background thread, calls the Gemini API with a structured prompt, and returns a full analysis — scored across six dimensions, with SWOT, competitors, personas, and pivot suggestions. Results appear live via polling. Pro features like PDF export and pitch deck generation are fully unlocked for all users during the beta.

## Features

- AI-powered viability scoring across 6 dimensions (market size, differentiation, revenue potential, competition, execution risk, timing)
- Competitor landscape — local and global, with funding stage and product info
- Target persona generation with pain points and willingness-to-pay
- SWOT analysis
- Pivot suggestions
- PDF report export (ReportLab)
- Pitch deck export (10 slides, python-pptx)
- Unlimited AI Q&A per analysis
- JWT authentication with refresh tokens
- Google OAuth (configurable)
- Clean light dashboard UI with dark sidebar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2 + Django REST Framework |
| Database | MongoDB via MongoEngine (no Django ORM) |
| AI | Google Gemini 2.5 Flash (`google-genai` SDK) |
| Auth | Custom JWT (PyJWT) + MongoEngine user model |
| PDF export | ReportLab |
| PPTX export | python-pptx |
| File storage | Cloudinary (optional) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP client | Axios with JWT interceptor |
| Backend hosting | Render (gunicorn + whitenoise) |
| Frontend hosting | Render (static site) |

## Running locally

### Requirements

- Python 3.13+
- Node.js 18+
- MongoDB Atlas account (free tier works fine)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (see environment variables table below)
cp .env.example .env  # or create manually

# Run the dev server
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to localhost:8000)
npm run dev
```

The app will be at `http://localhost:5173`.

### Environment variables

Create `backend/.env` with these values:

| Variable | Description |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Django secret key — any long random string |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Google Gemini API key from aistudio.google.com |
| `DEBUG` | `True` for local dev, `False` in production |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional, for payments) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (optional) |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan (optional) |
| `CLOUDINARY_URL` | Cloudinary URL for file storage (optional) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |

For local development, `GEMINI_API_KEY` and `MONGODB_URI` are the only ones you actually need.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, returns JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Get current user |
| PATCH | `/api/auth/me/` | Update profile |
| POST | `/api/ideas/` | Submit idea + trigger analysis |
| GET | `/api/ideas/` | List user's ideas |
| GET | `/api/analysis/<id>/` | Get full analysis results |
| GET | `/api/analysis/<id>/status/` | Poll analysis status |
| GET | `/api/analysis/<id>/chat/` | Get chat messages |
| POST | `/api/analysis/<id>/chat/` | Send chat message |
| GET | `/api/analysis/<id>/pdf/` | Download PDF report |
| GET | `/api/analysis/<id>/pptx/` | Download pitch deck |

## Live Demo

[https://pitchiq-frontend.onrender.com](https://pitchiq-frontend.onrender.com)

Note: the backend runs on Render's free tier, so the first request after inactivity may take 30–60 seconds to cold start.

## Author

Ibrahim — [github.com/ihrab](https://github.com/ihrab)
