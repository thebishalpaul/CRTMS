import clsx from "clsx";
import React, { useState, useEffect } from "react";
import { FaTasks } from "react-icons/fa";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import CustomTabs from "./Tabs";
import { PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../../../../utils";
import axios from "axios";
import { useSelector } from "react-redux";
import { Avatar, CircularProgress } from "@mui/material";
import TaskTimeline from "../../TaskTimeline";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TaskDescription = () => {
  const { id } = useParams();
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const user = useSelector((state) => state.user);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/task/${id}`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      if (response.data.success) {
        setTask(response.data.task);
        console.log(response.data.task);
      }
    } catch (error) {
      console.error("Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  return loading ? (
    <div className="py-10">
      <CircularProgress />
    </div>
  ) : (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      <h1 className="text-2xl text-gray-600 font-bold">{task?.title}</h1>
      <CustomTabs tabs={TABS} setSelected={setSelected}>
        <div>
          {/* Task Detail Tab Content */}
          <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto">
            <div className="w-full md:w-1/2 space-y-8">
              <div className="flex items-center gap-5">
                <div
                  className={clsx(
                    "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                    PRIOTITYSTYELS[task?.priority],
                    bgColor[task?.priority]
                  )}
                >
                  <span className="text-lg">{ICONS[task?.priority]}</span>
                  <span className="uppercase">{task?.priority} Priority</span>
                </div>

                <div className={clsx("flex items-center gap-2")}>
                  <div
                    className={clsx(
                      "w-4 h-4 rounded-full",
                      TASK_TYPE[task?.status]
                    )}
                  />
                  <span className="text-black uppercase">{task?.status}</span>
                </div>
              </div>

              <p className="text-gray-500">
                Created At: {new Date(task?.createdAt).toDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">DESCRIPTION: </span>
                {task?.description}
              </p>

              {task?.targetModel === "request" && (
                <div className="space-y-4 ">
                  <p className="text-gray-600 font-semibold text-sm">
                    REQUEST DETAILS
                  </p>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      <span className="font-semibold">Requester Title: </span>
                      {task?.target?.title}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Request Type : </span>
                      {task?.target?.requestType}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Description: </span>
                      {task?.target?.description}
                    </p>
                  </div>
                </div>
              )}

              {task?.targetModel === "project" && (
                <div className="space-y-4 ">
                  <p className="text-gray-600 font-semibold text-sm">
                    PROJECT DETAILS
                  </p>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      <span className="font-semibold">Project Title: </span>
                      {task?.target?.project_name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Description: </span>
                      {task?.target?.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 py-6">
                <p className="text-gray-600 font-semibold text-sm">
                  USER DETAILS
                </p>
                <div className="space-y-3">
                  <div className="flex gap-4 py-2 items-center border-t border-gray-200">
                    {task?.userAssigned?.profile_picture ? (
                      <Avatar
                        src={task?.userAssigned?.profile_picture}
                        alt={task?.userAssigned?.name}
                      />
                    ) : (
                      <div
                        className={
                          "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"
                        }
                      >
                        <span className="text-center">
                          {getInitials(task?.userAssigned?.name)}
                        </span>
                      </div>
                    )}

                    <div>
                      <p className="text-lg font-semibold">
                        {task?.userAssigned?.name}
                      </p>
                      <span className="text-gray-500">
                        {task?.userAssigned?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* Activities Tab Content */}
          <TaskTimeline _id={id} />
        </div>
      </CustomTabs>
    </div>
  );
};

export default TaskDescription;
