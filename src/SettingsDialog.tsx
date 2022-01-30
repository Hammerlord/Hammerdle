import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import Button from "./Button";

export interface GameSettings {
    isMapleStoryDictionEnabled: boolean;
    isHardMode: boolean;
}

const useStyles = createUseStyles({
    option: {
        display: "flex",
        marginBottom: "1.5rem",
    },
    optionTitle: {
        fontWeight: 700,
    },
    checkboxContainer: {
        marginTop: "-8px",
    },
});

const SettingsDialog = ({ settings, onApplySettings, onClose }) => {
    const [workingSettings, setWorkingSettings] = useState(settings);

    const onToggleMapleStoryDiction = () => {
        setWorkingSettings(({ isMapleStoryDictionEnabled, ...other }) => ({
            ...other,
            isMapleStoryDictionEnabled: !isMapleStoryDictionEnabled,
        }));
    };

    const onToggleHardMode = () => {
        setWorkingSettings(({ isHardMode, ...other }) => ({
            ...other,
            isHardMode: !isHardMode,
        }));
    };

    const classes = useStyles();
    return (
        <Dialog open={true} onClose={onClose} disablePortal={true}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <div>
                    <label className={classes.option}>
                        <div className={classes.checkboxContainer}>
                            <Checkbox onClick={onToggleMapleStoryDiction} checked={workingSettings.isMapleStoryDictionEnabled} />
                        </div>
                        <div>
                            <div className={classes.optionTitle}>MapleStory diction</div>
                            Correct answers may include MapleStory terminology.
                        </div>
                    </label>
                </div>
                <div>
                    <label className={classes.option}>
                        <div className={classes.checkboxContainer}>
                            <Checkbox onClick={onToggleHardMode} checked={workingSettings.isHardMode} />
                        </div>
                        <div>
                            <div className={classes.optionTitle}>Hard mode</div>
                            Guesses must use the green and yellow hints that are revealed.
                        </div>
                    </label>
                </div>
                <hr />
                <p>*Applying changes will clear your stats and restart the game.</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onApplySettings(workingSettings)} color={settings !== workingSettings ? "primary" : undefined}>
                    Apply
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingsDialog;
