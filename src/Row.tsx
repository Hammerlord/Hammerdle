import classNames from "classnames";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        display: "flex",
        justifyContent: "center",
    },
    answerBox: {
        width: "4rem",
        height: "4rem",
        margin: "0.25rem",
        display: "inline-block",
        verticalAlign: "bottom",
        textAlign: "center",
        color: "white",
        maxHeight: "15vw",
        maxWidth: "15vw",
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
        borderRadius: "0.25rem",
        border: "2px solid transparent",
    },
    unfilled: {
        border: "2px solid #CCC",
    },
    filled: {
        border: "2px solid #777",
        color: "#777",
    },
    notIncluded: {
        background: "#777",
    },
    mispositioned: {
        backgroundColor: "#b79e1f",
    },
    success: {
        backgroundColor: "#359e3c",
    },
});

const Row = ({ row, currentWord = "", isRowSubmitted }) => {
    const classes = useStyles();

    const countMap = currentWord.split("").reduce((a, c) => {
        a[c] = (a[c] || 0) + 1;
        return a;
    }, {});

    const selectors = [];

    row.forEach((letter: string, i) => {
        if (!letter) {
            selectors.push(classes.unfilled);
            return;
        }

        if (!isRowSubmitted) {
            selectors.push(classes.filled);
            return;
        }

        if (currentWord.charAt(i) === letter) {
            --countMap[letter];
            selectors.push(classes.success);
            return;
        }

        selectors.push(null);
    });

    // yellows after all greens are in place
    row.forEach((letter: string, i) => {
        if (!selectors[i]) {
            if (countMap[letter] > 0) {
                --countMap[letter];
                selectors[i] = classes.mispositioned;
            } else {
                selectors[i] = classes.notIncluded;
            }
        }
    });

    return (
        <div className={classes.root}>
            {row.map((letter: string, i: number) => (
                <div className={classes.answerBox} key={i}>
                    <div className={classNames(classes.answer, selectors[i])}>{letter}</div>
                </div>
            ))}
        </div>
    );
};

export default Row;
