import { colors, LinearProgress } from "@material-ui/core";
import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { StatisticsT } from "./constants";
import { loadStatistics } from "./utils";

const useStyles = createUseStyles({
    progress: {
        display: "flex",
        width: "100%",
        margin: "8px 0",
    },
    progressBarContainer: {
        width: "100%",
        marginRight: "4px",
        height: "20px",
        "& .MuiLinearProgress-root": {
            height: "20px",
        },
    },
    attempts: {
        fontWeight: 700,
        width: "1rem",
    },
    scoreboard: {
        marginTop: "1rem",
        border: "1px solid #ccc",
        padding: "0.5rem",
        borderRadius: "4px",
    },
    scoreboardTitle: {
        marginBottom: "0.75rem",
        textAlign: "center",
        fontWeight: 700,
    },
});

const Statistics = () => {
    const { winStreak, scores, totalGames } = loadStatistics() as StatisticsT;

    const classes = useStyles();
    const getProgressVal = (times: number): number => {
        const min = 3;
        if (totalGames === 0) {
            return min;
        }
        const max = 90;
        return Math.max(min, Math.min(max, times + min));
    };

    const getColor = (value) => {
        value = Number(value);
        const additionVal = (value - 1) * 10;
        return `rgb(${90 + additionVal}, ${104 + additionVal}, ${206 + additionVal})`;
    };

    return (
        <div>
            <div>Games played: {totalGames}</div>
            <div>Win streak: {winStreak}</div>
            <div className={classes.scoreboard}>
                <div className={classes.scoreboardTitle}>Guesses Scoreboard</div>
                {Object.entries(scores).map(([attempts, times]) => (
                    <div className={classes.progress} key={attempts}>
                        <div className={classes.attempts}>{attempts}</div>
                        <div
                            className={classes.progressBarContainer}
                            style={{ width: `${getProgressVal(times)}%`, backgroundColor: getColor(attempts) }}
                        ></div>{" "}
                        {times}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Statistics;
