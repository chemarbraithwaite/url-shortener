import { useState } from "react";
import { useAsyncFn } from "react-use";
import { shortenUrl } from "../../helpers";
import { toast } from "react-toastify";
import { isValidUrl } from "../../utils";
import classes from "./Landing.module.scss";
import { Button, Card, TextField, Typography } from "@mui/material";
import { AutoFixHigh, ContentCopy, Launch, Link } from "@mui/icons-material";
import { QRCode } from "../../components/QRCode";
import { Logo } from "../../components/Logo/";

export const LandingPage = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [{ loading }, submitUrl] = useAsyncFn(async (url: string) => {
    try {
      const response = await shortenUrl(url);
      setShortUrl(`${window.origin}/${response}`);
      toast.dismiss();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message ?? "Error shortening url");
    }
  });
  const isUrlValid = url.trim().length > 0 ? isValidUrl(url) : true;

  const handleCopyUrl = async () => {
    await navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((error) => {
        console.log(error);
        toast.dismiss();
        toast.error(
          "Encountered an error trying to copy link to the clipboard"
        );
      });
  };

  const handleOnSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    await submitUrl(url);
  };

  return (
    <div className={classes.Landing}>
      <Card variant="outlined" className={classes.card}>
        <Typography className={classes.label}>
          <Link /> {shortUrl ? "Your long URL" : "Shorten a long URL"}
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          data-cy="url_input"
          placeholder="Enter long link here"
          className={classes.urlInput}
          disabled={loading || Boolean(shortUrl)}
          error={!isUrlValid}
          helperText={!isUrlValid && "Please enter a valid URL"}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {shortUrl ? (
          <>
            <Typography>
              <AutoFixHigh /> Short URL
            </Typography>
            <TextField
              data-cy="shortened_url_input"
              disabled={true}
              type="text"
              size="small"
              value={shortUrl}
            ></TextField>
            <div className={classes.urlActionWrapper}>
              <a target="_blank" href={shortUrl}>
                <Button className={classes.urlAction}>
                  <Launch />
                </Button>
              </a>

              <Button
                data-cy="copy_url"
                onClick={handleCopyUrl}
                className={classes.urlAction}
              >
                <ContentCopy /> Copy
              </Button>
            </div>

            <QRCode text={shortUrl} />

            <Button
              onClick={() => {
                setUrl("");
                setShortUrl("");
              }}
              className={classes.shortenAnother}
            >
              Shorten another Url
            </Button>
          </>
        ) : (
          <Button
            data-cy="submit_url"
            disabled={loading || url.trim().length === 0 || !isUrlValid}
            onClick={handleOnSubmit}
            className={classes.submitUrl}
          >
            {loading && (
              <>
                <div /> Shrinking url... <Logo className={classes.loading} />
              </>
            )}
            {!loading && (
              <>
                Shorten Url <Logo />
              </>
            )}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default LandingPage;
