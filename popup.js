import { animateDiceRoll } from "./animation.js";

let pendingRoll = null;
let currentRoll = null;
let isRolling = false;
let rollCount = 0;

export function createDicePopup(settings) {
    if ($("#dice_roller_popup").length > 0) return;

    const html = `
        <div id="dice_roller_popup" class="dice-popup hidden">
            <div class="dice-popup-box">
                <h2 id="dice_popup_title">D20 Roll</h2>

                <div id="dice_popup_die" class="dice-popup-die">?</div>

                <p id="dice_popup_reason">Waiting for roll...</p>
                <p id="dice_popup_result">Click roll to begin</p>
                <p id="dice_popup_rolls_left"></p>

                <div class="dice-popup-buttons">
                    <button id="dice_popup_roll">Roll Dice</button>
                    <button id="dice_popup_close">Close</button>
                </div>

                <div class="dice-popup-manual">
                    <h3>Physical Dice</h3>

                    <input
                        id="dice_manual_result"
                        type="number"
                        min="1"
                        max="20"
                        placeholder="Enter result"
                    >

                    <button id="dice_manual_submit">
                        Use Physical Roll
                    </button>
                </div>
            </div>
        </div>

        <div id="dice_roll_request" class="dice-roll-request hidden">
            <span id="dice_roll_request_text">Roll requested</span>
            <button id="dice_roll_request_button">Open Roll</button>
            <button id="dice_roll_request_dismiss">×</button>
        </div>
    `;

    $("body").append(html);

    $("#dice_popup_close").on("click", closeDicePopup);

    $("#dice_popup_roll").on("click", async () => {
    if (isRolling || !currentRoll) return;
    if (rollCount >= settings.maxRolls) return;

    isRolling = true;
    $("#dice_popup_roll").prop("disabled", true);

    const result = await animateDiceRoll({
        diceElement: document.getElementById("dice_popup_die"),
        resultElement: document.getElementById("dice_popup_result"),
        sides: currentRoll.sides,
        duration: 1500,
    });

    finishRoll(result, settings);

    isRolling = false;
});

    $("#dice_roll_request_button").on("click", () => {
        if (!pendingRoll) return;

        openDicePopup(pendingRoll, settings);
        hideRollRequest();
    });

    $("#dice_roll_request_dismiss").on("click", () => {
        pendingRoll = null;
        hideRollRequest();
    });

    $("#dice_manual_submit").on("click", () => {
    if (isRolling || !currentRoll) return;
    if (rollCount >= settings.maxRolls) return;

    const result = Number($("#dice_manual_result").val());

    if (!Number.isInteger(result) || result < 1 || result > currentRoll.sides) {
        alert(`Enter a number between 1 and ${currentRoll.sides}.`);
        return;
    }

    finishRoll(result, settings);
    $("#dice_manual_result").val("");
    });
}

export function showRollRequest(rollData = {}) {
    pendingRoll = normalizeRollData(rollData);

    let text = `🎲 ${pendingRoll.reason}`;

    if (pendingRoll.dc !== null) {
        text += ` | DC ${pendingRoll.dc}`;
    }

    $("#dice_roll_request_text").text(text);
    $("#dice_roll_request").removeClass("hidden");
}

export function hideRollRequest() {
    $("#dice_roll_request").addClass("hidden");
}

export function openDicePopup(rollData = {}, settings) {
    currentRoll = normalizeRollData(rollData);
    rollCount = 0;

    $("#dice_popup_title").text(`D${currentRoll.sides} Roll`);

    let reasonText = currentRoll.reason;

    if (currentRoll.dc !== null) {
        reasonText += ` | DC ${currentRoll.dc}`;
    }

    $("#dice_popup_reason").text(reasonText);
    $("#dice_popup_result").text("Click roll to begin");
    $("#dice_popup_result").css("color", "var(--dice-text-color)");
    $("#dice_manual_submit").prop("disabled", false);
    $("#dice_manual_result").prop("disabled", false);
    $("#dice_popup_die").text("?");

    $("#dice_popup_roll").prop("disabled", false);
    updateRollsLeft(settings);

    $("#dice_roller_popup").removeClass("hidden");

   $("#dice_manual_result")
        .val("")
        .attr("max", currentRoll.sides)
        .attr("placeholder", `1-${currentRoll.sides}`);
}

export function closeDicePopup() {
    if (isRolling) return;
    $("#dice_roller_popup").addClass("hidden");
}

function updateRollsLeft(settings) {
    const rollsLeft = settings.maxRolls - rollCount;
    $("#dice_popup_rolls_left").text(`Rolls left: ${rollsLeft}`);
}

function lockRollResult(settings) {
    $("#dice_popup_roll").prop("disabled", true);
    $("#dice_popup_rolls_left").text("Roll locked.");
    $("#dice_manual_submit").prop("disabled", true);
    $("#dice_manual_result").prop("disabled", true);

    handleResultMode(settings);
}

function handleResultMode(settings) {
    if (!currentRoll?.result) return;

    const text = `(OOC: Rolled ${currentRoll.result} on ${currentRoll.reason}${currentRoll.dc !== null ? `, DC ${currentRoll.dc}` : ""}.)`;

    if (settings.resultMode === "none") {
        return;
    }

    const textarea = $("#send_textarea");

    if (!textarea.length) {
        console.warn("🎲 Dice Roller: Could not find SillyTavern text box.");
        return;
    }

    textarea.val(text);
    textarea.trigger("input");

    if (settings.resultMode === "send") {
        $("#send_but").trigger("click");
    }
}

function normalizeRollData(rollData = {}) {
    return {
        sides: Number(rollData.sides ?? 20),
        reason: rollData.reason ?? "Dice check",
        dc: rollData.dc ?? null,
        result: null,
    };
}

function finishRoll(result, settings) {
    rollCount++;
    currentRoll.result = result;

    $("#dice_popup_die").text(result);
    $("#dice_popup_result").css("color", "var(--dice-text-color)");

    if (currentRoll.sides === 20 && result === 20) {
        $("#dice_popup_result")
            .text("Natural 20! Critical success!")
            .css("color", "var(--dice-nat20-color)");
    } else if (currentRoll.sides === 20 && result === 1) {
        $("#dice_popup_result")
            .text("Natural 1! Critical failure!")
            .css("color", "var(--dice-nat1-color)");
    } else {
        $("#dice_popup_result").text(`Result: ${result}`);
    }

    updateRollsLeft(settings);

    if (rollCount >= settings.maxRolls) {
        lockRollResult(settings);
    } else {
        $("#dice_popup_roll").prop("disabled", false);
    }
}