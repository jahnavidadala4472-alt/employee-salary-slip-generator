const env = require('../config/env');
const https = require('https');

/**
 * Call Google Gemini API using native HTTPS (zero dependency issues)
 */
const callGeminiAPI = async (systemInstruction, userPrompt) => {
  if (!env.AI_API_KEY) {
    return null; // Signals missing API key
  }

  const model = env.AI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.AI_API_KEY}`;

  const payload = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemInstruction}\n\nUser Question/Data:\n${userPrompt}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const candidate = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              resolve(candidate || 'No response generated.');
            } else {
              console.warn('[Gemini API Warning]', parsed.error?.message || data);
              resolve(null); // Fallback to rule-based engine
            }
          } catch (e) {
            console.warn('[Gemini API Parse Error]', e.message);
            resolve(null);
          }
        });
      }
    );

    req.on('error', (err) => {
      console.warn('[Gemini API Network Error]', err.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Intelligent Rule-based Payroll Assistant (Fallback when AI_API_KEY is not configured)
 */
const generateFallbackChatResponse = (prompt, context = {}) => {
  const p = prompt.toLowerCase();
  const { employee, latestSlip, previousSlip } = context;

  const employeeName = employee ? employee.fullName : 'Employee';
  const net = latestSlip ? `$${Number(latestSlip.netSalary).toFixed(2)}` : 'N/A';
  const gross = latestSlip ? `$${Number(latestSlip.grossSalary).toFixed(2)}` : 'N/A';
  const deductions = latestSlip ? `$${Number(latestSlip.totalDeductions).toFixed(2)}` : 'N/A';

  let answer = '';

  if (p.includes('net salary') || p.includes('take home') || p.includes('take-home')) {
    answer = `Hello ${employeeName}, your current Net Salary is **${net}**.\n\nNet Salary is your final take-home pay after all statutory and company deductions (Tax, PF, ESI, etc.) are subtracted from your Gross Salary (${gross}).\n\n**Calculation:**\n- Gross Earnings: ${gross}\n- Total Deductions: -${deductions}\n- **Net Take-Home:** **${net}**`;
  } else if (p.includes('gross salary') || p.includes('total earnings')) {
    answer = `Your Gross Salary is **${gross}**.\n\nGross Salary represents the total earnings before any deductions are made. It includes:\n- Basic Salary: $${latestSlip?.basicSalary || 0}\n- HRA (House Rent Allowance): $${latestSlip?.hra || 0}\n- Special / Other Allowances: $${latestSlip?.allowances || 0}\n- Bonus: $${latestSlip?.bonus || 0}\n- Overtime: $${latestSlip?.overtime || 0}`;
  } else if (p.includes('deduction') || p.includes('deductions') || p.includes('tax') || p.includes('pf') || p.includes('esi')) {
    answer = `Your total deductions for the period are **${deductions}**.\n\nHere is the breakdown of deductions:\n- **Income Tax (TDS):** $${latestSlip?.tax || 0} (Statutory income tax deducted at source)\n- **Provident Fund (PF):** $${latestSlip?.pf || 0} (Retirement savings contribution)\n- **ESI (Employee State Insurance):** $${latestSlip?.esi || 0} (Health & medical social security)\n- **Other Deductions:** $${latestSlip?.otherDeductions || 0}`;
  } else if (p.includes('hra') || p.includes('house rent')) {
    answer = `**House Rent Allowance (HRA)** is a component of your salary provided by your employer towards accommodation expenses. In your salary slip, HRA is currently **$${latestSlip?.hra || 0}**. Depending on local tax laws, a portion of HRA can be claimed as tax-exempt against valid rent receipts.`;
  } else if (p.includes('pf') || p.includes('provident fund')) {
    answer = `**Provident Fund (PF)** is a mandatory retirement savings scheme. Your current PF contribution is **$${latestSlip?.pf || 0}**. This amount is deposited directly into your designated retirement fund and earns interest over time.`;
  } else if (p.includes('esi') || p.includes('insurance')) {
    answer = `**Employee State Insurance (ESI)** is a social security and healthcare scheme. Your current ESI deduction is **$${latestSlip?.esi || 0}**, which provides medical coverage and cash benefits for employees and their dependents.`;
  } else if (p.includes('different') || p.includes('compare') || p.includes('last month') || p.includes('previous')) {
    if (previousSlip && latestSlip) {
      const netDiff = latestSlip.netSalary - previousSlip.netSalary;
      const diffText = netDiff >= 0 ? `an increase of $${netDiff.toFixed(2)}` : `a decrease of $${Math.abs(netDiff).toFixed(2)}`;
      answer = `Comparing your current salary with the previous period:\n- **Previous Net Pay:** $${Number(previousSlip.netSalary).toFixed(2)}\n- **Current Net Pay:** $${Number(latestSlip.netSalary).toFixed(2)} (${diffText})\n\n**Key Changes:**\n- Bonus: $${previousSlip.bonus || 0} -> $${latestSlip.bonus || 0}\n- Overtime: $${previousSlip.overtime || 0} -> $${latestSlip.overtime || 0}\n- Deductions: $${previousSlip.totalDeductions || 0} -> $${latestSlip.totalDeductions || 0}`;
    } else {
      answer = `You only have one recorded salary slip in the system so far. Once you have multiple monthly slips, I will automatically provide a detailed month-over-month comparative analysis for you!`;
    }
  } else if (p.includes('summarize') || p.includes('summary') || p.includes('overview')) {
    answer = `**Salary Slip Summary for ${employeeName}**\n- **Period:** Month ${latestSlip?.month}/${latestSlip?.year}\n- **Gross Pay:** ${gross}\n- **Total Deductions:** ${deductions}\n- **Final Net Payable:** **${net}**\n- **Status:** ${latestSlip?.status?.toUpperCase() || 'APPROVED'}\n\nYour salary slip is ready for download or printing.`;
  } else {
    answer = `I am your **AI Payroll Assistant**. You can ask me anything about your salary slip components (Basic, HRA, Allowances, Overtime, Bonus), tax and retirement deductions (PF, ESI, TDS), or compare your earnings across months.`;
  }

  // Prepend config advisory if API key is not present
  if (!env.AI_API_KEY) {
    return `${answer}\n\n*(Note: AI Assistant is running in local rule-based mode. To enable dynamic generative Gemini AI responses, add \`AI_API_KEY\` in your \`.env\` file.)*`;
  }

  return answer;
};

/**
 * Handle AI Chat
 */
const getAIChatResponse = async (userPrompt, context = {}) => {
  const { employee, latestSlip, previousSlip } = context;

  const systemInstruction = `You are a helpful, professional, and friendly AI Payroll & HR Assistant for an enterprise company.
Rules:
1. Only discuss payroll, salary slips, deductions, tax, HRA, PF, ESI, overtime, and financial compensation topics.
2. Base all specific numbers strictly on the provided context. If data is unavailable, state it clearly. Never invent numbers.
3. Keep responses structured, concise, and easy for non-financial employees to understand.
Context:
- Employee: ${employee ? JSON.stringify({ name: employee.fullName, id: employee.employeeId, dept: employee.department, desig: employee.designation }) : 'Not provided'}
- Latest Salary Slip: ${latestSlip ? JSON.stringify(latestSlip) : 'None'}
- Previous Salary Slip: ${previousSlip ? JSON.stringify(previousSlip) : 'None'}`;

  // Attempt live Gemini API call
  const geminiResponse = await callGeminiAPI(systemInstruction, userPrompt);
  if (geminiResponse) {
    return geminiResponse;
  }

  // Fallback to intelligent rule engine
  return generateFallbackChatResponse(userPrompt, context);
};

/**
 * Generate AI Summary for a specific Salary Slip
 */
const generateSalarySlipSummary = async (slip, employee, previousSlip = null) => {
  const prompt = `Please provide a simple, clean, 3-point summary of this employee's salary slip.
Employee: ${employee.fullName} (${employee.employeeId}, ${employee.designation})
Current Slip: Month ${slip.month}/${slip.year}, Gross: $${slip.grossSalary}, Total Deductions: $${slip.totalDeductions}, Net Pay: $${slip.netSalary}.
Breakdown: Basic=$${slip.basicSalary}, HRA=$${slip.hra}, Allowances=$${slip.allowances}, Bonus=$${slip.bonus}, Overtime=$${slip.overtime}, Tax=$${slip.tax}, PF=$${slip.pf}, ESI=$${slip.esi}, Other Deductions=$${slip.otherDeductions}.
${previousSlip ? `Previous Month Slip: Gross=$${previousSlip.grossSalary}, Net=$${previousSlip.netSalary}, Bonus=$${previousSlip.bonus}.` : 'First recorded slip.'}`;

  const systemInstruction = 'You are an HR Payroll Assistant. Provide a brief, bulleted summary explaining the take-home pay, main deductions, and notable earnings for this salary slip in plain English.';

  const geminiResponse = await callGeminiAPI(systemInstruction, prompt);
  if (geminiResponse) {
    return geminiResponse;
  }

  // Rule-based summary fallback
  let summary = `**Salary Summary for ${employee.fullName} (${slip.month}/${slip.year})**\n\n`;
  summary += `1. **Net Take-Home Pay:** $${Number(slip.netSalary).toFixed(2)} (Calculated from Gross Earnings of $${Number(slip.grossSalary).toFixed(2)} minus Total Deductions of $${Number(slip.totalDeductions).toFixed(2)}).\n`;
  summary += `2. **Key Earnings:** Base pay is $${Number(slip.basicSalary).toFixed(2)} with $${Number(slip.hra || 0).toFixed(2)} HRA. ${slip.bonus > 0 ? `Includes a performance bonus of $${slip.bonus.toFixed(2)}. ` : ''}${slip.overtime > 0 ? `Includes $${slip.overtime.toFixed(2)} in overtime pay.` : ''}\n`;
  summary += `3. **Key Deductions:** Statutory deductions include $${Number(slip.tax || 0).toFixed(2)} TDS Tax, $${Number(slip.pf || 0).toFixed(2)} PF retirement contribution, and $${Number(slip.esi || 0).toFixed(2)} ESI insurance.\n`;

  if (previousSlip) {
    const diff = slip.netSalary - previousSlip.netSalary;
    summary += `\n**Month-over-Month:** Net pay is ${diff >= 0 ? 'up' : 'down'} by $${Math.abs(diff).toFixed(2)} compared to last month.`;
  }

  return summary;
};

module.exports = {
  getAIChatResponse,
  generateSalarySlipSummary
};
