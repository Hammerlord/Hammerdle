import { Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import { createUseStyles } from "react-jss";
import Button from "./Button";
import { GUESSES } from "./constants";
import Row from "./Row";

const useStyles = createUseStyles({
    section: {
        marginBottom: "1.75rem",
    },
    example: {
        margin: "1rem 0",
    },
});

const HelpDialog = ({ onClose, open, ...other }) => {
    const classes = useStyles();
    return (
        <Dialog open={open} onClose={onClose} {...other}>
            <DialogTitle>How to play</DialogTitle>
            <DialogContent>
                <div className={classes.section}>
                    <p>Guess the word in {GUESSES} tries!</p>
                    <p>Each guess must be a valid 5-letter word. Press "SUBMIT" to enter a guess.</p>
                    <p>On submission, tiles will change colours to show how close the guess was to the word.</p>
                </div>
                <hr />
                <div className={classes.section}>
                    <div className={classes.example}>
                        <Row row={["i", "l", "b", "i", "s"]} isRowSubmitted={true} currentWord={"lolly"} />
                    </div>
                    <p>"L" is in the word, but not in the right place.</p>
                </div>
                <div className={classes.section}>
                    <div className={classes.example}>
                        <Row row={["i", "l", "b", "i", "s"]} isRowSubmitted={true} currentWord={"ropes"} />
                    </div>
                    <p>"S" is in the right place.</p>
                </div>
                <div className={classes.section}>
                    <div className={classes.example}>
                        <Row row={["i", "l", "b", "i", "s"]} isRowSubmitted={true} currentWord={"oozey"} />
                    </div>
                    <p>Letters with a grey background aren't in the word at all.</p>
                </div>
                <hr />
                <p>
                    If you don't want to guess strange words like "ilbis", please ensure "MapleStory diction" is turned off in the settings.
                </p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default HelpDialog;
