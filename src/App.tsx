import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
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
                    <Row currentWord={currentWord} row={row} isRowSubmitted={i < rowIndexToSubmit} key={i} />
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
