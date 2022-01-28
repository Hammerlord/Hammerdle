import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";

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
    answerBox: {
        width: "4rem",
        height: "4rem",
        margin: "0.25rem",
        display: "inline-block",
        verticalAlign: "bottom",
        textAlign: "center",
        color: "white",
    },
    answer: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        display: "flex",
        fontSize: "2rem",
        textTransform: "uppercase",
        fontWeight: "bold",
    },
    unfilled: {
        border: "2px solid #BBB",
    },
    filled: {
        background: "#777",
        border: "2px solid transparent",
    },
    mispositioned: {
        backgroundColor: "#b79e1f",
    },
    success: {
        backgroundColor: "#359e3c",
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

    useEffect(() => {
        fetch("./resources/words.txt").then(async (resource) => {
            const text = await resource.text();
            const words = text.split("\n");
            setWords(words);
            setCurrentWord(getRandomItem(words));
        });
    }, []);

    useEffect(() => {
        const onKeyPress = (e) => {
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

            const index = row.findIndex((answer) => {
                return !answer;
            });
            const isValidEntry = e.key.length === 1 && e.key.match(/([a-zA-Z]+)/gi) && index > -1 && index < row.length;

            if (isValidEntry) {
                const newRows = [...rows];
                newRows[rowIndexToSubmit] = [...newRows[rowIndexToSubmit]];
                newRows[rowIndexToSubmit][index] = e.key.toLowerCase();
                setRows(newRows);
            }
        };

        window.addEventListener("keydown", onKeyPress);

        return () => window.removeEventListener("keydown", onKeyPress);
    }, [rows, rowIndexToSubmit]);

    const isIncompleteAnswer = rows[rowIndexToSubmit].some((answer) => !answer);

    const onClickSubmit = () => {
        if (isIncompleteAnswer) {
            return;
        }

        const incremented = rowIndexToSubmit + 1;
        if (incremented < GUESSES) {
            setRowIndexToSubmit(incremented);
        }
    };

    return (
        <div className={classes.app}>
            <div className={classes.gridContainer}>
                {rows.map((row: string[], i) => (
                    <div key={i}>
                        {row.map((answer: string, i: number) => (
                            <div className={classes.answerBox} key={i}>
                                <div
                                    className={classNames(classes.answer, {
                                        [classes.mispositioned]: currentWord?.split("").some((n) => n === answer),
                                        [classes.success]: currentWord?.charAt(i) === answer,
                                        [classes.filled]: answer,
                                        [classes.unfilled]: !answer,
                                    })}
                                >
                                    {answer}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                <div className={classes.submitButtonContainer}>
                    <Button variant={"contained"} color={"primary"} disabled={isIncompleteAnswer} onClick={onClickSubmit}>
                        Submit Answer
                    </Button>
                </div>
            </div>
        </div>
    );
};
