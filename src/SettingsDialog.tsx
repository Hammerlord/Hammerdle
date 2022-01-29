import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import { useState } from "react";
import Button from "./Button";

export interface GameSettings {
    isMapleStoryDictionEnabled: boolean;
    isHardMode: boolean;
}

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

    return (
        <Dialog open={true} onClose={onClose} disablePortal={true}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <div>
                    <label>
                        <Checkbox onClick={onToggleMapleStoryDiction} checked={workingSettings.isMapleStoryDictionEnabled} />
                        Enable MapleStory diction
                    </label>
                </div>
                <div>
                    <label>
                        <Checkbox onClick={onToggleHardMode} checked={workingSettings.isHardMode} />
                        Enable hard mode
                    </label>
                </div>
                <p>*Applying changes will restart the game.</p>
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
