# PayPulse AI — Employee Salary Slip Generator & AI Payroll Assistant

A full-stack, enterprise-grade payroll and salary management web application built using **Node.js, Express, MongoDB (Mongoose), Vanilla JavaScript (ES6), Modern CSS3, PDFKit, and Google Gemini AI**.

> 🚫 **Zero XAMPP | Zero PHP | Zero MySQL** — 100% Modern JavaScript & Node.js Architecture.

---

## 🌟 Features Overview

### 👑 Administrator Capabilities
* **Secure Role-Based Authentication:** JWT with bcrypt password hashing and token cookies.
* **Company & Branding Profile:** Customize company name, legal tax EIN/PAN, contact info, and upload brand logos with traversal protection.
* **Employee Management:** Directory with search, department & status filters, Add/Edit forms, and activation toggles.
* **Monthly Salary Entry & Live Calculation:** Input basic pay, allowances (HRA, Bonus, Overtime), and statutory deductions (Tax, PF, ESI) with instant reactive gross/net previews.
* **Authoritative Server Recalculation:** All arithmetic formulas are authoritatively computed on the Node.js backend to prevent client tampering.
* **AI Anomaly Warnings:** Automated heuristic and AI-powered detection of sudden salary spikes/drops (>30%), abnormal bonuses (>50% of basic pay), and overtime irregularities.
* **Vector A4 PDF Payslips:** High-resolution PDF generation with digital signature blocks using `pdfkit`.
* **Disbursement History:** Filterable history with aggregate metrics (Gross, Deductions, Net Payouts).

### 👤 Employee Capabilities
* **Dedicated Employee Portal:** View active position, department, and latest compensation breakdown.
* **Strict Data Ownership:** Server-enforced security prevents employees from tampering with URLs to access other employees' records.
* **Print & PDF Download:** Instant 1-click A4 print and vector PDF download of official salary statements.
* **AI Salary Assistant:** Natural language chatbot trained on payroll concepts (Gross vs Net, HRA, Provident Fund, ESI, Tax rules, and month-over-month comparisons).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 (Modern Light Theme, Glassmorphism, Responsive CSS Grid), Vanilla JavaScript (ES6+), Fetch API |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs, HTTP-Only Cookie Support |
| **PDF Engine** | PDFKit (Direct Stream to Browser) |
| **AI Intelligence** | Google Gemini API (Backend REST Integration) with Built-in Fallback Knowledge Engine |
| **File Handling** | Multer (Safe image upload with MIME & size validation) |

---

## 📂 Project Structure

```text
employee-salary-generator/
├── client/
│   ├── index.html                # Modern Landing Page
│   ├── login.html                # Sign In Page with 1-Click Demo Switcher
│   ├── register.html             # Employee Account Registration
│   ├── admin-dashboard.html      # Executive KPI Dashboard & Anomaly Alerts
│   ├── employee-dashboard.html   # Employee Self-Service Dashboard
│   ├── company.html              # Company Profile & Logo Upload
│   ├── employees.html            # Employee Directory & Filtering
│   ├── employee-form.html        # Add / Edit Employee Form
│   ├── salary-entry.html         # Monthly Salary Computation & Live Preview
│   ├── salary-slip.html          # Printable A4 Payslip & PDF Generator
│   ├── salary-history.html       # Searchable Salary Disbursement Log
│   ├── ai-assistant.html         # AI Payroll Chatbot UI
│   ├── settings.html             # Profile & System Diagnostics
│   │
│   └── assets/
│       ├── css/
│       │   └── style.css         # Master CSS Design System
│       └── js/
│           ├── app.js            # Shared API Client, Auth Guard, Toasts
│           ├── auth.js           # Login, Register & Demo Fillers
│           ├── dashboard.js      # Admin & Employee Dashboard Logic
│           ├── employees.js      # Employee Table & Form Handlers
│           ├── salary.js         # Reactive Calculations & History
│           ├── salary-slip.js    # Payslip Rendering & PDF Fetch
│           └── ai.js             # AI Chat Assistant & Quick Pills
│
├── server/
│   ├── app.js                    # Express Application Configuration
│   ├── server.js                 # Server Entry Point
│   │
│   ├── config/
│   │   ├── db.js                 # MongoDB Connection Module
│   │   └── env.js                # Centralized Environment Variables
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT Verification Middleware
│   │   ├── role.js               # Role-Based Access Control ('admin'/'employee')
│   │   ├── validate.js           # Request Payload Validation
│   │   └── errorHandler.js       # Production-Safe Centralized Error Handler
│   │
│   ├── models/
│   │   ├── User.js               # User Auth & Role Model
│   │   ├── Employee.js           # Employee Profile Model
│   │   ├── Company.js            # Company Information Model
│   │   ├── SalarySlip.js         # Salary Slip Financial Model
│   │   ├── AILog.js              # AI Prompt/Response Log
│   │   └── AIAnomaly.js          # Flagged Anomaly Alerts Model
│   │
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Logout, Profile
│   │   ├── employeeController.js # Employee CRUD with Ownership Checks
│   │   ├── companyController.js  # Company Details & Logo Upload
│   │   ├── salaryController.js   # Calculation, PDF Stream, History
│   │   └── aiController.js       # AI Chat, Summaries & Anomaly Review
│   │
│   ├── services/
│   │   ├── salaryService.js      # Authoritative Formulas & Number-to-Words
│   │   ├── pdfService.js         # PDFKit Document Layout & Builder
│   │   ├── aiService.js          # Gemini API Client & Local Fallback Engine
│   │   └── anomalyService.js     # Rule & Variance Anomaly Scanner
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── employeeRoutes.js     # /api/employees
│   │   ├── companyRoutes.js      # /api/company
│   │   ├── salaryRoutes.js       # /api/salary & /api/salary-slips
│   │   └── aiRoutes.js           # /api/ai
│   │
│   ├── utils/
│   │   ├── generateSlipNumber.js # Sequential Slip ID Generator
│   │   └── validation.js         # Regex & Numeric Sanity Checkers
│   │
│   └── seed.js                   # Demo Seeder with Admin, Employees & Anomalies
│
├── uploads/                      # Uploaded Logo Assets
├── .env.example                  # Environment Configuration Template
├── .env                          # Local Environment Configuration
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

* **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **MongoDB**: Local MongoDB Server ([Download Community Server](https://www.mongodb.com/try/download/community)) **OR** a free [MongoDB Atlas](https://www.mongodb.com/atlas) Cloud Cluster.

---

## 🚀 Step-by-Step Setup Guide

### 1. Install Dependencies
In your terminal, navigate to the project directory and run:

```bash
npm install
```

---

### 2. Configure Environment Variables (`.env`)

Open the `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/payroll_db
JWT_SECRET=super_secret_jwt_key_salary_slip_generator_2026
AI_API_KEY=your_google_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
CLIENT_URL=http://localhost:5000
NODE_ENV=development
```

#### 📍 Where to add your Keys:
1. **MongoDB Connection (`MONGODB_URI`):**
   * **Local MongoDB:** `mongodb://127.0.0.1:27017/payroll_db`
   * **MongoDB Atlas Cloud:** `mongodb+srv://<username>:<password>@cluster0.mongodb.net/payroll_db?retryWrites=true&w=majority`
2. **Google Gemini AI API Key (`AI_API_KEY`):**
   * Get a free Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
   * Paste it into `AI_API_KEY=`.
   * *(Note: If left empty, the application automatically uses the built-in payroll rule engine without crashing).*

---

### 3. Populate Demo Data (Seeder)

Run the seeder script to populate an Admin account, demo Employees, Company profile, and sample historical salary slips (including an anomalous slip to test AI alerts):

```bash
npm run seed
```

---

### 4. Start the Application

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:5000`**

---

## 🔑 Demo Account Credentials

You can use the **1-Click Demo Buttons** on `login.html` or enter:

| Role | Email | Password | Notes |
|---|---|---|---|
| **Administrator** | `admin@payroll.com` | `Admin@12345` | Full access to employee CRUD, salary entry, company profile & anomaly alerts |
| **Employee 1** | `john.doe@company.com` | `Employee@12345` | Senior Engineer (EMP001) with anomalous slip in August 2026 |
| **Employee 2** | `sarah.jenkins@company.com` | `Employee@12345` | Product Designer (EMP002) with standard salary slips |
| **Employee 3** | `michael.chang@company.com` | `Employee@12345` | Financial Analyst (EMP003) |

---

## 🧮 Salary Calculation Formulas

### 1. Gross Salary
$$\text{Gross Salary} = \text{Basic Salary} + \text{HRA} + \text{Allowances} + \text{Bonus} + \text{Overtime}$$

### 2. Total Deductions
$$\text{Total Deductions} = \text{Income Tax (TDS)} + \text{Provident Fund (PF)} + \text{ESI} + \text{Other Deductions}$$

### 3. Net Salary
$$\text{Net Salary} = \text{Gross Salary} - \text{Total Deductions}$$

* All inputs are validated for non-negative values.
* Live reactive calculation runs in JavaScript for responsive UX.
* **Authoritative recalculation** is executed on the server upon slip creation.

---

## 🤖 AI Salary Assistant & Anomaly Detection

### AI Chat Assistant (`/api/ai/chat`)
* Provides interactive natural language explanations for take-home pay, HRA exemptions, PF contributions, ESI benefits, and tax rules.
* Contextually inspects the employee's current and previous salary slips.

### AI Anomaly Scanner (`/api/ai/anomaly`)
Automatically inspects newly created salary slips against historical trends:
* **High Bonus Warning:** Bonus $\ge 50\%$ of basic salary.
* **High Overtime Warning:** Overtime $\ge 40\%$ of basic salary.
* **Month-over-Month Shift:** $\ge 30\%$ spike or drop in net take-home pay.
* **Deduction Alert:** Total deductions exceeding $50\%$ of gross pay.
* Returns `severity` (`low`, `medium`, `high`), `reason`, and actionable `recommendation`.

---

## 📄 PDF Generation

Salary slips are rendered in **A4 vector format** using `PDFKit`:
* High-resolution typography and table borders
* Side-by-side Earnings and Deductions breakdown
* Currency formatted amounts and net amount in words
* Digital signature boxes for Employer and Employee
* Streamed directly via `/api/salary-slips/:id/pdf`

---

## 🔒 Security Implementations

* **No Frontend API Secrets:** AI keys and database strings are never sent to the browser.
* **Server-Side Ownership Validation:** An employee cannot read another employee's salary slip by changing `:id` in URL parameters.
* **Password Hashing:** Passwords hashed with `bcryptjs` (salt rounds = 10).
* **Safe File Uploads:** Multer with MIME verification, 2MB size cap, and sanitized file naming preventing directory traversal.
* **Sanitized Error Responses:** Stack traces and internal database errors are suppressed in production mode.

---

## 🌐 Deployment Instructions

### Deploy to Render / Railway (Full Stack)
1. Push repository to GitHub.
2. In Render / Railway, create a new **Web Service**.
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `npm start`
5. Add Environment Variables from `.env` (including `MONGODB_URI` and `JWT_SECRET`).

---

## 💡 Troubleshooting

* **MongoDB Connection Failed:** Verify that local MongoDB service is running (`mongod` / MongoDB Service in Windows Services) or check your MongoDB Atlas connection string and IP whitelist (allow `0.0.0.0/0`).
* **Port 5000 in use:** Update `PORT=5050` in `.env`.
* **AI Responses in Local Mode:** Ensure your `AI_API_KEY` is added in `.env` and restart the server.

---

© 2026 PayPulse AI — Enterprise Payroll & Salary Slip Generation Suite.
