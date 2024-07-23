import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import UserList from "./UserList";
import {
  Button,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useToast } from "../../../../context/ToastContext";
import axios from "axios";
import { useSelector } from "react-redux";

const PRIORITY = ["HIGH", "MEDIUM", "LOW"];

const AddTask = ({ fetchTasks, open, setOpen }) => {
  const { toast } = useToast();
  const user = useSelector((state) => state.user);
  const [team, setTeam] = useState("");
  const [requestArr, setRequestArr] = useState([]);
  const [projectArr, setProjectArr] = useState([]);
  const [priority, setPriority] = useState(PRIORITY[1]);
  const [uploading, setUploading] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [selectedRequest, setSelectedRequest] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskFor, setTaskFor] = useState("request");

  const handleCancel = () => {
    setOpen(false);
    setTitle("");
    setSelectedRequest("");
    setDescription("");
    setPriority(PRIORITY[2]);
    setDeadline("");
    setTeam("");
    setRequestType("");
    setTaskFor("request");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("target", selectedRequest);
    formData.append("targetModel", taskFor);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("deadline", deadline);
    formData.append("developer", team);

    try {
      const response = await axios.post("/api/v1/task/create", formData, {
        headers: {
          Authorization: `${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success("Task created successfully");
        fetchTasks();
        setOpen(false);
      } else {
        toast.error("Task creation failed");
        console.log(response.data.message);
      }
    } catch (error) {
      toast.error("Some error occurred");
    } finally {
      setUploading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/api/v1/request/manager-staff-requests", {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      if (response.data.success) {
        setRequestArr(response.data.requests);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/v1/project/all", {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      if (response.data.success) {
        setProjectArr(response.data.projects);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchProjects();
  }, []);

  const filteredRequests = requestArr.filter(
    (request) => request.requestType === requestType
  );

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <div style={{ maxWidth: "100%", margin: "auto" }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle className="text-base font-bold leading-6 text-gray-900 mb-4">
            ADD TASK
          </DialogTitle>
          <div className="mt-2 flex flex-col gap-6">
            <div className="flex">
              <p className="text-gray-700 pr-4 flex justify-center items-center">Add Task for:</p>
              <ToggleButtonGroup
                value={taskFor}
                exclusive
                onChange={(event, newTaskFor) => setTaskFor(newTaskFor)}
                aria-label="task for"
              >
                <ToggleButton value="request" aria-label="request">
                  Request
                </ToggleButton>
                <ToggleButton value="project" aria-label="project">
                  Project
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
            {taskFor === "request" && (
              <>
                <FormControl component="fieldset">
                  <p className="text-gray-700">Request Type:</p>
                  <RadioGroup
                    row
                    aria-label="request-type"
                    name="request-type"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                  >
                    <FormControlLabel
                      value="change"
                      control={<Radio />}
                      label="Change"
                      sx={{ marginRight: "5rem" }}
                    />
                    <FormControlLabel
                      value="ticket"
                      control={<Radio />}
                      label="Ticket"
                      sx={{ marginRight: "5rem" }}
                    />
                  </RadioGroup>
                </FormControl>
                <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                  <InputLabel>Select Request</InputLabel>
                  <Select
                    value={selectedRequest}
                    onChange={(e) => setSelectedRequest(e.target.value)}
                    label="Select Request"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                          overflow: "auto",
                        },
                      },
                    }}
                  >
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <MenuItem key={request._id} value={request._id}>
                          {request.title}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        Select request type first or No request is available
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </>
            )}
            {taskFor === "project" && (
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <InputLabel>Select Project</InputLabel>
                <Select
                  value={selectedRequest}
                  onChange={(e) => setSelectedRequest(e.target.value)}
                  label="Select Project"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        overflow: "auto",
                      },
                    },
                  }}
                >
                  {projectArr.length > 0 ? (
                    projectArr.map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.project_name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No project is available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
            <TextField
              fullWidth
              variant="outlined"
              label="Task Title"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Task Description"
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
            />
            <UserList setTeam={setTeam} team={team} />
            <div className="flex flex-col gap-4 sm:flex-row">
              <TextField
                fullWidth
                variant="outlined"
                label="Task Deadline"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <FormControl fullWidth variant="outlined">
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  label="Priority Level"
                >
                  {PRIORITY.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <div
            className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4"
            style={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {uploading ? (
              <CircularProgress />
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="sm:w-auto"
              >
                Submit
              </Button>
            )}
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              className="sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default AddTask;
