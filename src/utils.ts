import { DEFAULT_SETTINGS, DEFAULT_STATISTICS, SETTINGS, StatisticsT } from "./constants";
import { GameSettings } from "./SettingsDialog";

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

export const saveNewScore = (score: number) => {
    const { totalGames, scores, winStreak, longestStreak } = loadStatistics();
    saveStatistics({
        totalGames: totalGames + 1,
        scores: {
            ...scores,
            [score]: scores[score] + 1,
        },
        winStreak: winStreak + 1,
        longestStreak: Math.max(winStreak + 1, longestStreak),
    });
};

export const saveLoss = () => {
    const { totalGames, scores, longestStreak } = loadStatistics();
    saveStatistics({
        totalGames: totalGames + 1,
        scores,
        winStreak: 0,
        longestStreak,
    });
};

export const saveStatistics = (statistics: StatisticsT) => {
    Object.entries(statistics).forEach(([key, val]) => {
        window.localStorage.setItem(key, JSON.stringify(val));
    });
};

export const clearStatistics = () => {
    saveStatistics(DEFAULT_STATISTICS);
};

export const loadStatistics = (): StatisticsT => {
    return Object.keys(DEFAULT_STATISTICS).reduce((acc, key) => {
        acc[key] = JSON.parse(window.localStorage.getItem(key)) || DEFAULT_STATISTICS[key];
        return acc;
    }, {}) as StatisticsT;
};
