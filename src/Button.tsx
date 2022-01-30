import { ButtonBase } from "@material-ui/core";
import classNames from "classnames";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        "&.MuiButtonBase-root": {
            borderRadius: "0.25rem",
            fontSize: "1.2rem",
            margin: "0.1rem",
            fontWeight: "bold",
            textTransform: "capitalize",
            padding: "0.5rem 1rem",
            "&.primary": {
                backgroundColor: "#5a68ce",
                color: "white",
            },
            "&.secondary": {
                backgroundColor: "#e0e0e0",
            },
        },
    },
});

const Button = ({ color = "secondary", children, className = "", ...other }) => {
    const classes = useStyles();
    return (
        <ButtonBase
            className={classNames(classes.root, className, {
                primary: color === "primary",
                secondary: color === "secondary",
            })}
            {...other}
        >
            {children}
        </ButtonBase>
    );
};

export default Button;
