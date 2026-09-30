# Sukhman's Counsel ⚖️👑

A deeply personal, luxury full-stack AI agent crafted exclusively for **Sukhman** to conquer **CLAT 2027** (December 6, 2026, 2:00 PM – 4:00 PM IST) and achieve her dream of stepping into **NLS Bangalore** (National Law School of India University) — India's #1 law school.

---

## 🎨 Aesthetic Highlights
- **Palette**: Deep Navy-Black (`#07071a`), Electric Violet (`#7c3aed`), Warm Gold (`#f59e0b`), Soft Rose-Pink (`#ec4899`).
- **Persisting Animated Background**: 150 drifting star particles rendered via HTML5 Canvas + breathing multi-color Aurora gradient.
- **Typography**: Google Fonts *Playfair Display* (luxury headings) + *Inter* (body text).
- **Glassmorphism**: Frosted glass panels with violet hover glows and smooth micro-animations powered by Framer Motion.

---

## 🧠 Core Features & 6 Sanctums

1. **🔐 Login Gateway**: Pre-filled `"Sukhman"`, secret key authentication (`Sukhman0118`), and daily rotating law quotes.
2. **📊 Dashboard**:
   - Time-sensitive greeting: *"Good morning/afternoon/evening, Sukhman 👑"*.
   - Rotating Counsel pep talks.
   - Target countdown timer to **December 6, 2026, 2:00 PM IST**.
   - Important dates banner: Registration closes Oct 31, 2026 • Admit Cards: Nov 2026 • Exam: Dec 6, 2026.
   - Count-up quick stats and interactive mode cards.
3. **📚 CLAT Prep Mode**:
   - Passage-based AI tutor utilizing Google Gemini (`gemini-3.6-flash`).
   - Quick topic chips: Constitution, Contracts, Torts, Criminal Law, Current Affairs, Logical Reasoning, English, Quant.
   - Conversation history sidebar with session management.
4. **🌙 Chill Space**:
   - Warmer rose/pink palette shift.
   - Empathetic AI best friend mode (zero CLAT pressure) to discuss food, life, movies, and stress relief.
5. **⚡ Quiz Arena**:
   - 10 to 50 MCQ slider with instant feedback and flip animations.
   - Authentic CLAT scoring: `+1` for correct, `-0.25` for wrong.
   - Dynamic badges: *"NLS Ready 🏆"*, *"Keep Grinding 💪"*, *"Back to Books 📚"*.
   - Celebratory confetti on >80% score.
6. **📅 Study Planner**:
   - Auto-calculated countdown from today to Dec 6, 2026.
   - Weak topics selector + daily hours slider (1–8 hrs).
   - Milestone timeline cards.
7. **📰 Current Affairs Digest**:
   - Supreme Court constitutional bench rulings, landmark cases, legal reforms.
   - Category badges (Legal, National, International, Economy) with CLAT relevance notes.
8. **🔖 Bookmarks & Error Log**:
   - Tab 1: Saved articles and legal briefs.
   - Tab 2: Wrong answers review with one-click re-attempt.

---

## 🛠️ Tech Stack & Setup

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React, Canvas Confetti.
- **Backend**: Python Flask, Flask-CORS, SQLAlchemy, SQLite, Google GenAI SDK.
- **Environment**: Key pre-configured in `backend/.env`.

### Running the App:
```bash
# Terminal 1: Backend
cd backend
python3 app.py

# Terminal 2: Frontend
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.
Default Username: `Sukhman`
Default Secret Key: `Sukhman0118`
