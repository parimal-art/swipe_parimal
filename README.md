# AI Interview Assistant

An AI-powered interview assessment platform built with **React, Redux Toolkit, and Tailwind CSS**.
It provides a **Candidate view** for taking timed interviews and an **Interviewer Dashboard** for managing question sets and monitoring candidate results.

This implementation runs **entirely in the browser (frontend-only)**. No backend server is required. All data is stored locally in Redux state and persisted with IndexedDB via `redux-persist`.

---

## 🚀 Features
---
### Candidate Flow

![Candidate flow](assets/user2.svg)

The candidate journey is designed to be seamless and straightforward, from receiving the interview code to completing the assessment.

* **Enter Interview Code**: The candidate starts by entering the unique code provided by the interviewer.
* **Upload Resume**: They can upload a resume in TXT or DOCX format (≤5 MB).

  * Name, Email, and Phone are automatically extracted using regex heuristics.
  * If any field is missed, the candidate can fill it in manually.
* **View Instructions**: Before starting, clear instructions are displayed, outlining rules, scoring criteria, and conditions for disqualification.
* **Answer Questions**: The assessment consists of 6 questions (2 Easy, 2 Medium, 2 Hard).

  * Each question is timed with a default countdown of 120 seconds.
  * The interview is marked as abandoned if the candidate switches tabs or closes the browser.
  * An empty answer or running out of time results in a score of 0.
* **Instant Feedback**: After submitting each answer, the candidate receives immediate feedback on their score for that question.
* **Final Score**: Upon completion, a final, weighted score is displayed along with a performance breakdown.
-----
### Interviewer Flow

![Interviewer flow](assets/interviewer.svg)

The platform provides robust tools for interviewers to create, manage, and analyze interviews.

* **Create a Question Set**:

  * **Manual Entry**: Add questions one by one through a simple form.

  * **CSV Upload**: Bulk-upload questions using a CSV file with the columns: `difficulty,question,keywords,maxScore`.

    ```csv
    difficulty,question,keywords,maxScore
    easy,"What is var, let, and const in JS?","var;let;const;scope;hoisting",10
    medium,"Explain JWT authentication.","jwt;authentication;token;header;payload",10
    hard,"Design a scalable file upload service.","scalable;file upload;cdn;storage;api gateway",15
    ```

  * **Validation**: The system ensures each question set contains at least two questions for each difficulty level (easy, medium, hard).

  * **Code Generation**: A unique **Interview Code** (for candidates) and a **Dashboard Code** (for the interviewer) are generated.

* **Share Interview Code**: The interviewer shares the generated code with candidates.

* **Monitor Dashboard**: Use the Dashboard Code to access the results page.

  * **Candidate Overview**: View a list of all candidates with their Name, Email, Phone, Status (e.g., completed, in-progress), and Final Score.
  * **Detailed Analysis**: Drill down into each candidate's answers, see matched keywords, and view individual question scores.
  * **Aggregate Statistics**: Get insights from stats like total candidates, completion rates, and average scores.

---

## ⚙️ Evaluation Logic

![Evaluation logic](assets/marks.svg)

### Normalization

All answers are normalized before evaluation to ensure fairness:

* Converted to lowercase.
* All punctuation is stripped.
* Extra whitespace is removed.

### Keyword Matching

The system checks for the presence of predefined keywords in the candidate’s normalized answer. Each found keyword is marked as **matched**.

### Scoring

```
baseScore = (matchedKeywords / totalKeywords) * maxScore
```

### Bonus

* +1 bonus point is awarded if the answer exceeds 20 words.
* The total score for a question is capped at `maxScore + 1`.

### Final Weighted Score

The final score is a weighted average reflecting the difficulty of the questions:

* Easy questions have a weight of 1.
* Medium questions have a weight of 2.
* Hard questions have a weight of 3.

```
final_score = Σ(score_i × weight_i) / Σ(weights)
```

#### Example Calculation

* Easy Scores: 6, 7
* Medium Scores: 8, 5
* Hard Scores: 9, 6

Final Score ≈ **7.2**

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
│   │   └── interviewSlice.js # State: candidates, sessions, questionSets
│   └── utils/
│       └── evaluation.js    # Evaluation + scoring logic
```

---

## 🛠️ Installation

Clone the repository:

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

Create a `.env` file in the project's root directory. While the current implementation is frontend-only, these variables are placeholders for a planned future integration with a Supabase backend.

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_ANON_key
```

Run the development server:

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

* **Redux Toolkit**: State is managed centrally in a Redux slice defined in `interviewSlice.js`.
* **State**: Stores all `questionSets`, `candidates`, and `interviewSessions`.
* **Actions**: Includes reducers like `createQuestionSet`, `createCandidate`, `submitAnswer`, and `updateFinalScore`.
* **Persistence**:

  * The entire Redux state is persisted in IndexedDB using `redux-persist` and `localforage`.
  * This allows a candidate to refresh the page and resume an incomplete interview without losing progress.

---

## 📑 Security & Limitations

* **File Format**: Only `.txt` and `.docx` files are allowed for resume uploads.
* **PDF Parsing**: Parsing PDF files reliably on the client-side is complex due to varied layouts and binary structures, often leading to data extraction errors. To ensure consistency, PDF support is currently excluded.
* **File Size**: Maximum upload size is capped at 5 MB.
* **Data Storage**: All data is stored locally in the user's browser. Clearing site data will erase all question sets and candidate results.
* **Access Control**: There is no authentication for the interviewer dashboard; access is granted to anyone with the `dashboardCode`.

---

## 🔮 Future Enhancements

* **Server-Side PDF Parsing**: Implement robust PDF resume parsing on the server.
* **Authentication**: Add proper authentication for interviewers and role-based access control.
* **Reporting**: Allow exporting candidate reports to CSV or PDF.
* **Real-Time Sync**: Enable real-time updates on the dashboard to monitor candidate progress live.
