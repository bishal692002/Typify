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
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
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
const timeOptions = document.querySelector('.time-options');
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
let selectedTime = parseInt(timeOptions.value);
let testText = [];
let typedEntries = 0;

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

    // Generate random text for testing
    generateRandomText();
    
    // Display the text
    displayText();
    
    // Hide restart button
    restartBtn.style.display = 'none';
    
    // Show focus message
    focusMessage.style.display = 'block';

    // Reset input
    textInput.value = '';
}

/**
 * Generates random text for the typing test
 * Creates an array of 100 randomly selected common words
 */
function generateRandomText() {
    testText = [];
    // Generate about 100 words (more than enough for most tests)
    for (let i = 0; i < 100; i++) {
        testText.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
    }
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
        wpmDisplay.textContent = wpm;
        
        // Calculate accuracy
        const accuracy = typedEntries > 0 ? Math.round(((typedEntries - mistakes) / typedEntries) * 100) : 100;
        accuracyDisplay.textContent = `${accuracy}%`;
        
        // Update characters display
        charactersDisplay.textContent = `${adjustedChars}/${typedEntries}`;
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

timeOptions.addEventListener('change', () => {
    selectedTime = parseInt(timeOptions.value);
    initTest();
});

/**
 * Initialization
 */
window.addEventListener('load', () => {
    initTest();
    textInput.focus();
});

// Handle responsive caret positioning
window.addEventListener('resize', updateCaret);