import { ButtonBase } from "@material-ui/core";
import { createUseStyles } from "react-jss";

const LAYOUT = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
];

const useStyles = createUseStyles({
    root: {
        textAlign: "center",
        "& .MuiButtonBase-root": {
            height: "3.5rem",
            width: "3rem",
            borderRadius: "0.25rem",
            backgroundColor: "#EEE",
            fontSize: "1.25rem",
            margin: "0.1rem",
            fontWeight: "bold",
            textTransform: "capitalize",
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
    },
});

const Keyboard = ({ onLetterPress, currentWord = "", submissions = [] }) => {
    const classes = useStyles();

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

    return (
        <div className={classes.root}>
            {LAYOUT.map((keys, i) => (
                <div key={i}>
                    {keys.map((key) => (
                        <ButtonBase onClick={() => onLetterPress(key)} className={getSelector(key)} key={key}>
                            {key}
                        </ButtonBase>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Keyboard;
