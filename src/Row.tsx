import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
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
        borderRadius: "0.25rem",
        border: "2px solid transparent",
    },
    unfilled: {
        border: "2px solid #CCC",
    },
    filled: {
        border: "2px solid #888",
        color: "#888",
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

    const getSelector = (letter: string, pos: number) => {
        if (!letter) {
            return classes.unfilled;
        }

        if (isRowSubmitted) {
            if (currentWord.charAt(pos) === letter) {
                return classes.success;
            }

            if (currentWord.split("").some((n) => n === letter)) {
                // TODO and is not a duplicate of an earlier letter
                return classes.mispositioned;
            }

            return classes.notIncluded;
        } else {
            return classes.filled;
        }
    };

    return (
        <div>
            {row.map((letter: string, i: number) => (
                <div className={classes.answerBox} key={i}>
                    <div className={classNames(classes.answer, getSelector(letter, i))}>{letter}</div>
                </div>
            ))}
        </div>
    );
};

export default Row;
