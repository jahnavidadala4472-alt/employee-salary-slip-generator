/**
 * AI Payroll Assistant Script - Chat Interface & Suggested Questions
 */

document.addEventListener('DOMContentLoaded', async () => {
  const isAiPage = window.location.pathname.includes('ai-assistant.html');
  if (!isAiPage) return;

  const user = initAuthGuard();
  if (!user) return;

  initAiAssistant(user);
});

/**
 * Initialize AI Assistant Chat UI
 */
const initAiAssistant = async (user) => {
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const clearBtn = document.getElementById('clear-chat-btn');
  const employeeSelect = document.getElementById('ai-emp-select');
  const statusBadge = document.getElementById('ai-status-indicator');

  // If Admin, populate employee selector so admin can switch context
  if (user.role === 'admin' && employeeSelect) {
    employeeSelect.style.display = 'inline-block';
    try {
      const empData = await apiRequest('/employees');
      if (empData.data) {
        employeeSelect.innerHTML = '<option value="">-- All / General Context --</option>' +
          empData.data.map(e => `<option value="${e.employeeId}">Context: ${e.fullName} (${e.employeeId})</option>`).join('');
      }
    } catch (e) {}
  } else if (employeeSelect) {
    employeeSelect.style.display = 'none';
  }

  // Initial Welcome Message
  const addMessage = (text, sender = 'assistant') => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;

    if (sender === 'assistant') {
      bubble.innerHTML = formatMarkdownToHtml(text);
    } else {
      bubble.textContent = text;
    }

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const showTypingIndicator = () => {
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.className = 'chat-bubble-typing';
    typing.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const removeTypingIndicator = () => {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  };

  // Welcome Bubble
  const welcomeText = user.role === 'admin'
    ? `👋 Hello **${user.fullName || 'Administrator'}**! I am your **AI Payroll Assistant**.\n\nYou can ask me about company-wide payroll statistics, deduction formulas, statutory compliance (HRA, PF, ESI, Tax), or select an employee to analyze their salary slips and anomaly alerts.`
    : `👋 Hello **${user.fullName || 'Employee'}**! I am your personal **AI Payroll Assistant**.\n\nI have secure access to your salary slips. You can ask me to **explain your net pay**, **break down deductions**, or **compare earnings with previous months**.`;

  addMessage(welcomeText, 'assistant');

  // Submit Prompt Handler
  const handleSendPrompt = async (promptText) => {
    const prompt = promptText || chatInput.value.trim();
    if (!prompt) return;

    // Display user message
    addMessage(prompt, 'user');
    if (!promptText) chatInput.value = '';

    showTypingIndicator();

    try {
      const payload = {
        prompt,
        employeeId: employeeSelect ? employeeSelect.value : undefined
      };

      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      removeTypingIndicator();
      addMessage(res.response, 'assistant');

      if (statusBadge) {
        statusBadge.textContent = res.isConfigured ? 'Gemini AI Active' : 'Local Knowledge Engine';
        statusBadge.className = `badge ${res.isConfigured ? 'badge-success' : 'badge-primary'}`;
      }
    } catch (err) {
      removeTypingIndicator();
      addMessage(`⚠️ **Error:** ${err.message || 'Unable to fetch AI response at this moment.'}`, 'assistant');
    }
  };

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSendPrompt();
  });

  // Suggested Prompt Pills
  const promptChips = document.querySelectorAll('.prompt-chip');
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt') || chip.textContent.trim();
      handleSendPrompt(prompt);
    });
  });

  // Clear Chat History
  clearBtn?.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    addMessage(welcomeText, 'assistant');
    showToast('Conversation cleared.', 'info');
  });
};
