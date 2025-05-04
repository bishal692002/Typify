// Word lists for random text generation
const commonWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", 
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

// DOM Elements
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

// Variables
let timer;
let timeLeft;
let testActive = false;
let charIndex = 0;
let mistakes = 0;
let wpm = 0;
let selectedTime = parseInt(timeOptions.value);
let testText = [];
let typedEntries = 0;

// Initialize the test
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

// Generate random text
function generateRandomText() {
    testText = [];
    // Generate about 100 words (more than enough for most tests)
    for (let i = 0; i < 100; i++) {
        testText.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
    }
}

// Display text for typing test
function displayText() {
    textDisplay.innerHTML = '';
    testText.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        
        // Add each character of the word
        Array.from(word).forEach((char, charIdx) => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.className = 'char';
            wordSpan.appendChild(charSpan);
        });
        
        // Add space after word
        if (wordIndex < testText.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            spaceSpan.className = 'char';
            wordSpan.appendChild(spaceSpan);
        }
        
        textDisplay.appendChild(wordSpan);
    });

    // Highlight the first character
    const firstChar = textDisplay.querySelector('.char');
    if (firstChar) {
        firstChar.classList.add('active');
    }
}

// Start the test
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

// End the test
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
}

// Calculate words per minute
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

// Update caret position
function updateCaret() {
    const activeChar = textDisplay.querySelector('.active');
    if (activeChar) {
        const rect = activeChar.getBoundingClientRect();
        const testRect = textDisplay.getBoundingClientRect();
        
        caret.style.left = `${rect.left - testRect.left}px`;
        caret.style.top = `${rect.top - testRect.top}px`;
    }
}

// Event Listeners
textInput.addEventListener('input', e => {
    const typedChar = e.target.value;
    e.target.value = ''; // Clear input after each character
    
    if (!testActive && typedChar.length > 0) {
        startTest();
    }

    if (testActive) {
        const allChars = textDisplay.querySelectorAll('.char');
        
        if (charIndex < allChars.length) {
            typedEntries++;
            
            // Check if typed character matches current character
            if (typedChar === allChars[charIndex].textContent) {
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
        }
    }
});

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

// Initialize on page load
window.addEventListener('load', () => {
    initTest();
    textInput.focus();
});

// Update caret position on window resize
window.addEventListener('resize', updateCaret);