import { WarningRounded } from "@mui/icons-material";
import classes from "./NotFound.module.scss";
import { Typography } from "@mui/material";
import check from "../../assets/check.svg";
import resend from "../../assets/resend.svg";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export const NotFound = () => {
  const { linkId } = useParams();

  useEffect(() => {
    if (!linkId) return;

    window.history.replaceState(null, "", `/${linkId}`);
  }, [linkId]);

  console.log(linkId);

  return (
    <div className={classes.NotFound}>
      <WarningRounded className={classes.warning} />

      <Typography className={classes.title}>404 Not Found</Typography>
      <Typography>This link does not exist</Typography>

      <div className={classes.help}>
        <div className={classes.actionItem}>
          <img src={check} alt="Check" />
          <div>
            <Typography className={classes.subTitle}>Check the link</Typography>
            <Typography>
              Examine the link for any typographical errors.
            </Typography>
          </div>
        </div>
        <div className={classes.actionItem}>
          <img src={resend} alt="Resend" />
          <div>
            <Typography className={classes.subTitle}>
              Ask for the correct link
            </Typography>
            <Typography>
              Contact the person who sent you this link and request them to send
              the accurate one.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
