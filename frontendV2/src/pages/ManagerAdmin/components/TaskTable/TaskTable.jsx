import React, { useEffect, useState } from "react";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import BoardView from "./BoardView";
import AddTask from "./AddTask";
import { Button, CircularProgress } from "@mui/material";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";


const Tasks = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const { toast } = useToast();
    const user = useSelector((state) => state.user);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/v1/task/all", {
                headers: {
                    Authorization: `${user?.token}`,
                },
            });
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
        const socket = io("http://localhost:8000");

        socket.on("connect", () => {
            console.log("Socket connected");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        socket.on("tasksChange", () => {
            fetchTasks();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return loading ? (
        <div className='py-10'>
            <CircularProgress />
        </div>
    ) : (
        <div className='w-full'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className="text-2xl font-semibold capitalize">
                    Tasks
                </h2>
                <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => setOpen(true)}
                    startIcon={<AddToPhotosIcon />}
                >
                    Create Task
                </Button>
            </div>
            {tasks.length ? (
                <BoardView tasks={tasks} />
            ) : (
                <div className='flex justify-center items-center'>
                    <h1 className='text-2xl font-semibold text-slate-800 dark:text-slate-100'>
                        No Tasks Created
                    </h1>
                </div>
            )}

            <AddTask fetchTasks={fetchTasks} open={open} setOpen={setOpen} />
        </div >
    );
};

export default function TaskTable() {
    return (
        <div className="flex flex-col min-h-screen py-2">
            <Tasks />
        </div>
    );
}
