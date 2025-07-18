/**
 * Core word list for text generation
 * Common English words sorted by frequency of usage
 */
const commonWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", 
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", 
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", 
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", 
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", 
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", 
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", 
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
    // Add more common words below
    "man", "find", "here", "thing", "give", "many", "well", "life", "child", "world",
    "school", "state", "family", "student", "group", "country", "problem", "hand",
    "part", "place", "case", "week", "company", "system", "program", "question",
    "work", "government", "number", "night", "point", "home", "water", "room",
    "mother", "area", "money", "story", "fact", "month", "lot", "right", "study",
    "book", "eye", "job", "word", "business", "issue", "side", "kind", "head",
    "house", "service", "friend", "father", "power", "hour", "game", "line",
    "end", "member", "law", "car", "city", "community", "name", "president",
    "team", "minute", "idea", "kid", "body", "information", "back", "parent",
    "face", "others", "level", "office", "door", "health", "person", "art",
    "war", "history", "party", "result", "change", "morning", "reason", "research",
    "girl", "guy", "moment", "air", "teacher", "force", "education"
];

/**
 * DOM Element References
 */
const textDisplay = document.querySelector('.text-display');
const textInput = document.querySelector('.text-input');
const counter = document.querySelector('.counter');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const charactersDisplay = document.getElementById('characters');
const restartBtn = document.querySelector('.restart-btn');
const bottomRestartBtn = document.querySelector('.bottom-restart-btn');
const timeOptions = document.querySelector('.time-options');
const modeOptions = document.querySelector('.mode-options');
const testArea = document.querySelector('.test-area');
const focusMessage = document.querySelector('.focus-message');
const caret = document.querySelector('.caret');

/**
 * State Management Variables
 */
let timer;
let timeLeft;
let testActive = false;
let charIndex = 0;
let mistakes = 0;
let wpm = 0;
let selectedTime = 15;
let selectedMode = 'easy';
let testText = [];
let typedEntries = 0;

/**
 * Theme Management
 */
const themeSwitch = document.getElementById('theme-switch');
const htmlElement = document.documentElement;

// Load saved theme preference
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
themeSwitch.checked = savedTheme === 'light';

// Theme toggle handler
themeSwitch.addEventListener('change', () => {
    const newTheme = themeSwitch.checked ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

/**
 * Score History Management
 */
const historyList = document.querySelector('.history-list');
const MAX_HISTORY_ITEMS = 5;

function saveScore(wpm, accuracy, characters) {
    const scores = JSON.parse(localStorage.getItem('typing_scores') || '[]');
    const newScore = {
        wpm,
        accuracy,
        characters,
        date: new Date().toISOString()
    };
    
    scores.unshift(newScore);
    if (scores.length > MAX_HISTORY_ITEMS) {
        scores.pop();
    }
    
    localStorage.setItem('typing_scores', JSON.stringify(scores));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const scores = JSON.parse(localStorage.getItem('typing_scores') || '[]');
    historyList.innerHTML = scores.map(score => `
        <div class="history-item">
            <span>${score.wpm} WPM</span>
            <span>${score.accuracy}% Accuracy</span>
            <span>${new Date(score.date).toLocaleDateString()}</span>
        </div>
    `).join('');
}

/**
 * Progress Bar Management
 */
const progressBar = document.querySelector('.progress-bar');

function updateProgressBar() {
    const progress = ((selectedTime - timeLeft) / selectedTime) * 100;
    progressBar.style.width = `${progress}%`;
}

/**
 * Initializes the typing test environment
 * Resets all metrics and generates new test content
 */
function initTest() {
    clearInterval(timer);
    testActive = false;
    charIndex = 0;
    mistakes = 0;
    typedEntries = 0;
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    charactersDisplay.textContent = '0/0';
    timeLeft = selectedTime;
    counter.textContent = timeLeft;
    generateRandomText();
    displayText();
    restartBtn.style.display = 'none';
    focusMessage.style.display = 'block';
    textInput.value = '';
    progressBar.style.width = '0%';
    updateHistoryDisplay();
}

/**
 * Generates random text for the typing test
 * Creates an array of 100 randomly selected common words
 */
function generateRandomText() {
    const wordCount = Math.floor(Math.random() * 11) + 60; // 60-70 words
    
    // Advanced word list for fallback
    const advancedWords = [
        "cryptocurrency", "pharmaceutical", "infrastructure", "sophisticated", 
        "determination", "revolutionary", "environmental", "classification",
        "international", "collaboration", "Mediterranean", "technological",
        "professional", "organization", "understanding", "development",
        "opportunity", "competition", "independent", "experience"
    ];

    if (selectedMode === 'advanced') {
        fetch('https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=1000&minLength=5&maxLength=15&limit=' + wordCount + 'yxq6egny203wqdguexvhs2qw13gyr32cva3xgf7bynvwky2u9')
            .then(response => {
                if (!response.ok) throw new Error('API failed');
                return response.json();
            })
            .then(words => {
                testText = words.map(word => word.word);
                displayText();
            })
            .catch(() => {
                // Fallback for advanced mode
                testText = [];
                for (let i = 0; i < wordCount; i++) {
                    testText.push(advancedWords[Math.floor(Math.random() * advancedWords.length)]);
                }
                displayText();
            });
        return;
    }

    // Easy mode - using common words
    testText = [];
    for (let i = 0; i < wordCount; i++) {
        testText.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
    }
    displayText();
}

/**
 * Renders the test text to the display area
 * Creates character spans for individual tracking
 */
function displayText() {
    textDisplay.innerHTML = '';
    testText.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        
        Array.from(word).forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.className = 'char';
            wordSpan.appendChild(charSpan);
        });
        
        // Add space after word except for last word
        if (wordIndex < testText.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            spaceSpan.className = 'char space';
            wordSpan.appendChild(spaceSpan);
        }
        
        textDisplay.appendChild(wordSpan);
    });

    // Highlight first character
    const firstChar = textDisplay.querySelector('.char');
    if (firstChar) {
        firstChar.classList.add('active');
        updateCaret();
    }
}

/**
 * Initiates the typing test timer and tracking
 */
function startTest() {
    if (!testActive) {
        testActive = true;
        focusMessage.style.display = 'none';
        caret.style.display = 'block';
        
        timer = setInterval(() => {
            timeLeft--;
            counter.textContent = timeLeft;
            
            // Update progress bar
            updateProgressBar();
            
            // Calculate WPM in real-time
            calculateWPM();
            
            if (timeLeft === 0) {
                endTest();
            }
        }, 1000);
    }
}

/**
 * Concludes the typing test and displays results
 * Calculates final statistics and shows performance message
 */
function endTest() {
    clearInterval(timer);
    testActive = false;
    textInput.blur();
    
    // Show restart button
    restartBtn.style.display = 'block';
    
    // Hide caret
    caret.style.display = 'none';
    
    // Calculate final statistics
    calculateWPM();
    
    // Add message display
    const message = getScoreMessage(wpm);
    const messageElement = document.createElement('div');
    messageElement.className = 'score-message';
    messageElement.textContent = message;
    textDisplay.innerHTML = '';
    textDisplay.appendChild(messageElement);

    // Save score to history
    const accuracy = typedEntries > 0 ? Math.round(((typedEntries - mistakes) / typedEntries) * 100) : 100;
    saveScore(wpm, accuracy, `${typedEntries - mistakes}/${typedEntries}`);
}

/**
 * Calculates typing metrics (WPM, accuracy, character count)
 * Uses standard WPM calculation: (characters typed / 5) / minutes
 */
function calculateWPM() {
    // Standard calculation: (characters typed / 5) / time in minutes
    const timeElapsed = (selectedTime - timeLeft) / 60; // Convert to minutes
    const adjustedChars = typedEntries - mistakes;
    
    if (timeElapsed > 0) {
        // Characters / 5 is the standard "word" length
        wpm = Math.round((adjustedChars / 5) / timeElapsed);
        updateStats(wpm, 'wpm');
        
        // Calculate accuracy
        const accuracy = typedEntries > 0 ? Math.round(((typedEntries - mistakes) / typedEntries) * 100) : 100;
        updateStats(`${accuracy}%`, 'accuracy');
        
        // Update characters display
        updateStats(`${adjustedChars}/${typedEntries}`, 'characters');
    }
}

/**
 * Updates the caret position to match the current character
 * Handles visual tracking of typing position
 */
function updateCaret() {
    const activeChar = textDisplay.querySelector('.active');
    if (activeChar) {
        const rect = activeChar.getBoundingClientRect();
        const testRect = textDisplay.getBoundingClientRect();
        
        caret.style.left = `${rect.left - testRect.left}px`;
        caret.style.top = `${rect.top - testRect.top}px`;
    }
}

/**
 * Generates performance feedback message based on WPM score
 * @param {number} wpm - Words per minute score
 * @returns {string} Motivational message with emoji
 */
function getScoreMessage(wpm) {
    if (wpm === 0) return "Hey, at least you tried! 🐌";
    if (wpm < 20) return "Slow and steady wins the race! 🐢";
    if (wpm < 30) return "Getting warmed up! ☕";
    if (wpm < 40) return "Not bad, you're getting there! 🌱";
    if (wpm < 50) return "Pretty good! You type faster than a sleepy cat! 😺";
    if (wpm < 60) return "Now we're talking! You're cooking! 🔥";
    if (wpm < 70) return "Impressive! Your fingers are dancing! 💃";
    if (wpm < 80) return "Fantastic! You're faster than a caffeinated squirrel! 🐿️";
    if (wpm < 90) return "Amazing! Your keyboard is smoking! 🚀";
    if (wpm < 100) return "Incredible! Are you even human?! 🤖";
    return "IMPOSSIBLE! You must be a typing wizard! 🧙‍♂️✨";
}

/**
 * Event Listeners
 */
textInput.addEventListener('input', e => {
    const inputValue = e.target.value;
    const allChars = textDisplay.querySelectorAll('.char');
    
    // Handle backspace
    if (e.inputType === 'deleteContentBackward') {
        if (charIndex > 0) {
            charIndex--;
            typedEntries--;
            
            // Remove classes from current character
            allChars[charIndex].classList.remove('correct', 'incorrect');
            allChars[charIndex].classList.add('active');
            
            // Remove classes from next character if it exists
            if (allChars[charIndex + 1]) {
                allChars[charIndex + 1].classList.remove('active');
            }
            
            // Update mistakes count if needed
            if (allChars[charIndex].classList.contains('incorrect')) {
                mistakes--;
                calculateWPM();
            }
            
            updateCaret();
        }
        e.target.value = '';
        return;
    }

    // Handle regular input
    if (!testActive && inputValue.length > 0) {
        startTest();
    }

    if (testActive && charIndex < allChars.length) {
        const typedChar = inputValue[inputValue.length - 1];
        const currentChar = allChars[charIndex].textContent;
        
        typedEntries++;
        
        // Check character match
        if (typedChar === currentChar) {
            allChars[charIndex].classList.add('correct');
        } else {
            allChars[charIndex].classList.add('incorrect');
            mistakes++;
        }
        
        // Move to next character
        allChars[charIndex].classList.remove('active');
        charIndex++;
        
        if (charIndex < allChars.length) {
            allChars[charIndex].classList.add('active');
            updateCaret();
        } else {
            // When all words are completed, clear display and load new words
            generateRandomText();
            setTimeout(() => {
                charIndex = 0;
                const allCharsNew = textDisplay.querySelectorAll('.char');
                if (allCharsNew[charIndex]) {
                    allCharsNew[charIndex].classList.add('active');
                    updateCaret();
                }
            }, 100);
        }
        
        calculateWPM();
        e.target.value = '';
    }
});

// Additional event listeners
testArea.addEventListener('click', () => {
    textInput.focus();
    if (!testActive) {
        focusMessage.style.display = 'none';
    }
});

textInput.addEventListener('blur', () => {
    if (!testActive) {
        focusMessage.style.display = 'block';
    }
});

restartBtn.addEventListener('click', initTest);
bottomRestartBtn.addEventListener('click', initTest);

timeOptions.addEventListener('change', () => {
    selectedTime = parseInt(timeOptions.value);
    initTest();
});

modeOptions.addEventListener('change', () => {
    selectedMode = modeOptions.value;
    initTest();
});

/**
 * Initialization
 */
window.addEventListener('load', () => {
    selectedTime = parseInt(timeOptions.value);
    selectedMode = modeOptions.value;
    initTest();
    textInput.focus();
    updateHistoryDisplay();
});

// Handle responsive caret positioning
window.addEventListener('resize', updateCaret);

/**
 * Enhanced Stats Display
 */
function updateStats(value, elementId) {
    const element = document.getElementById(elementId);
    element.textContent = value;
    element.classList.remove('animate');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('animate');
}