import { extension_settings } from "../../../extensions.js";

import { getDiceSettings } from "./storage.js";
import { applyDiceTheme } from "./theme.js";
import { createDicePopup, showRollRequest } from "./popup.js";
import { createDiceSettingsMenu } from "./settings.js";
import { initRollDetection } from "./detect.js";


console.log("🎲 Dice Roller index.js reached");

async function startDiceRoller() {
    try {
        

        const settings = getDiceSettings(extension_settings);
       

        applyDiceTheme(settings);
       

        createDiceSettingsMenu(extension_settings, settings);
        

        createDicePopup(settings);
        

        initRollDetection(showRollRequest);
       
        window.testDiceRoll = () => {
            showRollRequest({
                sides: 20,
                reason: "Mobile Test",
                dc: 15,
            });
        };

        
    } catch (err) {
        alert("Dice crashed: " + err.message);
    }
}

startDiceRoller();