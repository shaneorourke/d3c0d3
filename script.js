let passcode = '';
let attempts = 0;

// Generate a random passcode based on length
function generatePasscode(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// Start the game
function startGame() {
    const length = parseInt(document.getElementById('difficulty').value);
    passcode = generatePasscode(length);
    attempts = 0;

    // Update UI
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('output').innerHTML = `<p>Game started! Decode the ${length}-digit passcode.</p>`;
}

// Calculate completion percentage
function calculateCompletion(passcode, guess) {
    let correctCount = 0;
    let weightedCount = 0;
    const length = passcode.length;

    // Track matched digits in the passcode to avoid double-counting
    const matched = Array(length).fill(false);

    // First pass: check for numbers in the correct position
    for (let i = 0; i < length; i++) {
        if (passcode[i] === guess[i]) {
            correctCount++;
            matched[i] = true; // Mark as matched
        }
    }

    // Second pass: check for correct numbers in incorrect positions
    for (let i = 0; i < length; i++) {
        if (passcode[i] !== guess[i]) {
            for (let j = 0; j < length; j++) {
                if (!matched[j] && passcode[j] === guess[i]) {
                    // Calculate distance-based weight
                    const distance = Math.abs(i - j);
                    weightedCount += (length - distance) / length;
                    matched[j] = true; // Mark as matched
                    break;
                }
            }
        }
    }

    // Calculate final completion percentage
    const exactMatchPercent = (correctCount / length) * 100;
    const weightedPercent = (weightedCount / length) * 50; // Weighted counts contribute up to 50%
    return exactMatchPercent + weightedPercent;
}

// Submit a guess
function submitGuess() {
    const guess = document.getElementById('guess').value;
    const output = document.getElementById('output');

    if (guess.length !== passcode.length || isNaN(guess)) {
        const inputBox = document.getElementById('guess');
        inputBox.classList.add('error');
        setTimeout(() => inputBox.classList.remove('error'), 500);
        return;
    }

    attempts++;
    const completion = calculateCompletion(passcode, guess);

    if (completion === 100) {
        output.innerHTML = `<p>🎉 Congratulations! You cracked the code <b>${passcode}</b> in ${attempts} attempts!</p>`;
        saveHighScore(attempts);
        displayHighScores();
    } else {
        output.innerHTML = `<p>Completion: ${completion.toFixed(2)}%. Try again!</p>`;
        if (attempts === 5) {
            output.innerHTML += `<p class="blink">Hint: The first digit is ${passcode[0]}.</p>`;
        }
    }

    document.getElementById('guess').value = ''; // Clear input
}

// Save high scores
function saveHighScore(attempts) {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push(attempts);
    highScores.sort((a, b) => a - b); // Sort ascending
    localStorage.setItem('highScores', JSON.stringify(highScores.slice(0, 5))); // Keep top 5 scores
}

// Display high scores
function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const output = document.getElementById('output');
    output.innerHTML += '<p>High Scores:</p>';
    highScores.forEach((score, index) => {
        output.innerHTML += `<p>${index + 1}. ${score} attempts</p>`;
    });
}

// Restart the game
function restartGame() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('output').innerHTML = '';
    document.getElementById('guess').value = '';
}
