# AI Interview Assistant

An AI-powered interview assessment platform built with **React**, **Redux Toolkit**, and **Tailwind CSS**. It provides a **Candidate view** for taking timed interviews and an **Interviewer Dashboard** for managing question sets and monitoring candidate results.

This application uses **Supabase** as its backend, handling all data storage and functionalities. This ensures that data is persistent and accessible across different sessions and devices.

---

## 🚀 Features

### Candidate Flow

![Candidate flow](assets/user2.svg)

* **Enter Interview Code**: Candidate starts by entering the unique code provided by the interviewer.
* **Upload Resume**: Upload a resume in `.txt` or `.docx` format (≤ 5 MB).

  * Name, Email, and Phone auto-extracted using regex heuristics.
  * Missing fields can be filled manually.
* **View Instructions**: Clear instructions shown before starting (rules, scoring criteria, disqualification conditions).
* **Answer Questions**:

  * 6 questions (2 Easy, 2 Medium, 2 Hard).
  * Each question timed (default 120 seconds).
  * Switching tabs or closing browser marks interview as abandoned.
  * Empty answers or timeouts yield a score of 0.
* **Instant Feedback**: Immediate feedback after each answer.
* **Final Score**: Weighted score with performance breakdown shown at the end.

### Interviewer Flow

![Interviewer flow](assets/interviewer.svg)

* **Create a Question Set**:

  * Manual entry via form.
  * Bulk CSV upload with format:

    ```csv
    difficulty,question,keywords,maxScore
    easy,"What is var, let, and const in JS?","var;let;const;scope;hoisting",10
    medium,"Explain JWT authentication.","jwt;authentication;token;header;payload",10
    hard,"Design a scalable file upload service.","scalable;file upload;cdn;storage;api gateway",15
    ```
  * Validation ensures at least 2 questions per difficulty level.
* **Code Generation**:

  * Generates unique Interview Code (candidates) and Dashboard Code (interviewer).
* **Share Code**: Interviewer shares Interview Code with candidates.
* **Monitor Dashboard**:

  * Candidate overview (Name, Email, Phone, Status, Final Score).
  * Detailed analysis of answers, matched keywords, and scores.
  * Aggregate statistics: total candidates, completion rate, average scores.

---

## ⚙️ Evaluation Logic

![Evaluation logic](assets/marks.svg)

### Normalization

* Answers converted to lowercase.
* Punctuation stripped.
* Extra whitespace removed.

### Keyword Matching

* System checks for presence of predefined keywords.
* Each match is recorded.

### Scoring

```
baseScore = (matchedKeywords / totalKeywords) * maxScore
```

### Bonus

* +1 point if answer exceeds 20 words.
* Max score per question = `maxScore + 1`.

### Final Weighted Score

* Easy = weight 1
* Medium = weight 2
* Hard = weight 3

```
final_score = Σ(score_i × weight_i) / Σ(weights)
```

**Example:**

* Easy: 6, 7
* Medium: 8, 5
* Hard: 9, 6
* Final Score ≈ **7.2**

---

## 📂 Project Structure

```
ai-interview-assistant/
├── index.html               # Entry HTML
├── package.json             # Dependencies
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
├── postcss.config.js
├── src/
│   ├── App.jsx              # Main view controller
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind directives
│   ├── components/          # UI Components
│   │   ├── HomePage.jsx
│   │   ├── CreateQuestions.jsx
│   │   ├── CandidateFlow.jsx
│   │   ├── ResumeUpload.jsx
│   │   ├── InterviewInstructions.jsx
│   │   ├── InterviewQuestion.jsx
│   │   ├── QuestionFeedback.jsx
│   │   ├── InterviewComplete.jsx
│   │   └── InterviewerDashboard.jsx
│   ├── store/
│   │   ├── store.js         # Redux store config
│   │   └── interviewSlice.js # State management
│   └── utils/
│       └── evaluation.js    # Evaluation + scoring logic
```

---

## 🛠️ Installation

Clone repository:

```bash
git clone <repo-url>
cd ai-interview-assistant
```

Install dependencies:

```bash
npm install
```

---

## 🔧 Environment Setup

Create `.env` file at project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_ANON_key
```

---

## ▶️ Run

Development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

---

## 📊 State Management

* **Redux Toolkit** for central state management.
* **State**: Stores `questionSets`, `candidates`, `interviewSessions`.
* **Actions**: Reducers like `createQuestionSet`, `createCandidate`, `submitAnswer`, `updateFinalScore`.
* **Persistence**: Supabase PostgreSQL stores all app data.
* Async thunks sync state with Supabase.

---

## 📑 Security & Limitations

* File format: only `.txt` and `.docx` resumes supported.
* No PDF support (client parsing unreliable).
* Max file size: 5 MB.
* Data stored securely in Supabase.
* No authentication: interviewer dashboard accessible with Dashboard Code.

---

## 🔮 Future Enhancements

* Server-side PDF resume parsing.
* Authentication + role-based access control.
* Candidate reports export (CSV, PDF).
* Real-time dashboard sync.
* AI-based semantic scoring (beyond keyword matching).
* Advanced interviewer analytics with visualization.

---

## 📝 Conclusion

The **AI Interview Assistant** streamlines the hiring process by automating candidate assessments, scoring, and monitoring. Its seamless **candidate flow** ensures a fair test environment, while the **interviewer dashboard** empowers recruiters with detailed insights and statistics. By leveraging **React**, **Redux Toolkit**, **Tailwind CSS**, and **Supabase**, this project achieves a scalable, secure, and user-friendly solution for modern interview management.

This project can serve as a foundation for building more advanced **AI-driven recruitment systems**, integrating NLP, semantic analysis, and predictive analytics in future versions.

---

## 👨‍💻 Author

**Parimal Maity**
AI & Full Stack Developer
📧 Contact: [parimalmaity852@gmail.com](mailto:parimalmaity852@gmail.com)
🔗 GitHub: [https://github.com/parimal-art](https://github.com/parimal-art)

---

> "The best way to predict the future is to create it." – Peter Drucker
