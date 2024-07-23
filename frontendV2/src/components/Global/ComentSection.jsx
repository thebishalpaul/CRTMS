import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@mui/styles";
import {
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { useToast } from "../../context/ToastContext";
import SendIcon from "@mui/icons-material/Send";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const useStyles = makeStyles((theme) => ({
  "@keyframes popUp": {
    "0%": {
      bottom: "-50px",
    },
    "50%": {
      bottom: "50px",
    },
    "100%": {
      bottom: 0,
    },
  },
  "@keyframes slide": {
    "0%": {
      transform: "translateY(100%)",
      display: "none",
    },
    "100%": {
      transform: "translateY(0)",
      display: "block",
    },
  },
  "@keyframes slideClose": {
    "0%": {
      transform: "translateY(0)",
      display: "block",
    },
    "100%": {
      transform: "translateY(100%)",
      display: "none",
    },
  },
  "@keyframes slideBtn": {
    "0%": {
      bottom: 0,
    },
    "100%": {
      bottom: "400px",
    },
  },
  "@keyframes slideBtnClose": {
    "0%": {
      bottom: "400px",
    },
    "50%": {
      bottom: 0,
    },
    "65%": {
      bottom: "-50px",
    },
    "80%": {
      bottom: "50px",
    },
    "100%": {
      bottom: 0,
    },
  },
  commentSection: {
    position: "absolute",

    width: "100%",
    bottom: "-10px",
    left: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
  },
  paper: {
    padding: "16px",
    position: "absolute",
    bottom: 0,
    width: {
      xs: "90%",
      sm: "90%",
      md: "50%",
      lg: "50%",
      xl: "50%",
    },
    right: "20%",
    height: "400px",
    zIndex: 1100,
    display: "none",
    transform: "translateY(100%)",
    boxShadow:
      "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px !important",
  },
  paperOpen: {
    transform: "translateY(0)",
    display: "block",
    animation: "$slide 1s ease-in-out",
  },
  paperClose: {
    animation: "$slideClose 1s ease-in-out",
    transform: "translateY(100%)",
  },
  button: {
    backgroundColor: "#4e4949 !important",
    color: "#fff !important",
    "&:hover": {
      backgroundColor: "#4e4949 !important",
    },
    position: "fixed",
    bottom: 0,
    minWidth: "200px !important",
    zIndex: 1200,
    transform: "translateX(-30%) !important",
  },
  buttonOpen: {
    bottom: "400px",
    animation: "$slideBtn 1s ease-in-out",
  },
  buttonClose: {
    bottom: 0,
    animation: "$slideBtnClose 2s ease-in-out",
  },
  buttonPopUp: {
    animation: "$popUp 1s ease-in-out",
  },
  formContainer: {
    padding: "16px",
  },
}));

const CommentSection = ({ fetchTimeline, targetId, model, variant }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [commentHeading, setCommentHeading] = useState("");
  const [commentDescription, setCommentDescription] = useState("");
  const [buttonText, setButtonText] = useState("Add Comment");
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const paperRef = useRef(null);

  const handleCommentSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/v1/history/create/`,
        {
          heading: commentHeading,
          description: commentDescription,
          target: targetId,
          targetModel: model,
          variant: variant,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response?.data?.message);
        fetchTimeline();
        handleToggle(false);
        setCommentHeading("");
        setCommentDescription("");
      } else {
        throw new Error(response?.data?.message || "Failed to submit comment");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit comment");
    }
    setLoading(false);
  };

  const handleClickOutside = (event) => {
    if (paperRef.current && !paperRef.current.contains(event.target)) {
      handleToggle(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleToggle = (value) => {
    setFirstLoad(false);
    if (value) setOpen(value);
    else setOpen(!open);

    setTimeout(() => {
      if (open) {
        setButtonText("Add Comment");
      } else {
        setButtonText("Close Comment");
      }
    }, 1200);
  };

  return (
    <div className={classes.commentSection}>
      <Button
        variant="contained"
        color="inherit"
        onClick={handleToggle}
        startIcon={open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        className={`${classes.button} ${
          firstLoad
            ? classes.buttonPopUp
            : open
            ? classes.buttonOpen
            : classes.buttonClose
        }`}
        disabled={open}
      >
        {buttonText}
      </Button>

      <Paper
        elevation={4}
        className={`${classes.paper} ${
          open ? classes.paperOpen : classes.paperClose
        }`}
        ref={paperRef}
      >
        <Box className={classes.formContainer}>
          <Typography variant="h6" gutterBottom>
            Add Comment
          </Typography>
          <TextField
            id="comment-heading"
            label="Heading"
            fullWidth
            variant="outlined"
            margin="normal"
            value={commentHeading}
            onChange={(e) => setCommentHeading(e.target.value)}
          />
          <TextField
            id="comment-description"
            label="Description"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            margin="normal"
            value={commentDescription}
            onChange={(e) => setCommentDescription(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCommentSubmit}
            endIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
            disabled={loading}
          >
            {loading ? "Posting............" : "Post Comment"}
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default CommentSection;
