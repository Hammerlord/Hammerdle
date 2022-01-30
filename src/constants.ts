export const SUBMIT = "submit";
export const DELETE = "delete";
export const SETTINGS = "settings";
export const STATISTICS = "statistics";
export const GUESSES = 6;
export const ROW_SIZE = 5;

export const DEFAULT_SETTINGS = {
    isMapleStoryDictionEnabled: true,
    isHardMode: false,
};

export interface StatisticsT {
    winStreak: number;
    scores: { [attempts: string]: number }; // Eg. { 1: 6 }
    totalGames: number;
}

export const DEFAULT_STATISTICS: StatisticsT = {
    winStreak: 0,
    totalGames: 0,
    scores: Array.from({ length: GUESSES }).reduce((acc, _, i) => {
        acc[i + 1] = 0;
        return acc;
    }, {}) as { [attempts: string]: number },
};
