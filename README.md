# MatchifyAI - Smart CV Analyzer

AI-powered CV analyzer that matches your resume with job descriptions and provides intelligent suggestions.

## ✨ Features

- 🔐 Email-based authentication with JWT
- 📄 Upload CV (PDF/DOCX files)
- 🎯 Instant match score (0-100%)
- 📊 Keyword analysis (matched vs missing)
- 🤖 AI-powered suggestions (Google Gemini)
- 📈 Dashboard with statistics
- 📜 Save and view analysis history
- 🗑️ Delete old analyses
- 📱 Fully responsive design

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Backend | Django 6.0, Django REST Framework, PostgreSQL, JWT, Gemini AI |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| File Processing | PyPDF2, python-docx |

## 🚀 Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL 16+
- Gemini API key (get from [Google AI Studio](https://aistudio.google.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/matchifyAI.git
cd matchifyAI/backend

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create PostgreSQL database
psql -U postgres
CREATE DATABASE matchifyai_db;
CREATE USER matchifyai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE matchifyai_db TO matchifyai_user;
\q

# Create .env file
echo GEMINI_API_KEY=your_gemini_api_key_here > .env

# Run migrations
python manage.py makemigrations accounts analyzer
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start backend server
python manage.py runserver
Backend runs at http://localhost:8000

🎨 Frontend Setup
Prerequisites
Node.js 18+

Installation
bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
Frontend runs at http://localhost:3000

🔧 Environment Variables
Backend (backend/.env)
env
GEMINI_API_KEY=your_gemini_api_key_here
DEBUG=True
Frontend (frontend/.env.local) - Optional
env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
📁 Project Structure
text
matchifyAI/
├── backend/
│   ├── accounts/              # Authentication app
│   │   ├── models.py         # Custom User model (email as primary key)
│   │   ├── views.py          # Register, Login, Profile views
│   │   ├── serializers.py    # User serializers
│   │   └── urls.py           # Auth endpoints
│   ├── analyzer/              # CV Analysis app
│   │   ├── models.py         # CVAnalysis model
│   │   ├── views.py          # Analyze, Save, History views
│   │   ├── serializers.py    # Analysis serializers
│   │   ├── utils.py          # PDF/DOCX extraction, keyword matching, Gemini AI
│   │   └── urls.py           # Analyzer endpoints
│   ├── matchifyai_backend/    # Django settings
│   │   ├── settings.py       # Django configuration
│   │   └── urls.py           # Main URL routing
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
└── frontend/
    ├── app/
    │   ├── (auth)/            # Login, Register pages
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── (dashboard)/       # Dashboard, Upload, History pages
    │   │   ├── dashboard/page.tsx
    │   │   ├── upload/page.tsx
    │   │   ├── history/page.tsx
    │   │   └── history/[id]/page.tsx
    │   ├── layout.tsx         # Root layout with AuthProvider
    │   └── page.tsx           # Landing page
    ├── components/
    │   ├── ui/                # shadcn/ui components
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   └── ...
    │   └── layout/            # Layout components
    │       ├── Navbar.tsx
    │       └── Sidebar.tsx
    ├── context/
    │   └── AuthContext.tsx    # Global auth state management
    ├── hooks/
    │   └── useAuth.ts         # Auth hook
    ├── lib/
    │   └── utils.ts           # Utility functions
    ├── package.json           # Node dependencies
    └── tailwind.config.js     # Tailwind CSS config
