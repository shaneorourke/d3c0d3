$(document).ready(function () {
    let passcode = '';
    let attempts = 0;

    // Generate a passcode as a string, preserving leading zeros
    function generatePasscode(length) {
        return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    }

    // Calculate completion percentage
    function calculateCompletion(passcode, guess) {
        let correctCount = 0;
        let misplacedCount = 0;
        const matched = Array(passcode.length).fill(false);

        // Correct digits in correct positions
        for (let i = 0; i < passcode.length; i++) {
            if (passcode[i] === guess[i]) {
                correctCount++;
                matched[i] = true;
            }
        }

        // Correct digits in incorrect positions
        for (let i = 0; i < guess.length; i++) {
            if (passcode[i] !== guess[i]) {
                for (let j = 0; j < passcode.length; j++) {
                    if (!matched[j] && passcode[j] === guess[i]) {
                        misplacedCount++;
                        matched[j] = true;
                        break;
                    }
                }
            }
        }

        // Calculate final completion
        const exactMatchPercent = (correctCount / passcode.length) * 100;
        const misplacedPercent = (misplacedCount / passcode.length) * 50;
        return exactMatchPercent + misplacedPercent;
    }

    // Initialize the terminal
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
            // Ensure input is treated as a string
            input = String(input).trim();

            if (passcode === '') {
                this.echo('Start the game first using: start [4|6|8]');
                return;
            }

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
        }
    }, {
        greetings: 'Welcome to the Passcode Decoder! Type "start [4|6|8]" to begin.',
        prompt: '> '
    });

    // Ensure the terminal stays visible when the keyboard appears
    $(window).on('resize', function () {
        $(window).scrollTop(0);
    });
});