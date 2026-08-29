# PayPulse AI — Employee Salary Slip Generator & AI Payroll Assistant

🚀 **Live Demo:** [https://employee-salary-slip-generator.onrender.com](https://employee-salary-slip-generator.onrender.com)

> ⚡ Hosted on Render Free Tier — may take ~30 seconds to wake up on first visit

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



