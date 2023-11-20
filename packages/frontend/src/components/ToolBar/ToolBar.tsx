import { Typography } from "@mui/material";
import classes from "./ToolBar.module.scss";
import { classnames } from "../../utils";

const ToolBar = ({ ...props }) => {
  return (
    <nav {...props} className={classnames(classes.ToolBar, props.className)}>
      <img className="" src="/logo.svg" alt="logo" />
      <Typography> SnipLink</Typography>
    </nav>
  );
};

export default ToolBar;
