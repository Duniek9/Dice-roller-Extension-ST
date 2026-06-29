import { extension_settings } from "../../../extensions.js";

import { getDiceSettings } from "./storage.js";
import { applyDiceTheme } from "./theme.js";
import { createDicePopup, showRollRequest } from "./popup.js";
import { createDiceSettingsMenu } from "./settings.js";
import { initRollDetection } from "./detect.js";

alert("Dice Roller index.js loaded");
console.log("🎲 Dice Roller index.js reached");

jQuery(async () => {
    try {
        console.log("🎲 Dice Roller starting...");

        const settings = getDiceSettings(extension_settings);
        console.log("✅ Settings loaded");

        applyDiceTheme(settings);
        console.log("✅ Theme applied");

        createDiceSettingsMenu(extension_settings, settings);
        console.log("✅ Menu created");

        createDicePopup(settings);
        console.log("✅ Popup created");

        initRollDetection(showRollRequest);
        console.log("✅ Detection initialized");

        window.testDiceRoll = () => {
            showRollRequest({
                sides: 20,
                reason: "Mobile Test",
                dc: 15,
            });
        };

        console.log("✅ testDiceRoll registered");

        $("body").append(`
            <button id="dice_mobile_test"
                style="
                    position:fixed;
                    right:10px;
                    bottom:120px;
                    z-index:999999;
                    padding:12px;
                    background:#7e22ce;
                    color:white;
                    border:none;
                    border-radius:10px;
                ">
                🎲 Test Dice
            </button>
        `);

        $("#dice_mobile_test").on("click", () => {
            window.testDiceRoll();
        });

        console.log("✅ Test button created");

    } catch (err) {
        console.error("🎲 Startup crashed:", err);
        alert(err.stack);
    }
});