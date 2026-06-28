export function applyDiceTheme(settings) {
    document.documentElement.style.setProperty("--dice-color", settings.diceColor);
    document.documentElement.style.setProperty("--dice-glow-color", settings.glowColor);
    document.documentElement.style.setProperty("--dice-bg-color", settings.backgroundColor);
    document.documentElement.style.setProperty("--dice-text-color", settings.textColor);
    document.documentElement.style.setProperty("--dice-nat20-color", settings.natural20Color);
    document.documentElement.style.setProperty("--dice-nat1-color", settings.natural1Color);
}