import { rollDie } from "./roller.js";

export async function animateDiceRoll({
    diceElement,
    resultElement,
    sides = 20,
    duration = 1500,
}) {
    diceElement.classList.add("dice-rolling");
    resultElement.textContent = "Rolling...";

    const interval = setInterval(() => {
        diceElement.textContent = rollDie(sides);
    }, 75);

    await new Promise(resolve => setTimeout(resolve, duration));

    clearInterval(interval);

    const result = rollDie(sides);

    diceElement.textContent = result;
    diceElement.classList.remove("dice-rolling");

    if (sides === 20 && result === 20) {
        resultElement.textContent = "Natural 20! Critical success!";
        resultElement.style.color = "var(--dice-nat20-color)";
     } else if (sides === 20 && result === 1) {
        resultElement.textContent = "Natural 1! Critical failure!";
        resultElement.style.color = "var(--dice-nat1-color)";
    } else {
        resultElement.textContent = `Result: ${result}`;
         resultElement.style.color = "var(--dice-text-color)";
    }

    return result;
}

