import React, { useEffect, useState } from "react";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import BoardView from "./BoardView";
import { Button, CircularProgress } from "@mui/material";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useSelector } from "react-redux";

const Tasks = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const { toast } = useToast();
  const user = useSelector((state) => state.user);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/task/my-tasks", {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      toast.error("Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="py-10">
        <CircularProgress />
      </div>
    );
  }
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold capitalize">Tasks</h2>
      </div>

      <BoardView tasks={tasks} />
    </div>
  );
};

export default function TaskTable() {
  return (
    <div className="flex flex-col min-h-screen py-2">
      <Tasks />
    </div>
  );
}
