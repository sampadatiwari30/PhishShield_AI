# 🛡️ PhishShield AI

**AI Email Risk Analyzer**

PhishShield AI is an AI-powered email risk analysis platform that helps users identify phishing emails before they become victims of cyberattacks. The application analyzes the sender's email address, email content, and embedded URLs to determine whether an email is **Safe**, **Suspicious**, or **High Risk**.

Instead of providing only a simple classification, the platform generates a **Risk Score (0–100)** along with an AI-generated explanation describing why the email was flagged. This helps users understand potential threats and make informed decisions before clicking links or sharing sensitive information.

---

## 📌 Problem Statement

Phishing attacks are one of the leading causes of data breaches and financial fraud. Attackers often impersonate trusted organizations such as banks, e-commerce websites, or popular services to trick users into revealing passwords, OTPs, or personal information.

Many users find it difficult to distinguish between legitimate and malicious emails because modern phishing emails closely resemble genuine communications.

**PhishShield AI** addresses this challenge by using Artificial Intelligence and cybersecurity techniques to analyze email content and provide clear, explainable phishing detection.

---

## ✨ Features

* 📧 Analyze sender email address and email content.
* 🔗 Automatically extract and analyze URLs.
* 🤖 AI-powered phishing detection.
* 📊 Generate a Risk Score (0–100).
* 🛡️ Classify emails as **Safe**, **Suspicious**, or **High Risk**.
* 📝 AI-generated explanation for every result.
* 📚 Store previous scan history.
* 💻 Clean and responsive user interface.

---

## ⚙️ How It Works

1. Enter the sender's email address.
2. Paste the email content.
3. Submit the email for analysis.
4. The backend extracts URLs and processes the email.
5. AI analyzes phishing indicators such as:

   * Suspicious sender
   * Social engineering language
   * Credential requests
   * Urgent or threatening messages
   * Suspicious links
6. The application generates:

   * Risk Score
   * Email Classification
   * AI Explanation
   * Security Recommendation
7. The scan is saved for future reference.

---

## 📊 Risk Score Classification

| Risk Score   | Status        |
| ------------ | ------------- |
| **0 – 30**   | ✅ Safe        |
| **31 – 70**  | ⚠️ Suspicious |
| **71 – 100** | 🚨 High Risk  |

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios

### Backend

* FastAPI
* Python

### Database

* PostgreSQL
* SQLAlchemy

### AI

* OpenAI GPT API

### Tools

* Docker
* Git
* GitHub
* Postman

---

## 📂 Project Structure

```text
PhishShield-AI/
│
├── frontend/
├── backend/
├── database/
├── docker/
├── README.md
└── requirements.txt
```

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/PhishShield-AI.git
cd PhishShield-AI
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database

Configure PostgreSQL and update the database connection settings before running the application.

---

## 💡 Future Enhancements

* Gmail Integration
* Attachment Analysis
* JWT Authentication
* VirusTotal Integration
* PDF Report Export
* Dashboard Analytics
* Browser Extension
* Multi-language Email Analysis

---

## 📖 Learning Outcomes

Through this project, I gained hands-on experience with:

* Full-Stack Web Development
* REST API Development
* AI Integration
* Prompt Engineering
* Email Security Concepts
* PostgreSQL Database Design
* Docker-based Application Deployment

---

## 👨‍💻 Author

Sampada Tiwari

If you found this project useful, consider giving it a ⭐ on GitHub!

