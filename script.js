document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('display');
    const history = document.getElementById('history');
    let currentInput = '';
    let lastAnswer = 0;
    let memory = 0;
    let bracketCount = 0;
    let angleMode = 'deg'; // Default to degrees
    let awaitingSecondOperand = false;
    let currentOperation = null;
    let firstOperand = null;
    
    // Initialize calculator
    display.value = '';
    
    // Add event listeners to all buttons
    document.querySelectorAll('.calculator-button').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            const value = button.getAttribute('data-value');
            
            if (value) {
                appendToDisplay(value);
            } else if (action) {
                handleAction(action);
            }
        });
    });
    
    // Listen for keyboard input
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        
        // Handle numbers and basic operators
        if (/^\d$/.test(key) || key === '.') {
            appendToDisplay(key);
        } else if (key === '+') {
            appendToDisplay('+');
        } else if (key === '-') {
            appendToDisplay('-');
        } else if (key === '*') {
            appendToDisplay('*');
        } else if (key === '/') {
            appendToDisplay('/');
        } else if (key === '^') {
            appendToDisplay('^');
        } else if (key === '(' || key === ')') {
            appendToDisplay(key);
        } else if (key === 'Enter' || key === '=') {
            handleAction('calculate');
        } else if (key === 'Backspace') {
            handleAction('backspace');
        } else if (key === 'Escape') {
            handleAction('clear');
        } else if (key === 'p' || key === 'P') {
            if (currentInput && /\d+$/.test(currentInput)) {
                handleSpecialOperation('P');
            }
        } else if (key === 'c' || key === 'C') {
            if (currentInput && /\d+$/.test(currentInput)) {
                handleSpecialOperation('C');
            }
        }
    });
    
    function appendToDisplay(value) {
        // Check if we're in a special operation mode
        if (awaitingSecondOperand && /^\d$/.test(value)) {
            // Handle operations like "5P2" or "5C2"
            const secondOperand = parseInt(value);
            processSpecialOperation(firstOperand, secondOperand, currentOperation);
            awaitingSecondOperand = false;
            currentOperation = null;
            return;
        }
        
        currentInput += value;
        display.value = currentInput;
    }
    
    function handleAction(action) {
        switch (action) {
            case 'calculate':
                calculate();
                break;
            case 'clear':
                currentInput = '';
                display.value = '';
                bracketCount = 0;
                awaitingSecondOperand = false;
                currentOperation = null;
                break;
            case 'backspace':
                if (currentInput.endsWith('(')) bracketCount--;
                if (currentInput.endsWith(')')) bracketCount++;
                currentInput = currentInput.slice(0, -1);
                display.value = currentInput;
                break;
            case 'add':
                appendToDisplay('+');
                break;
            case 'subtract':
                appendToDisplay('-');
                break;
            case 'multiply':
                appendToDisplay('*');
                break;
            case 'divide':
                appendToDisplay('/');
                break;
            case 'power':
                appendToDisplay('^');
                break;
            case 'sqrt':
                insertFunction('sqrt');
                break;
            case 'pi':
                appendToDisplay('pi');
                break;
            case 'e':
                appendToDisplay('e');
                break;
            case 'sin':
                insertFunction('sin');
                break;
            case 'cos':
                insertFunction('cos');
                break;
            case 'tan':
                insertFunction('tan');
                break;
            case 'asin':
                insertFunction('asin');
                break;
            case 'acos':
                insertFunction('acos');
                break;
            case 'atan':
                insertFunction('atan');
                break;
            case 'cot':
                insertFunction('cot');
                break;
            case 'log':
                insertFunction('log10');
                break;
            case 'ln':
                insertFunction('log');
                break;
            case 'exp':
                insertFunction('exp');
                break;
            case 'factorial':
                insertFunction('factorial');
                break;
            case 'permutation':
                handleSpecialOperation('P');
                break;
            case 'combination':
                handleSpecialOperation('C');
                break;
            case 'binomial':
                insertFunction('binomial');
                break;
            case 'abs':
                insertFunction('abs');
                break;
            case 'brackets':
                if (bracketCount > 0 && 
                    (currentInput.length === 0 || 
                     /[\+\-\*\/\(\^]$/.test(currentInput))) {
                    appendToDisplay('(');
                    bracketCount++;
                } else {
                    appendToDisplay(')');
                    bracketCount--;
                }
                break;
            case 'ans':
                appendToDisplay('ans');
                break;
            case 'memory-store':
                if (currentInput) {
                    try {
                        memory = evaluateExpression(currentInput);
                        addToHistory(`MS: ${memory}`);
                        currentInput = '';
                        display.value = '';
                    } catch (error) {
                        display.value = 'Error';
                        setTimeout(() => {
                            display.value = currentInput;
                        }, 1000);
                    }
                }
                break;
            case 'memory-recall':
                appendToDisplay('memory');
                break;
            case 'memory-clear':
                memory = 0;
                addToHistory('Memory Cleared');
                break;
            case 'deg':
                angleMode = 'deg';
                addToHistory('Mode: Degrees');
                break;
            case 'rad':
                angleMode = 'rad';
                addToHistory('Mode: Radians');
                break;
        }
    }
    
    function handleSpecialOperation(op) {
        // If there's a valid number entered
        if (currentInput && /\d+$/.test(currentInput)) {
            // Extract the number
            const match = currentInput.match(/(\d+)$/);
            if (match) {
                const num = parseInt(match[1]);
                // Remove the number from the input
                currentInput = currentInput.slice(0, currentInput.length - match[1].length);
                // Add the operation symbol
                currentInput += num + op;
                display.value = currentInput;
                
                // Set up for the second operand
                awaitingSecondOperand = true;
                currentOperation = op;
                firstOperand = num;
            }
        }
    }
    
    function processSpecialOperation(n, r, op) {
        let result;
        const originalExpression = `${n}${op}${r}`;
        
        try {
            if (op === 'P') {
                // Permutation: nPr = n!/(n-r)!
                result = math.factorial(n) / math.factorial(n - r);
            } else if (op === 'C') {
                // Combination: nCr = n!/[r!(n-r)!]
                result = math.factorial(n) / (math.factorial(r) * math.factorial(n - r));
            }
            
            // Add to history
            addToHistory(`${originalExpression} = ${result}`);
            
            // Update display
            currentInput = result.toString();
            display.value = currentInput;
            lastAnswer = result;
        } catch (error) {
            display.value = 'Error';
            setTimeout(() => {
                display.value = currentInput;
            }, 1000);
        }
    }
    
    function insertFunction(funcName) {
        currentInput += funcName + '(';
        display.value = currentInput;
        bracketCount++;
    }
    
    function calculate() {
        if (!currentInput) return;
        
        try {
            // Check for special operations like 5P2 or 7C3
            const permMatch = currentInput.match(/(\d+)P(\d+)/);
            const combMatch = currentInput.match(/(\d+)C(\d+)/);
            
            if (permMatch) {
                const n = parseInt(permMatch[1]);
                const r = parseInt(permMatch[2]);
                processSpecialOperation(n, r, 'P');
                return;
            } else if (combMatch) {
                const n = parseInt(combMatch[1]);
                const r = parseInt(combMatch[2]);
                processSpecialOperation(n, r, 'C');
                return;
            }
            
            // Add missing closing parentheses if needed
            let expression = currentInput;
            while (bracketCount > 0) {
                expression += ')';
                bracketCount--;
            }
            
            // Evaluate the expression
            const result = evaluateExpression(expression);
            
            // Add to history
            addToHistory(`${expression} = ${result}`);
            
            // Update display and lastAnswer
            lastAnswer = result;
            currentInput = result.toString();
            display.value = currentInput;
            bracketCount = 0;
        } catch (error) {
            display.value = 'Error';
            setTimeout(() => {
                display.value = currentInput;
            }, 1000);
        }
    }
    
    function evaluateExpression(expression) {
        // Handle special operations
        expression = expression.replace(/(\d+)P(\d+)/g, function(match, n, r) {
            return `permutations(${n},${r})`;
        });
        
        expression = expression.replace(/(\d+)C(\d+)/g, function(match, n, r) {
            return `combinations(${n},${r})`;
        });
        
        // Replace custom functions and constants
        expression = expression.replace(/ans/g, lastAnswer);
        expression = expression.replace(/memory/g, memory);
        
        // Custom functions
        math.import({
            cot: function(x) {
                return 1 / Math.tan(x);
            },
            permutations: function(n, r) {
                return math.factorial(n) / math.factorial(n - r);
            },
            combinations: function(n, r) {
                return math.factorial(n) / (math.factorial(r) * math.factorial(n - r));
            },
            binomial: function(n, k, p) {
                return math.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
            }
        }, {override: true});
        
        // Angle mode
        const config = {};
        if (angleMode === 'deg') {
            config.angle = 'deg';
        }
        
        return math.evaluate(expression, config);
    }
    
    function addToHistory(text) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        if (text.includes('=')) {
            const [expression, result] = text.split('=');
            historyItem.innerHTML = `
                <span class="history-expression">${expression.trim()}</span>
                <span class="history-result">${result.trim()}</span>
            `;
        } else {
            historyItem.textContent = text;
        }
        
        history.appendChild(historyItem);
        history.scrollTop = history.scrollHeight;
        
        // Keep only the last 10 items
        while (history.children.length > 10) {
            history.removeChild(history.firstChild);
        }
    }
});