import { Button } from "@material-ui/core";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import Keyboard from "./Keyboard";
import Row from "./Row";

const useStyles = createUseStyles({
    app: {
        fontFamily: "Barlow, Arial",
        userSelect: "none",
        height: "100%",
        width: "100%",
        "& button": {
            fontFamily: "Barlow, Arial",
            cursor: "pointer",
            "&:active": {
                transform: "translateX(1px) translateY(1px)",
                transition: "transform 0.2s",
            },
        },
    },
    button: {
        padding: "8px 32px",
        fontFamily: "Barlow, Arial",
        fontSize: "1.1rem",
        fontWeight: 500,
        border: 0,
    },
    gridContainer: {
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%) translateY(-10%)",
    },
    submitButtonContainer: {
        textAlign: "center",
        marginTop: "2rem",
    },
    keyboardContainer: {
        marginTop: "2rem",
    },
});

const GUESSES = 6;
const ROW_SIZE = 5;

const start = Array.from({ length: GUESSES }).map(() => Array.from({ length: ROW_SIZE }).map(() => null));

export const getRandomItem = (array: any[]): any => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};

export const App = () => {
    const classes = useStyles();
    const [rows, setRows] = useState(start);
    const [rowIndexToSubmit, setRowIndexToSubmit] = useState(0);
    const [words, setWords] = useState([]);
    const [currentWord, setCurrentWord] = useState("");
    const [dictionary, setDictionary] = useState({});
    const [submissionError, setSubmissionError] = useState("");

    useEffect(() => {
        (async () => {
            const availableWordsResource = await fetch("./resources/words.txt");
            const availableWordsText = await availableWordsResource.text();
            const dictionaryWordsResource = await fetch("./resources/5letterwords.txt");
            const dictionaryWordsText = await dictionaryWordsResource.text();
            const words = availableWordsText.split("\n");
            setWords(words);
            setCurrentWord(getRandomItem(words));
            setDictionary(
                words.concat(dictionaryWordsText.split("\n")).reduce((acc, word) => {
                    acc[word] = true;
                    return acc;
                }, {})
            );
        })();
    }, []);

    const onSubmit = () => {
        if (isIncompleteAnswer) {
            return;
        }

        const currentAnswer = rows[rowIndexToSubmit].join("");
        if (!dictionary[currentAnswer]) {
            setSubmissionError("Submission is not a word");
            return;
        }

        const incremented = rowIndexToSubmit + 1;
        if (incremented < GUESSES) {
            setRowIndexToSubmit(incremented);
        }
    };

    const onKey = (key: string) => {
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
            const row = rows[rowIndexToSubmit];

            // Backspace
            if (e.keyCode === 8) {
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
            }

            onKey(e.key);
        };

        window.addEventListener("keydown", onKeyPress);

        return () => window.removeEventListener("keydown", onKeyPress);
    }, [rows, rowIndexToSubmit, onSubmit, onKey]);

    const isIncompleteAnswer = rows[rowIndexToSubmit].some((answer) => !answer);

    return (
        <div className={classes.app}>
            <div className={classes.gridContainer}>
                {rows.map((row: string[], i) => (
                    <Row currentWord={currentWord} row={row} isRowSubmitted={i < rowIndexToSubmit} key={i} />
                ))}

                <div className={classes.keyboardContainer}>
                    <Keyboard onLetterPress={onKey} submissions={rows.slice(0, rowIndexToSubmit)} currentWord={currentWord} />
                    <div className={classes.submitButtonContainer}>
                        <Button variant={"contained"} color={"primary"} disabled={isIncompleteAnswer} onClick={onSubmit}>
                            Submit Answer
                        </Button>
                        <div>{submissionError}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
