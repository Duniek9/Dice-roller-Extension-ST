export const extensionName = "dice_roller";

export const defaultSettings = {
    diceColor: "#facc15",
    glowColor: "#7e22ce",
    backgroundColor: "#1e1b4b",
    textColor: "#ffffff",
    natural20Color: "#22c55e",
    natural1Color: "#ef4444",

    maxRolls: 1,
    resultMode: "none",
};

export function getDiceSettings(extensionSettings) {
    const settings = /** @type {Record<string, any>} */ (extensionSettings);

    settings[extensionName] ??= {};

    for (const [key, value] of Object.entries(defaultSettings)) {
        settings[extensionName][key] ??= value;
    }

    return settings[extensionName];
}

export function resetDiceSettings(extensionSettings) {
    const settings = /** @type {Record<string, any>} */ (extensionSettings);

    settings[extensionName] = structuredClone(defaultSettings);

    return settings[extensionName];
}