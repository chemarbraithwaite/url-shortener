import { useAsyncFn } from "react-use";
import { toDataURL } from "qrcode";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import classes from "./QRCode.module.scss";
import { Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { classnames } from "../../utils";

interface Props {
  text: string;
}

export const QRCode = ({ text }: Props) => {
  const [qrCode, setQRCode] = useState("");

  const [{ loading, error }, generateQRCode] = useAsyncFn(async () => {
    try {
      setQRCode("");
      const dataUrl = await toDataURL(text);
      setQRCode(dataUrl);
    } catch (error) {
      toast.error("Error generating QR code");
      throw new Error();
    }
  }, [text]);

  useEffect(() => {
    generateQRCode();
  }, [text]);

  if (!text) {
    return null;
  }

  return (
    <div className={classnames(classes.QRCode, qrCode && classes.hasCode)}>
      {loading && (
        <Typography className={classes.generatingCode}>
          Generating QR code <div className={classes.loader} />
        </Typography>
      )}

      {error && (
        <div
          className={classes.error}
          onClick={() => {
            generateQRCode();
          }}
        >
          <InfoOutlined />
          <Typography>Error loading QR code</Typography>
          <Typography>Tap to retry</Typography>
        </div>
      )}
      {qrCode && <img alt="QR code" src={qrCode} />}
    </div>
  );
};
