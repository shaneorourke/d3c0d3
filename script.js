$(document).ready(function () {
    let passcode = '';
    let attempts = 0;

    function generatePasscode(length) {
        return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    }

    function calculateCompletion(passcode, guess) {
        let correctCount = 0;
        let weightedCount = 0;
        const length = passcode.length;
        const matched = Array(length).fill(false);

        for (let i = 0; i < length; i++) {
            if (passcode[i] === guess[i]) {
                correctCount++;
                matched[i] = true;
            }
        }

        for (let i = 0; i < length; i++) {
            if (passcode[i] !== guess[i]) {
                for (let j = 0; j < length; j++) {
                    if (!matched[j] && passcode[j] === guess[i]) {
                        const distance = Math.abs(i - j);
                        weightedCount += (length - distance) / length;
                        matched[j] = true;
                        break;
                    }
                }
            }
        }

        const exactMatchPercent = (correctCount / length) * 100;
        const weightedPercent = (weightedCount / length) * 50;
        return exactMatchPercent + weightedPercent;
    }

    $('#terminal').terminal({
        start: function (difficulty) {
            const length = parseInt(difficulty);
            if (![4, 6, 8].includes(length)) {
                this.echo('Invalid difficulty! Use 4, 6, or 8.');
                return;
            }

            passcode = generatePasscode(length);
            attempts = 0;
            this.clear();
            this.echo(`Game started! Decode the ${length}-digit passcode.`);
        },
        guess: function (input) {
            if (passcode === '') {
                this.echo('Start the game first using: start [4|6|8]');
                return;
            }
        
            // Ensure input is treated as a string
            input = String(input).trim();
        
            if (input.length !== passcode.length || !/^\d+$/.test(input)) {
                this.echo(`Invalid input. Enter a numeric guess of exactly ${passcode.length} digits.`);
                return;
            }
        
            attempts++;
            const completion = calculateCompletion(passcode, input);
        
            if (completion === 100) {
                this.echo(`🎉 Congratulations! You cracked the code "${passcode}" in ${attempts} attempts!`);
                passcode = ''; // Reset the game
            } else {
                this.echo(`Completion: ${completion.toFixed(2)}%. Try again!`);
                if (attempts === 5) {
                    this.echo(`Hint: The first digit is ${passcode[0]}.`);
                }
            }
        },
        restart: function () {
            passcode = '';
            this.clear();
            this.echo('Game reset. Start a new game using: start [4|6|8]');
        },
        help: function () {
            this.echo(`
Available Commands:
  start [4|6|8]    - Start the game with a passcode of the specified length.
  guess [number]   - Make a guess. Must match the passcode length.
  restart          - Restart the game and reset progress.
  help, -h, --help - Show this help menu.
  
Objective:
  Decode the passcode by guessing the correct digits in the correct order.
  You'll receive a "completion" percentage as feedback:
    - Correct digits in the correct position: Full points.
    - Correct digits in the wrong position: Partial points based on distance.
  Keep guessing until you reach 100% completion!
`);
        }
    }, {
        greetings: 'Welcome to the Passcode Decoder Terminal! Type "help" or "-h" for instructions.',
        prompt: '> '
    });
});
