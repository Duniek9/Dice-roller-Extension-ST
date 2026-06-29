import { extension_settings } from "../../../extensions.js";

import { getDiceSettings } from "./storage.js";
import { applyDiceTheme } from "./theme.js";
import { createDicePopup, showRollRequest } from "./popup.js";
import { createDiceSettingsMenu } from "./settings.js";
import { initRollDetection } from "./detect.js";

alert("Dice Roller index.js loaded");
console.log("🎲 Dice Roller index.js reached");

async function startDiceRoller() {
    try {
        alert("Dice startup begin");

        const settings = getDiceSettings(extension_settings);
        alert("Settings loaded");

        applyDiceTheme(settings);
        alert("Theme applied");

        createDiceSettingsMenu(extension_settings, settings);
        alert("Menu created");

        createDicePopup(settings);
        alert("Popup created");

        initRollDetection(showRollRequest);
        alert("Detection initialized");

        window.testDiceRoll = () => {
            showRollRequest({
                sides: 20,
                reason: "Mobile Test",
                dc: 15,
            });
        };

        alert("testDiceRoll registered");
    } catch (err) {
        alert("Dice crashed: " + err.message);
    }
}

startDiceRoller();