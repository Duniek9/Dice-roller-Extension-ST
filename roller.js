export function rollDie(sides = 20) {
    return Math.floor(Math.random() * sides) + 1;
}