import { ButtonBase } from "@material-ui/core";
import { Undo } from "@material-ui/icons";
import { createUseStyles } from "react-jss";
import { DELETE, SUBMIT } from "./constants";

const LAYOUT = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
    [SUBMIT, DELETE],
];

const useKeyboardStyles = createUseStyles({
    root: {
        textAlign: "center",
        "& .MuiButtonBase-root": {
            height: "3.5rem",
            width: "2.75rem",
            borderRadius: "0.25rem",
            backgroundColor: "#e0e0e0",
            fontSize: "1.25rem",
            margin: "0.1rem",
            fontWeight: "bold",
            textTransform: "capitalize",
            maxWidth: "9vw",
        },
        "& .not-included": {
            backgroundColor: "#777777",
            color: "white",
        },
        "& .mispositioned": {
            backgroundColor: "#b79e1f",
            color: "white",
        },
        "& .success": {
            backgroundColor: "#359e3c",
            color: "white",
        },
        "& .submit": {
            width: "unset",
            padding: "0 3rem",
            marginTop: "1rem",
            marginRight: "2rem",
            backgroundColor: "#5a68ce",
            color: "white",
            "&:disabled": {
                backgroundColor: "#e0e0e0",
                opacity: 0.75,
                color: "#333333",
            },
        },
        "& .delete": {
            width: "unset",
            padding: "0 1rem",
            marginTop: "1rem",
        },
    },
    row: {
        display: "flex",
        justifyContent: "center",
        margin: "0 1rem",
    },
});

const Keyboard = ({ onClickButton, currentWord = "", submissions = [], enableSubmit }) => {
    const classes = useKeyboardStyles();

    const currentWordMap = currentWord.split("").reduce((a, l, i) => {
        if (!a[l]) {
            a[l] = [i];
        } else {
            a[l].push(i);
        }

        return a;
    }, {});

    // { [letter: string]: indices (number[]) }
    const submissionsMap = submissions.reduce((a, row) => {
        row.forEach((l, i) => {
            if (!l) {
                return;
            }

            if (!a[l]) {
                a[l] = [i];
            } else {
                a[l].push(i);
            }
        });

        return a;
    }, {});

    const getSelector = (key: string): string => {
        if (key === SUBMIT) {
            return "submit";
        }

        if (key === DELETE) {
            return "delete";
        }

        if (submissionsMap[key]) {
            if (submissionsMap[key].some((l) => currentWordMap[key]?.includes(l))) {
                return "success";
            }

            if (currentWordMap[key]) {
                return "mispositioned";
            }

            return "not-included";
        }
    };

    const isDisabled = (key) => {
        return key === SUBMIT && !enableSubmit;
    };

    return (
        <div className={classes.root}>
            {LAYOUT.map((keys, i) => (
                <div key={i} className={classes.row}>
                    {keys.map((key) => (
                        <ButtonBase onClick={() => onClickButton(key)} className={getSelector(key)} key={key} disabled={isDisabled(key)}>
                            {key === DELETE ? <Undo /> : key}
                        </ButtonBase>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Keyboard;
