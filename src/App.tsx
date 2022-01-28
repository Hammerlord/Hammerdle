import { ButtonBase, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { DELETE, SUBMIT } from "./constants";
import Keyboard from "./Keyboard";
import Row from "./Row";

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
        "& .MuiButtonBase-root": {
            borderRadius: "0.25rem",
            backgroundColor: "#e0e0e0",
            fontSize: "1.2rem",
            margin: "0.1rem",
            fontWeight: "bold",
            textTransform: "capitalize",
            padding: "0.5rem 1rem",
            "&.active": {
                backgroundColor: "#5a68ce",
                color: "white",
            },
        },
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        margin: "0 2rem",
        maxWidth: "100vw",
    },
    gridContainer: {
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%) translateY(-10%)",
    },
    keyboardContainer: {
        marginTop: "2rem",
    },
    newWordContainer: {
        height: "5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
});

const GUESSES = 6;
const ROW_SIZE = 5;

const STARTING_GRID = Array.from({ length: GUESSES }).map(() => Array.from({ length: ROW_SIZE }).map(() => null));

export const getRandomItem = (array: any[]): any => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};

export const App = () => {
    const classes = useStyles();
    const [rows, setRows] = useState(STARTING_GRID);
    const [rowIndexToSubmit, setRowIndexToSubmit] = useState(0);
    const [words, setWords] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [dictionary, setDictionary] = useState({});
    const [notice, setNotice] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [showNewGameDialog, setShowNewGameDialog] = useState(false);
    const [showWinDialog, setShowWinDialog] = useState(false);

    useEffect(() => {
        (async () => {
            const availableWordsResource = await fetch("./resources/words.txt");
            const availableWordsText = await availableWordsResource.text();
            const dictionaryWordsResource = await fetch("./resources/5letterwords.txt");
            const dictionaryWordsText = await dictionaryWordsResource.text();
            const words = availableWordsText.split("\n");
            setWords(words);
            setCorrectAnswer(getRandomItem(words));
            setDictionary(
                words.concat(dictionaryWordsText.split("\n")).reduce((acc, word) => {
                    acc[word] = true;
                    return acc;
                }, {})
            );
        })();
    }, []);

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

        if (currentAnswer === correctAnswer) {
            setGameEnded(true);
            setShowWinDialog(true);
        }

        const incremented = rowIndexToSubmit + 1;
        if (incremented < GUESSES) {
            setRowIndexToSubmit(incremented);
        } else {
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

    const newWord = () => {
        if (!gameEnded) {
            setNotice(`The word was: ${correctAnswer.toUpperCase()}`);
        } else {
            setGameEnded(false);
        }
        setRows(STARTING_GRID);
        setCorrectAnswer(getRandomItem(words));
        setRowIndexToSubmit(0);
    };

    const onClickNewWord = () => {
        if (gameEnded) {
            newWord();
        } else {
            setShowNewGameDialog(true);
        }
    };

    return (
        <div className={classes.app}>
            <div className={classes.gridContainer}>
                <div className={classes.header}>
                    <h1>Hammerdle</h1>
                    <div className={classes.newWordContainer}>
                        <ButtonBase className={gameEnded ? "active" : undefined} onClick={onClickNewWord}>
                            New word
                        </ButtonBase>
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
                        <ButtonBase
                            className={"active"}
                            onClick={() => {
                                newWord();
                                setShowNewGameDialog(false);
                            }}
                        >
                            Restart
                        </ButtonBase>
                        <ButtonBase onClick={() => setShowNewGameDialog(false)}>Cancel</ButtonBase>
                    </DialogActions>
                </Dialog>
            )}
            {showWinDialog && (
                <Dialog open={true} onClose={() => setShowNewGameDialog(false)} disablePortal={true}>
                    <DialogTitle>You solved the puzzle</DialogTitle>
                    <DialogContent>Yay!</DialogContent>
                    <DialogActions>
                        <ButtonBase
                            className={"active"}
                            onClick={() => {
                                newWord();
                                setShowWinDialog(false);
                            }}
                        >
                            New word
                        </ButtonBase>
                        <ButtonBase onClick={() => setShowWinDialog(false)}>Close</ButtonBase>
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
