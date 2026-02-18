# GyanSetu - GPSC Preparation Portal 📖🚀

GyanSetu is a high-performance, full-stack educational platform tailored for GPSC aspirants. It provides a secure, role-based environment featuring a real-time AI Tutor, premium study material management, and an expert-led curriculum.

## 🛠️ Tech Stack
- **Frontend:** React.js, Tailwind CSS, Framer Motion (Animations)
- **Backend:** Flask (Python), SQLAlchemy, Google GenAI SDK
- **AI Engine:** Google Gemini 2.0 Flash Lite (Direct Intelligence)
- **Database & Auth:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (PDF/Document hosting)

## ✨ Features Implemented

### 🤖 AI Tutor Integration (New!)
- **Gemini-Powered Assistance:** A real-time AI expert capable of answering complex queries regarding Indian Polity, Gujarat History, and GPSC exam strategies.
- **Direct Intelligence:** Leverages the `gemini-2.0-flash-lite` model for high-speed, accurate responses without the latency of vector indexing.
- **Smart Error Handling:** Built-in rate-limit protection to ensure a smooth student experience even during peak traffic.

### 🔐 Identity & Access Management
- **Role-Based Access Control (RBAC):** Distinct, protected portals for Students and Experts.
- **JWT Metadata Integration:** Secure role verification using `auth.jwt()` metadata for high-performance session handling.
- **Auth Trigger Sync:** Seamless synchronization between Supabase Auth and public `users` table via PostgreSQL triggers.

### 🎓 Student Portal
- **Dashboard:** Personalized overview with progress tracking and quick-access materials.
- **Syllabus Registry:** Comprehensive, filterable access to Prelims and Mains syllabi.
- **Video Library:** Curated YouTube lecture series with subject-wise filtering.
- **Study Materials:** Categorized repository for expert-curated PDF notes.

### 🛠️ Expert Control Panel
- **Content Management:** Streamlined upload system for Syllabi and Study Materials.
- **Video Publishing:** Instant publishing of video content with live iframe previews.
- **Student Management:** Centralized view of all enrolled students and registration analytics.
- **Analytics Dashboard:** Real-time metrics for total content reach and student enrollment.



## 🚧 Roadmap

- [ ] **Daily Quiz Engine:** Implementation of the `tests` logic for real-time practice.
- [ ] **Mock Interview Scheduling:** A booking system to connect students with expert interviewers.
- [ ] **Performance Visuals:** Interactive charts (Recharts) to track student engagement.
- [ ] **Payment Gateway:** Integration for 'Premium' content tier access.

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `pip install -r requirements.txt`
3. Configure `.env`:
   ```env
   DATABASE_URL=your_supabase_postgres_url
   GEMINI_API_KEY=your_google_ai_studio_key