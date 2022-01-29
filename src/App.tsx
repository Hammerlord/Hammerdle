import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { DELETE, SUBMIT } from "./constants";
import Keyboard from "./Keyboard";
import Row from "./Row";
import dictionaryWords from "../resources/5letterwords.json";
import mapleStoryLib from "../resources/words.json";
import commonWords from "../resources/commonwords.json";
import { Settings } from "@material-ui/icons";
import Button from "./Button";

const useStyles = createUseStyles({
    app: {
        fontFamily: "Barlow, Arial",
        userSelect: "none",
        height: "100%",
        width: "100%",
        letterSpacing: "0.05rem",
        "& button": {
            fontFamily: "Barlow, Arial",
            cursor: "pointer",
            letterSpacing: "0.05rem",
        },
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        margin: "0 2rem",
        maxWidth: "100vw",
    },
    headerRight: {
        display: "flex",
        justifyContent: "space-between",
    },
    gridContainer: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
    },
    keyboardContainer: {
        marginTop: "1.5rem",
    },
    toolContainer: {
        height: "5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
});

const GUESSES = 6;
const ROW_SIZE = 5;

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
    const [rowIndexToSubmit, setRowIndexToSubmit] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [dictionary, setDictionary] = useState(baseDictionary);

    const [notice, setNotice] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [showNewGameDialog, setShowNewGameDialog] = useState(false);
    const [showWinDialog, setShowWinDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [isMapleStoryDictionEnabled, setEnableMapleStoryDiction] = useState(false);

    const onSubmit = () => {
        if (gameEnded) {
            return;
        }

        const isIncompleteAnswer = rows[rowIndexToSubmit].some((answer) => !answer);
        if (isIncompleteAnswer) {
            return;
        }

        const currentAnswer = rows[rowIndexToSubmit].join("");
        if (!dictionary[currentAnswer]) {
            setNotice(`Word not found in the dictionary: ${currentAnswer?.toUpperCase()}`);
            return;
        }

        const incremented = rowIndexToSubmit + 1;
        if (incremented < GUESSES) {
            setRowIndexToSubmit(incremented);
        }

        if (currentAnswer === correctAnswer) {
            setGameEnded(true);
            setShowWinDialog(true);
        } else if (incremented === GUESSES) {
            // Game over
            setNotice(`Game ended! The correct answer was: ${correctAnswer.toUpperCase()}`);
            setGameEnded(true);
        }
    };

    const onDelete = () => {
        const row = rows[rowIndexToSubmit];

        let index = row.length - 1;
        for (let i = index; i >= 0; --i) {
            if (!row[index]) {
                index = i;
            }
        }

        if (index >= 0) {
            const newRows = [...rows];
            newRows[rowIndexToSubmit] = [...newRows[rowIndexToSubmit]];
            newRows[rowIndexToSubmit][index] = null;
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

        const row = rows[rowIndexToSubmit];

        const index = row.findIndex((answer) => {
            return !answer;
        });
        const isValidEntry = key.length === 1 && key.match(/([a-zA-Z]+)/gi) && index > -1 && index < row.length;

        if (isValidEntry) {
            const newRows = [...rows];
            newRows[rowIndexToSubmit] = [...newRows[rowIndexToSubmit]];
            newRows[rowIndexToSubmit][index] = key.toLowerCase();
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
    }, [rows, rowIndexToSubmit, onSubmit, onKey, onDelete]);

    useEffect(() => {
        restartGame();
    }, []);

    const getCommonDiction = () => {
        return mapleStoryLib.words
            .concat(commonWords.words)
            .filter((word) => baseDictionary[word])
            .reduce((acc, word) => {
                acc[word] = true;
                return acc;
            }, {});
    };

    const restartGame = () => {
        let words;

        if (!isMapleStoryDictionEnabled) {
            words = getCommonDiction();
            setDictionary(baseDictionary);
        } else {
            words = mapleStoryLib.words;
            setDictionary({ ...baseDictionary, ...mapleDictionary });
        }

        setGameEnded(false);
        setRows(STARTING_GRID);
        setCorrectAnswer(getRandomItem(words));
        setRowIndexToSubmit(0);
    };

    const giveUp = () => {
        if (!gameEnded) {
            setNotice(`The word was: ${correctAnswer.toUpperCase()}`);
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
                    <h1>Hammerdle</h1>
                    <div className={classes.headerRight}>
                        <div className={classes.toolContainer}>
                            <Button color={gameEnded ? "primary" : undefined} onClick={onClickNewWord}>
                                New word
                            </Button>
                        </div>
                        <div className={classes.toolContainer}>
                            <Button color={null} onClick={() => setShowSettingsDialog(!showSettingsDialog)}>
                                <Settings />
                            </Button>
                        </div>
                    </div>
                </div>
                {rows.map((row: string[], i) => (
                    <Row currentWord={correctAnswer} row={row} isRowSubmitted={gameEnded || i < rowIndexToSubmit} key={i} />
                ))}

                <div className={classes.keyboardContainer}>
                    <Keyboard
                        onClickButton={onKey}
                        submissions={gameEnded ? rows : rows.slice(0, rowIndexToSubmit)}
                        enableSubmit={!gameEnded && rows[rowIndexToSubmit].every((answer) => answer)}
                        currentWord={correctAnswer}
                    />
                </div>
            </div>
            {showNewGameDialog && (
                <Dialog open={true} onClose={() => setShowNewGameDialog(false)} disablePortal={true}>
                    <DialogTitle>Reset game</DialogTitle>
                    <DialogContent>There is a game in progress. Restart with a new word?</DialogContent>
                    <DialogActions>
                        <Button
                            color={"primary"}
                            onClick={() => {
                                restartGame();
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
                    <DialogContent>Yay!</DialogContent>
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
                <Dialog open={true} onClose={() => setShowSettingsDialog(false)} disablePortal={true}>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogContent>
                        <div>
                            <Checkbox
                                onClick={() => setEnableMapleStoryDiction(!isMapleStoryDictionEnabled)}
                                checked={isMapleStoryDictionEnabled}
                            />
                            Enable MapleStory diction
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                restartGame();
                                setShowSettingsDialog(false);
                            }}
                        >
                            Restart game
                        </Button>

                        <Button onClick={() => setShowSettingsDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
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
