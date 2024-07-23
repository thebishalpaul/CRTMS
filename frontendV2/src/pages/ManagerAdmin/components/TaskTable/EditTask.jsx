import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import {
  Button,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useToast } from "../../../../context/ToastContext";
import axios from "axios";
import { useSelector } from "react-redux";
import UserList from "./UserList";
// import { format } from "date-fns";

const PRIORITY = ["HIGH", "MEDIUM", "LOW"];

const EditTask = ({ open, setOpen, task }) => {
  const { toast } = useToast();
  const user = useSelector((state) => state.user);
  const [team, setTeam] = useState("");
  const [priority, setPriority] = useState(PRIORITY[1]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (task) {
      console.log(task);
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority.toUpperCase());
      setDeadline((new Date(task.deadline)));
      setTeam(task.userAssigned._id);
    }
  }, [task]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);

    const formData = {
      title,
      description,
      priority,
      deadline,
      developer: team,
    };

    try {
      const response = await axios.put(
        `/api/v1/task/update/${task._id}`,
        formData,
        {
          headers: {
            Authorization: `${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Task updated successfully");
        setOpen(false);
      } else {
        toast.error("Task update failed");
      }
    } catch (error) {
      toast.error("Some error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <div style={{ maxWidth: "100%", margin: "auto" }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle className="text-base font-bold leading-6 text-gray-900 mb-4">
            EDIT TASK
          </DialogTitle>
          <div className="mt-2 flex flex-col gap-6">
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
              onClick={() => setOpen(false)}
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

export default EditTask;
