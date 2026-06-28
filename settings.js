import { saveSettingsDebounced } from "../../../../script.js";

import { resetDiceSettings } from "./storage.js";
import { applyDiceTheme } from "./theme.js";

export function createDiceSettingsMenu(extensionSettings, diceSettings) {
    if ($("#dice_roller_settings").length > 0) return;

    const html = `
<div class="inline-drawer">

    <div class="inline-drawer-toggle inline-drawer-header">
        <b>🎲 D20 Dice Roller</b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>

    <div class="inline-drawer-content">

        <div id="dice_roller_settings" class="dice-settings">

            <div class="dice-settings-section">
                <h4>Theme</h4>

                ${colorPicker("Dice Color", "diceColor", diceSettings.diceColor)}
                ${colorPicker("Glow Color", "glowColor", diceSettings.glowColor)}
                ${colorPicker("Background Color", "backgroundColor", diceSettings.backgroundColor)}
                ${colorPicker("Text Color", "textColor", diceSettings.textColor)}
                ${colorPicker("Natural 20 Color", "natural20Color", diceSettings.natural20Color)}
                ${colorPicker("Natural 1 Color", "natural1Color", diceSettings.natural1Color)}
            </div>

            <div class="dice-settings-section">
                <h4>Roll Rules</h4>

                <label class="dice-setting-row">
                    <span>Number of rolls before locking result</span>
                    <input
                        id="dice_setting_max_rolls"
                        type="number"
                        min="1"
                        max="20"
                        step="1"
                        value="${diceSettings.maxRolls}"
                    >
                </label>
            </div>

            <div class="dice-settings-section">
                <h4>After Roll</h4>

                ${radioOption(
                    "none",
                    "Don't insert roll into the message",
                    diceSettings.resultMode
                )}

                ${radioOption(
                    "insert",
                    "Insert OOC rolled result into text box, but don't send",
                    diceSettings.resultMode
                )}

                ${radioOption(
                    "send",
                    "Insert OOC rolled result and send the message",
                    diceSettings.resultMode
                )}
            </div>

            <button id="dice_setting_reset_theme">
                Reset Dice Settings
            </button>

        </div>

    </div>

</div>
`;

    $("#extensions_settings").append(html);

    bindColorPicker("diceColor", diceSettings);
    bindColorPicker("glowColor", diceSettings);
    bindColorPicker("backgroundColor", diceSettings);
    bindColorPicker("textColor", diceSettings);
    bindColorPicker("natural20Color", diceSettings);
    bindColorPicker("natural1Color", diceSettings);

    $("#dice_setting_max_rolls").on("input", function () {
        const value = Number(this.value);

        diceSettings.maxRolls = Math.max(1, Math.min(20, value || 1));
        saveSettingsDebounced();
    });

    $("input[name='dice_result_mode']").on("change", function () {
        diceSettings.resultMode = this.value;
        saveSettingsDebounced();
    });

    $("#dice_setting_reset_theme").on("click", () => {
        const newSettings = resetDiceSettings(extensionSettings);

        applyDiceTheme(newSettings);
        saveSettingsDebounced();

        $("#dice_roller_settings").remove();
        createDiceSettingsMenu(extensionSettings, newSettings);
    });
}

function colorPicker(label, key, value) {
    return `
        <label class="dice-setting-row">
            <span>${label}</span>
            <input
                type="color"
                class="dice-color-picker"
                data-setting-key="${key}"
                value="${value}"
            >
        </label>
    `;
}

function radioOption(value, label, currentValue) {
    const checked = value === currentValue ? "checked" : "";

    return `
        <label class="dice-radio-row">
            <input
                type="radio"
                name="dice_result_mode"
                value="${value}"
                ${checked}
            >
            <span>${label}</span>
        </label>
    `;
}

function bindColorPicker(settingKey, diceSettings) {
    $(`input[data-setting-key='${settingKey}']`).on("input", function () {
        diceSettings[settingKey] = this.value;

        applyDiceTheme(diceSettings);
        saveSettingsDebounced();
    });
}