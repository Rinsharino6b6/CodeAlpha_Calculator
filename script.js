// DOM Elements
const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const historyList = document.getElementById('history-list');
const voiceBtn = document.getElementById('voice-btn');
const themeBtn = document.getElementById('theme-btn');
const clearHistoryBtn = document.getElementById('clear-history');

// State
let currentExpression = '';
let lastResult = '';
let memory = 0;
let isDarkTheme = true;
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

// Initialize
function init() {
    renderHistory();
    loadTheme();
}

// --- Calculation Logic ---

function appendToExpression(value) {
    currentExpression += value;
    updateDisplay();
}

function updateDisplay() {
    expressionDisplay.textContent = currentExpression;
    // Real-time preview if expression is valid
    if (currentExpression) {
        try {
            const preview = math.evaluate(currentExpression.replace('×', '*').replace('÷', '/'));
            if (preview !== undefined && typeof preview !== 'function') {
                resultDisplay.value = preview;
            }
        } catch (e) {
            // Silently fail for preview
        }
    } else {
        resultDisplay.value = '0';
    }
}

function calculate() {
    if (!currentExpression) return;
    
    try {
        // Prepare expression for math.js
        let sanitizedExp = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        const result = math.evaluate(sanitizedExp);
        
        if (result !== undefined) {
            addToHistory(currentExpression, result);
            currentExpression = result.toString();
            lastResult = result;
            updateDisplay();
            resultDisplay.value = result;
        }
    } catch (e) {
        resultDisplay.value = 'Error';
        setTimeout(() => updateDisplay(), 1500);
    }
}

function clearAll() {
    currentExpression = '';
    updateDisplay();
}

function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

// --- Memory Functions ---

function handleMemory(op) {
    const currentVal = parseFloat(resultDisplay.value) || 0;
    switch(op) {
        case 'MC': memory = 0; break;
        case 'MR': currentExpression += memory.toString(); updateDisplay(); break;
        case 'M+': memory += currentVal; break;
        case 'M-': memory -= currentVal; break;
    }
}

// --- History Functions ---

function addToHistory(exp, res) {
    history.unshift({ exp, res });
    if (history.length > 20) history.pop();
    localStorage.setItem('calcHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="useHistory(${index})">
            <div class="history-exp">${item.exp}</div>
            <div class="history-res">= ${item.res}</div>
        </div>
    `).join('');
}

function useHistory(index) {
    currentExpression = history[index].exp;
    updateDisplay();
}

clearHistoryBtn.onclick = () => {
    history = [];
    localStorage.removeItem('calcHistory');
    renderHistory();
};

// --- Voice Input (Web Speech API) ---

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        voiceBtn.classList.add('listening');
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice Input:', transcript);
        
        // Basic mapping for voice commands
        let processed = transcript
            .replace(/plus/g, '+')
            .replace(/minus/g, '-')
            .replace(/times/g, '*')
            .replace(/multiplied by/g, '*')
            .replace(/divided by/g, '/')
            .replace(/over/g, '/')
            .replace(/squared/g, '^2')
            .replace(/to the power of/g, '^')
            .replace(/square root of/g, 'sqrt(')
            .replace(/sine/g, 'sin(')
            .replace(/cosine/g, 'cos(')
            .replace(/tangent/g, 'tan(');
        
        currentExpression += processed;
        updateDisplay();
    };

    voiceBtn.onclick = () => {
        recognition.start();
    };
} else {
    voiceBtn.style.display = 'none';
}

// --- Theme Toggle ---

themeBtn.onclick = () => {
    isDarkTheme = !isDarkTheme;
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeBtn.innerHTML = isDarkTheme ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
    lucide.createIcons();
    localStorage.setItem('calcTheme', isDarkTheme ? 'dark' : 'light');
};

function loadTheme() {
    const savedTheme = localStorage.getItem('calcTheme') || 'dark';
    isDarkTheme = savedTheme === 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeBtn.innerHTML = isDarkTheme ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
    lucide.createIcons();
}

// --- Event Listeners ---

document.querySelectorAll('button[data-num]').forEach(btn => {
    btn.onclick = () => appendToExpression(btn.dataset.num);
});

document.querySelectorAll('button[data-op]').forEach(btn => {
    btn.onclick = () => {
        const op = btn.dataset.op;
        if (op === 'equal') calculate();
        else if (op === 'clear') clearAll();
        else if (op === 'backspace') backspace();
        else if (['MC', 'MR', 'M+', 'M-'].includes(op)) handleMemory(op);
        else appendToExpression(op);
    };
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if (/[0-9.]/.test(e.key)) appendToExpression(e.key);
    if (['+', '-', '*', '/'].includes(e.key)) appendToExpression(e.key);
    if (e.key === 'Enter') calculate();
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape') clearAll();
});

init();
