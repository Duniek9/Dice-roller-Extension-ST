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
    const lines = cleanText.split(/\n+/);

    // 1. Best case: roll/check and skill are on the same line
    for (const line of lines) {
        const rollWord = findRollWord(line);
        if (!rollWord) continue;

        const skill = findSkill(line);
        if (skill) return capitalizeSkill(skill);
    }

    // 2. Second case: same sentence
    const sentences = cleanText.split(/[.!?]+/);

    for (const sentence of sentences) {
        const rollWord = findRollWord(sentence);
        if (!rollWord) continue;

        const skill = findSkill(sentence);
        if (skill) return capitalizeSkill(skill);
    }

    // 3. Fallback: close word distance in full message
    return detectSkillByDistance(cleanText);
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

function findRollWord(text) {
    const match = text.match(/\b(roll|check|saving throw|save|d20)\b/i);
    return match ? match[0] : null;
}

function findSkill(text) {
    for (const skillName of skills) {
        const regex = new RegExp(`\\b${escapeRegex(skillName)}\\b`, "i");

        if (regex.test(text)) {
            return skillName;
        }
    }

    return null;
}

function detectSkillByDistance(text) {
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    const rollWords = ["roll", "check", "save", "d20"];

    let bestSkill = null;
    let bestDistance = Infinity;

    for (let i = 0; i < words.length; i++) {
        if (!rollWords.includes(words[i])) continue;

        for (const skillName of skills) {
            const skillWords = skillName.split(" ");

            for (let j = 0; j < words.length; j++) {
                const candidate = words.slice(j, j + skillWords.length).join(" ");

                if (candidate !== skillName) continue;

                const distance = Math.abs(i - j);

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestSkill = skillName;
                }
            }
        }
    }

    // Tune this number if needed.
    // 6 means: "roll/check" and the skill must be within ~6 words.
    if (bestDistance <= 6) {
        return capitalizeSkill(bestSkill);
    }

    return null;
}