import { extension_settings } from "../../../extensions.js";

import { getDiceSettings } from "./storage.js";
import { applyDiceTheme } from "./theme.js";
import { createDicePopup, showRollRequest } from "./popup.js";
import { createDiceSettingsMenu } from "./settings.js";
import { initRollDetection } from "./detect.js";

jQuery(async () => {
    const settings = getDiceSettings(extension_settings);

    applyDiceTheme(settings);
    createDiceSettingsMenu(extension_settings, settings);
    createDicePopup(settings);
    initRollDetection(showRollRequest);

    window.testDiceRoll = () => {
        showRollRequest({
            sides: 20,
            reason: "Perception Check",
            dc: 15,
        });
    };

    console.log("🎲 Dice Roller loaded", settings);
});