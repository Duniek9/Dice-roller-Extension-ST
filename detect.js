import { eventSource, event_types, chat } from "../../../../script.js"

const actionOverrides = [
    { words: ["dodge", "evade", "avoid", "sidestep"], skill: "Dexterity" },
    { words: ["jump", "climb", "swim", "push", "pull"], skill: "Athletics" },
    { words: ["heal", "stabilize", "treat wound", "bandage"], skill: "Medicine" },
    { words: ["teleport", "spell", "magic", "arcane"], skill: "Arcana" },
    { words: ["hide", "sneak", "move silently"], skill: "Stealth" },
    { words: ["notice", "spot", "see", "hear", "detect"], skill: "Perception" },
    { words: ["lie", "deceive", "bluff"], skill: "Deception" },
    { words: ["persuade", "convince", "talk down"], skill: "Persuasion" },
    { words: ["intimidate", "threaten", "scare"], skill: "Intimidation" },
];

const skills = [
    "acrobatics",
    "animal handling",
    "arcana",
    "athletics",
    "deception",
    "history",
    "insight",
    "intimidation",
    "investigation",
    "medicine",
    "nature",
    "perception",
    "performance",
    "persuasion",
    "religion",
    "sleight of hand",
    "stealth",
    "survival",

    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
];

export function initRollDetection(showRollRequest) {
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (messageId) => {
        const message = chat[messageId];

        if (!message?.mes) return;

        const rollData = detectRollRequest(message.mes);

        if (!rollData) return;

        showRollRequest(rollData);
    });
}

function detectRollRequest(text) {
    const clean = stripHtml(text).toLowerCase();

    const hasRollWord = /\b(roll|check|saving throw|save|d20)\b/i.test(clean);
    if (!hasRollWord) return null;

    const dcMatch = clean.match(/\bdc\s*(\d{1,2})\b/i);
    const dc = dcMatch ? Number(dcMatch[1]) : null;

    // 1. Explicit D&D skill/ability mention always wins
    const explicitSkill = detectExplicitSkill(clean);

    if (explicitSkill) {
        return {
            sides: 20,
            reason: `${explicitSkill} Check`,
            dc,
        };
    }

    // 2. Only guess from action words if no explicit skill was found
    const override = detectActionOverride(clean);

    if (override) {
        return {
            sides: 20,
            reason: `${override} Check`,
            dc,
        };
    }

    // 3. Generic fallback when the AI asks for a d20 roll but no skill is clear
    if (/\bd20\b/i.test(clean) || /\broll\b/i.test(clean)) {
        return {
            sides: 20,
            reason: "D20 Roll",
            dc,
        };
    }

    return null;
}

function detectExplicitSkill(cleanText) {
    for (const skillName of skills) {
        const regex = new RegExp(`\\b${escapeRegex(skillName)}\\b`, "i");

        if (regex.test(cleanText)) {
            return capitalizeSkill(skillName);
        }
    }

    return null;
}

function stripHtml(text) {
    const div = document.createElement("div");
    div.innerHTML = text;
    return div.textContent || div.innerText || "";
}

function capitalizeSkill(skill) {
    return skill
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectActionOverride(cleanText) {
    for (const override of actionOverrides) {
        for (const word of override.words) {
            const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");

            if (regex.test(cleanText)) {
                return override.skill;
            }
        }
    }

    return null;
}