import { GameSettings } from "./SettingsDialog";
import { DEFAULT_SETTINGS, SETTINGS } from "./constants";

export const getHints = ({ submissions, correctAnswer }) => {
    const successes = {}; // {[index: string]: letter}
    const mustUse = {}; // Count map

    submissions.forEach((row) => {
        row.forEach((l, i) => {
            if (correctAnswer[i] === l) {
                successes[i] = l;
            }
        });
    });

    submissions.forEach((row) => {
        const countMap = correctAnswer.split("").reduce((a, c) => {
            a[c] = (a[c] || 0) + 1;
            return a;
        }, {});

        const useMap = {};

        row.forEach((l) => {
            if (countMap[l]) {
                --countMap[l];
                useMap[l] = (useMap[l] || 0) + 1;
                if (!mustUse[l] || useMap[l] > mustUse[l]) {
                    mustUse[l] = useMap[l];
                }
            }
        });
    });

    return {
        successes: Object.keys(successes).map((index) => Number(index)),
        mustUse,
    };
};

export const saveSettings = (settings: GameSettings) => {
    window.localStorage.setItem(SETTINGS, JSON.stringify(settings));
};

export const loadSettings = (): GameSettings => {
    const settingsStr = window.localStorage.getItem(SETTINGS);
    const settings = JSON.parse(settingsStr) || {};
    return {
        ...DEFAULT_SETTINGS,
        ...settings,
    };
};
