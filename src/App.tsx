import { Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from "@material-ui/core";
import { BarChart, Help, Settings } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import dictionaryWords from "../resources/5letterwords.json";
import commonWords from "../resources/commonwords.json";
import mapleStoryLib from "../resources/words.json";
import Button from "./Button";
import { DEFAULT_SETTINGS, DELETE, GUESSES, ROW_SIZE, SUBMIT } from "./constants";
import HelpDialog from "./HelpDialog";
import Keyboard from "./Keyboard";
import Row from "./Row";
import SettingsDialog, { GameSettings } from "./SettingsDialog";
import Statistics from "./Statistics";
import { clearStatistics, getHints, loadSettings, saveLoss, saveNewScore, saveSettings } from "./utils";

const useStyles = createUseStyles({
    "@media (max-width: 1024px)": {
        h1: {
            fontSize: "1.5rem",
        },
    },
    app: {
        fontFamily: "Barlow, Arial",
        userSelect: "none",
        height: "100%",
        width: "100%",
        letterSpacing: "0.02rem",
        "& button": {
            fontFamily: "Barlow, Arial",
            cursor: "pointer",
            letterSpacing: "0.03rem",
        },
        "& h1": {
            margin: "0",
            "@media (max-width: 800px)": {
                fontSize: "1.5rem",
            },
        },
        "& p": {
            marginTop: 0,
        },
        "& hr": {
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            borderColor: "#cccccc",
        },
        "& .MuiDialog-paper": {
            margin: "16px",
        },
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        marginLeft: "0.5rem",
        maxWidth: "100%",
    },
    headerRight: {
        display: "flex",
        justifyContent: "space-between",
    },
    gridContainer: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "100%",
    },
    keyboardContainer: {
        marginTop: "1rem",
        "@media (max-width: 800px)": {
            marginTop: "0.5rem",
        },
    },
    toolContainer: {
        height: "5rem",
        maxHeight: "7vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    newWordButton: {
        fontSize: "1rem !important",
        whiteSpace: "nowrap",
    },
    winAttempts: {
        marginBottom: "0.5rem",
    },
    iconButton: {
        "&.MuiButtonBase-root": {
            padding: "0.25rem",
        },
    },
});

const STARTING_GRID = Array.from({ length: GUESSES }).map(() => Array.from({ length: ROW_SIZE }).map(() => null));

const baseDictionary = dictionaryWords.words.reduce((acc, word) => {
    acc[word] = true;
    return acc;
}, {});

const mapleDictionary = mapleStoryLib.words.reduce((acc, word) => {
    acc[word] = true;
    return acc;
}, {});

export const getRandomItem = (array: any[]): any => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};

export const App = () => {
    const classes = useStyles();
    const [rows, setRows] = useState(STARTING_GRID);
    const [numGuesses, setNumGuesses] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [dictionary, setDictionary] = useState(baseDictionary);
    const [notice, setNotice] = useState(null);
    const [showNewGameDialog, setShowNewGameDialog] = useState(false);
    const [showWinDialog, setShowWinDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showStatisticsDialog, setShowStatisticsDialog] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    const { isHardMode, isMapleStoryDictionEnabled } = settings;
    const [gameEnded, setGameEnded] = useState(false);

    const getInvalidAnswerError = (): string | undefined => {
        const currentAnswer = rows[numGuesses].join("");
        if (!dictionary[currentAnswer]) {
            return `Word not found in the dictionary: ${currentAnswer?.toUpperCase()}`;
        }

        if (!isHardMode) {
            return;
        }

        const { successes, mustUse } = getHints({ submissions: rows.slice(0, numGuesses), correctAnswer });
        const misplacedSuccesses = successes.filter((index) => currentAnswer[index] !== correctAnswer[index]);
        if (misplacedSuccesses.length > 0) {
            return `Hardmode: Answer must match hints - ${misplacedSuccesses
                .map((index) => currentAnswer[index].toUpperCase())
                .join(", ")} not matching`;
        }

        rows[numGuesses].forEach((letter) => --mustUse[letter]);
        const mispositionedLetters = Object.keys(mustUse).filter((letter) => mustUse[letter] > 0);
        if (mispositionedLetters.length > 0) {
            return `Hardmode: Answer must match hints - missing ${mispositionedLetters.map((letter) => letter.toUpperCase()).join(", ")}`;
        }
    };

    const onSubmit = () => {
        if (gameEnded) {
            return;
        }

        const isIncompleteAnswer = rows[numGuesses].some((answer) => !answer);
        if (isIncompleteAnswer) {
            return;
        }

        const invalidAnswerError = getInvalidAnswerError();
        if (invalidAnswerError) {
            setNotice(invalidAnswerError);
            return;
        }

        const incremented = numGuesses + 1;
        setNumGuesses(incremented);

        const currentAnswer = rows[numGuesses].join("");
        if (currentAnswer === correctAnswer) {
            saveNewScore(incremented);
            setShowWinDialog(true);
            setGameEnded(true);
        } else if (incremented === GUESSES) {
            // Game over
            saveLoss();
            setNotice(`Game ended! The correct answer was: ${correctAnswer?.toUpperCase()}`);
            setGameEnded(true);
        }
    };

    const onDelete = () => {
        if (gameEnded) {
            return;
        }

        const row = rows[numGuesses];

        let index = row.length - 1;
        for (let i = index; i >= 0; --i) {
            if (!row[index]) {
                index = i;
            }
        }

        if (index >= 0) {
            const newRows = [...rows];
            newRows[numGuesses] = [...newRows[numGuesses]];
            newRows[numGuesses][index] = null;
            setRows(newRows);
            return;
        }
    };

    const onKey = (key: string) => {
        if (gameEnded) {
            return;
        }

        if (key === DELETE) {
            onDelete();
            return;
        }

        if (key === SUBMIT) {
            onSubmit();
            return;
        }

        const row = rows[numGuesses];

        const index = row.findIndex((answer) => {
            return !answer;
        });
        const isValidEntry = key.length === 1 && key.match(/([a-zA-Z]+)/gi) && index > -1 && index < row.length;

        if (isValidEntry) {
            const newRows = [...rows];
            newRows[numGuesses] = [...newRows[numGuesses]];
            newRows[numGuesses][index] = key.toLowerCase();
            setRows(newRows);
        }
    };

    useEffect(() => {
        const onKeyPress = (e) => {
            // Enter
            if (e.keyCode === 13) {
                e.preventDefault();
                onSubmit();
                return;
            }

            // Backspace
            if (e.keyCode === 8) {
                onDelete();
                return;
            }

            onKey(e.key);
        };

        window.addEventListener("keydown", onKeyPress);

        return () => window.removeEventListener("keydown", onKeyPress);
    }, [rows, numGuesses, onSubmit, onKey, onDelete]);

    useEffect(() => {
        restartGame();
    }, [settings]);

    useEffect(() => {
        setSettings(loadSettings());
    }, []);

    const onApplySettings = (settings: GameSettings) => {
        setSettings(settings);
        setShowSettingsDialog(false);
        saveSettings(settings);
        clearStatistics();
    };

    const getCommonDiction = (): object => {
        return mapleStoryLib.words
            .concat(commonWords.words)
            .filter((word) => baseDictionary[word])
            .reduce((acc, word) => {
                acc[word] = true;
                return acc;
            }, {});
    };

    const restartGame = () => {
        let words: string[];

        if (!isMapleStoryDictionEnabled) {
            words = Object.keys(getCommonDiction());
            setDictionary(baseDictionary);
        } else {
            words = mapleStoryLib.words;
            setDictionary({ ...baseDictionary, ...mapleDictionary });
        }

        setRows(STARTING_GRID);
        setCorrectAnswer(getRandomItem(words));
        setNumGuesses(0);
        setGameEnded(false);
    };

    const giveUp = () => {
        if (!gameEnded) {
            setNotice(`The word was: ${correctAnswer.toUpperCase()}`);
            saveLoss();
        }

        restartGame();
    };

    const onClickNewWord = () => {
        if (gameEnded) {
            giveUp();
        } else {
            setShowNewGameDialog(true);
        }
    };

    return (
        <div className={classes.app}>
            <div className={classes.gridContainer}>
                <div className={classes.header}>
                    <div className={classes.toolContainer}>
                        <h1>Hammerdle</h1>
                    </div>
                    <div className={classes.headerRight}>
                        <div className={classes.toolContainer}>
                            <Button color={gameEnded ? "primary" : undefined} className={classes.newWordButton} onClick={onClickNewWord}>
                                New word
                            </Button>
                        </div>
                        <div className={classes.toolContainer}>
                            <Button className={classes.iconButton} color={null} onClick={() => setShowSettingsDialog((prev) => !prev)}>
                                <Settings />
                            </Button>
                        </div>
                        <div className={classes.toolContainer}>
                            <Button className={classes.iconButton} color={null} onClick={() => setShowStatisticsDialog((prev) => !prev)}>
                                <BarChart />
                            </Button>
                        </div>
                        <div className={classes.toolContainer}>
                            <Button className={classes.iconButton} color={null} onClick={() => setShowHelpDialog((prev) => !prev)}>
                                <Help />
                            </Button>
                        </div>
                    </div>
                </div>
                {rows.map((row: string[], i) => (
                    <Row currentWord={correctAnswer} row={row} isRowSubmitted={gameEnded || i < numGuesses} key={i} />
                ))}

                <div className={classes.keyboardContainer}>
                    <Keyboard
                        onClickButton={onKey}
                        submissions={gameEnded ? rows : rows.slice(0, numGuesses)}
                        enableSubmit={!gameEnded && rows[numGuesses] && rows[numGuesses].every((answer) => answer)}
                        currentWord={correctAnswer}
                    />
                </div>
            </div>
            {showNewGameDialog && (
                <Dialog open={true} onClose={() => setShowNewGameDialog(false)} disablePortal={true}>
                    <DialogTitle>Reset game</DialogTitle>
                    <DialogContent>There is a game in progress. Forfeit and restart with a new word?</DialogContent>
                    <DialogActions>
                        <Button
                            color={"primary"}
                            onClick={() => {
                                giveUp();
                                setShowNewGameDialog(false);
                            }}
                        >
                            Restart
                        </Button>
                        <Button onClick={() => setShowNewGameDialog(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            )}
            {showWinDialog && (
                <Dialog open={true} onClose={() => setShowNewGameDialog(false)} disablePortal={true}>
                    <DialogTitle>You solved the puzzle</DialogTitle>
                    <DialogContent>
                        <div className={classes.winAttempts}>
                            Yay! <br /> You took {numGuesses} / {GUESSES} guesses.
                        </div>
                        <Statistics />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color={"primary"}
                            onClick={() => {
                                restartGame();
                                setShowWinDialog(false);
                            }}
                        >
                            New word
                        </Button>
                        <Button onClick={() => setShowWinDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
            {showSettingsDialog && (
                <SettingsDialog settings={settings} onApplySettings={onApplySettings} onClose={() => setShowSettingsDialog(false)} />
            )}
            {showStatisticsDialog && (
                <Dialog open={true} onClose={() => setShowStatisticsDialog(false)} disablePortal={true}>
                    <DialogTitle>Statistics</DialogTitle>
                    <DialogContent>
                        <p>
                            Hard mode: {isHardMode ? "ON" : "OFF"} <br />
                            MapleStory diction: {isMapleStoryDictionEnabled ? "ON" : "OFF"}
                        </p>
                        <Statistics />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowStatisticsDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
            {showHelpDialog && <HelpDialog open={true} onClose={() => setShowHelpDialog(false)} disablePortal={true} />}
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={5000}
                open={Boolean(notice)}
                onClose={() => setNotice(null)}
                message={notice}
            />
        </div>
    );
};
