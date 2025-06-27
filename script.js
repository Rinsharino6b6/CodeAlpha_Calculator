const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let currentInput = "";

function updateDisplay(value) {
  display.value = value;
}

function calculate() {
  try {
    const result = eval(currentInput);
    updateDisplay(result);
    currentInput = result.toString();
  } catch {
    updateDisplay("Error");
    currentInput = "";
  }
}

// Handle button clicks
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const key = button.getAttribute("data-key");

    if (key === "C") {
      currentInput = "";
      updateDisplay("");
    } else if (key === "Enter") {
      calculate();
    } else if (key === "Backspace") {
      currentInput = currentInput.slice(0, -1);
      updateDisplay(currentInput);
    } else {
      currentInput += key;
      updateDisplay(currentInput);
    }
  });
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if ((/[0-9+\-*/.]/).test(key)) {
    currentInput += key;
    updateDisplay(currentInput);
  } else if (key === "Enter") {
    e.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput);
  } else if (key === "Escape") {
    currentInput = "";
    updateDisplay("");
  }
});
