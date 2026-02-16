# GyanSetu - GPSC Preparation Portal 📖🚀

GyanSetu is a full-stack educational platform tailored for GPSC aspirants. It provides a secure, role-based environment for students to access premium study materials and for experts to manage the curriculum.

## 🛠️ Tech Stack
- **Frontend:** React.js, Tailwind CSS, Framer Motion (Animations)
- **Backend:** Flask (Python), SQLAlchemy
- **Database & Auth:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (PDF/Document hosting)

## ✨ Features Implemented

### 🔐 Identity & Access Management
- **Role-Based Access Control (RBAC):** Distinct portals for Students and Experts.
- **JWT Metadata Integration:** Secure role verification using `auth.jwt()` metadata to prevent RLS recursion and improve performance.
- **Auth Trigger Sync:** Automatic synchronization between Supabase Auth and public `users` table via PostgreSQL triggers.

### 🎓 Student Portal
- **Dashboard:** Personalized overview with mock progress tracking and upcoming tests.
- **Syllabus Registry:** Filterable access to Prelims, Mains, and Interview syllabi with PDF viewing.
- **Video Library:** Embedded YouTube lectures with subject-wise filtering and direct "Watch on YouTube" links.
- **Study Materials:** Categorized repository for PDF study notes.

### 🛠️ Expert Control Panel
- **Content Management:** Specialized forms to upload Syllabi and Materials to Supabase Storage.
- **Video Publishing:** Interface to publish YouTube lectures with real-time iframe previews.
- **Student Management:** Table view of all enrolled students with registration dates.
- **Analytics Dashboard:** Real-time counters for Total Materials, Videos Published, and Enrolled Students.

### 🛡️ Security & Backend
- **Advanced RLS Policies:** Non-recursive Row-Level Security policies ensuring experts can only manage their own content.
- **Unified Schema:** Consolidated `materials` table handling both syllabus and study content via `content_type` flags.

## 🚧 What's Left (Roadmap)

- [ ] **AI Tutor Integration:** An interactive chatbot to answer student queries based on uploaded PDFs.
- [ ] **Daily Quiz Engine:** Implementation of the `tests` and `test_attempts` table logic for real-time practice.
- [ ] **Mock Interview Scheduling:** A booking system for the `interviews` table to connect students with interviewers.
- [ ] **Performance Analytics:** Visual graphs (Recharts/Chart.js) for the Expert Dashboard to track student engagement.
- [ ] **Payment Gateway:** Integration for 'Premium' content access.

## 🚀 Getting Started

1. **Clone the repository**
2. **Backend Setup:**
   - Install dependencies: `pip install -r requirements.txt`
   - Set up `.env` with your Supabase `DATABASE_URL`
   - Run: `python app.py`
3. **Frontend Setup:**
   - Install dependencies: `npm install`
   - Set up `.env` with Supabase keys.
   - Run: `npm run dev`

---
*Developed for GPSC Aspirants with ❤️*
