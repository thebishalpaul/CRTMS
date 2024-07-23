import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useToast } from "../../../context/ToastContext";

const useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content",
    padding: theme.spacing(2),
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  selectField: {
    width: "100%",
  },
}));

const { Dragger } = Upload;

const RequestForm = ({ open, setOpen, fetchRequests, handleAlignment }) => {
  const user = useSelector((state) => state.user);
  const classes = useStyles();
  const { toast } = useToast();
  const [changeRequest, setChangeRequest] = useState({
    title: "",
    description: "",
    attachments: [],
    projectId: "",
    request_type: "",
  });
  // console.log(changeRequest);
  const [loading, setLoading] = useState(false);

  const [projectArr, setProjectArr] = useState([]);

  const handleClose = () => {
    setChangeRequest({
      title: "",
      description: "",
      attachments: [],
      projectId: "",
      request_type: "",
    });
    setOpen(false);
  };
  // console.log(changeRequest.attachments);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !changeRequest.title ||
      !changeRequest.description ||
      !changeRequest.projectId ||
      !changeRequest.request_type
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", changeRequest.title);
    formData.append("description", changeRequest.description);
    formData.append("projectId", changeRequest.projectId);
    formData.append("request_type", changeRequest.request_type);

    changeRequest.attachments.forEach((file) => {
      formData.append("attachments", file.originFileObj);
    });

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/v1/request/create-request`,
        formData,
        {
          headers: {
            Authorization: `${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      if (response.data.success) {
        toast.success(
          response.data.message || "Change Request Added Successfully"
        );
        fetchRequests();
        handleAlignment("", "All");
        handleClose();
      } else {
        toast.error(response.data.message || "Internal Error");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Internal Error");
    }
    setLoading(false);
  };

  useEffect(() => {
    const getProjects = async () => {
      console.log(user);
      try {
        const response = await axios.get(
          `/api/v1/project/by-department/${user.department}`,
          {
            headers: {
              Authorization: `${user.token}`,
            },
          }
        );
        if (response.data.success) {
          console.log(response.data?.projects);
          setProjectArr(response.data?.projects);
        } else {
          console.log(response.data.message || "Internal Error");
        }
      } catch (error) {
        console.log(error);
      }
    };
    getProjects();
  }, [user.department, user.token, open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Create New Request</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please fill in the information below to create a new request.
        </DialogContentText>
        <form className={classes.form} onSubmit={handleSubmit}>
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="project-select-label">Select Project</InputLabel>
            <Select
              labelId="project-select-label"
              id="project-select"
              className={classes.selectField}
              value={changeRequest.projectId}
              onChange={(e) =>
                setChangeRequest({
                  ...changeRequest,
                  projectId: e.target.value,
                })
              }
              label="Select Project"
              fullWidth
              required
            >
              {projectArr.length > 0 ? (
                projectArr?.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.project_name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  Projects not found
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="request-type-select-label">Request Type</InputLabel>
            <Select
              labelId="request-type-select-label"
              id="request-type-select"
              className={classes.selectField}
              value={changeRequest.request_type || ""}
              onChange={(e) =>
                setChangeRequest({
                  ...changeRequest,
                  request_type: e.target.value,
                })
              }
              label="Request Type"
              fullWidth
              required
            >
              <MenuItem value="ticket">Ticket</MenuItem>
              <MenuItem value="change">Change</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={changeRequest.title}
            onChange={(e) =>
              setChangeRequest({
                ...changeRequest,
                title: e.target.value,
              })
            }
            required
          />
          <TextField
            className={classes.textField}
            margin="dense"
            id="description"
            label="Description"
            type="text"
            value={changeRequest.description}
            onChange={(e) =>
              setChangeRequest({
                ...changeRequest,
                description: e.target.value,
              })
            }
            fullWidth
            required
          />
          <Dragger
            fileList={changeRequest.attachments}
            onChange={(info) =>
              setChangeRequest({ ...changeRequest, attachments: info.fileList })
            }
            className="drag-container"
            multiple={true}
            beforeUpload={() => false}
            showUploadList={{ showRemoveIcon: true, showDownloadIcon: false }}
            accept="application/pdf"
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text">
              Click or drag pdf files to this area to upload
            </p>
          </Dragger>
          <DialogActions>
            <Button
              style={{ color: "green" }}
              type="submit"
              startIcon={<CheckIcon />}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Confirm"}
            </Button>
            <Button
              onClick={handleClose}
              color="secondary"
              startIcon={<ClearIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestForm;
