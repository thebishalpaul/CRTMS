import clsx from "clsx";
import React, { useState, useEffect } from "react";
import { FaBug, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import CustomTabs from "./Tabs";
import { PRIOTITYSTYELS, REQUEST_TYPE, getInitials } from "../../../../utils";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Autocomplete,
  Avatar,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import Timeline from "./Timeline";
import { useToast } from "../../../../context/ToastContext";
// import ReactTimeAgo from 'react-time-ago';
// import "../../../../utils/timeAgoSetup.js";

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
  { title: "Request Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const REQUESTTYPEICON = {
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage />
    </div>
  ),
  approved: (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp size={20} />
    </div>
  ),
  "awaiting-approval": (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white">
      <FaUser size={14} />
    </div>
  ),
  rejected: (
    <div className="text-red-600">
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in-progress": (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white">
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const RequestDescription = ({ access }) => {
  const { id } = useParams();
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null);
  const user = useSelector((state) => state.user);
  const [status, setStatus] = useState(null);
  const { toast } = useToast();
  console.log(access);

  const statusOptions = [
    {
      label: "In Progress",
      value: "in-progress",
    },
    {
      label: "Rejected",
      value: "rejected",
    },
    {
      label: "Completed",
      value: "completed",
    },
  ];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/request/${id}`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      if (response.data.success) {
        setRequest(response.data.request);
        console.log(response.data.request);
      }
    } catch (error) {
      console.log("🚀 ~ fetchRequests ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/v1/request/change-status/${id}`,
        {
          status: status?.value,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      if (response.data?.success) {
        toast.success(response.data?.message || "Updated successfully");
        fetchRequests();
      }
      setStatus(null);
    } catch (error) {
      console.log("🚀 ~ handleChangeStatus ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [id]);

  return loading ? (
    <div className="py-10">
      <CircularProgress />
    </div>
  ) : (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      <h1 className="text-2xl text-gray-600 font-bold">{request?.title}</h1>
      <CustomTabs tabs={TABS} setSelected={setSelected}>
        <div>
          {/* Request Detail Tab Content */}
          <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto">
            <div className="w-full md:w-1/2 space-y-8">
              <div className="flex items-center gap-5">
                <div
                  className={clsx(
                    "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                    PRIOTITYSTYELS[request?.priority],
                    bgColor[request?.priority]
                  )}
                >
                  <span className="text-lg">{ICONS[request?.priority]}</span>
                  <span className="uppercase">
                    {request?.priority} Priority
                  </span>
                </div>

                <div className={clsx("flex items-center gap-2")}>
                  <div
                    className={clsx(
                      "w-4 h-4 rounded-full",
                      REQUEST_TYPE[request?.status]
                    )}
                  />
                  <span className="text-black uppercase">
                    {request?.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-500">
                Created At: {new Date(request?.createdAt).toDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">DESCRIPTION: </span>
                {request?.description}
              </p>

              <div className="space-y-4 ">
                <p className="text-gray-600 font-semibold text-sm">
                  PROJECT DETAILS
                </p>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    <span className="font-semibold">Project Name: </span>
                    {request?.projectId?.project_name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Description: </span>
                    {request?.projectId?.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 py-6">
                <p className="text-gray-600 font-semibold text-sm">
                  USER DETAILS
                </p>
                <div className="space-y-3">
                  {/* {request?.users?.map((m, index) => ( */}
                  <div className="flex gap-4 py-2 items-center border-t border-gray-200">
                    {/* <div
                      className={
                        "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"
                      }
                    >
                      <span className="text-center">
                        {getInitials(request?.createdBy?.name)}
                      </span>
                    </div> */}
                    <Avatar
                      src={request?.createdBy?.profile_picture}
                      alt={request?.createdBy?.name}
                    />

                    <div>
                      <p className="text-lg font-semibold">
                        {request?.createdBy?.name}
                      </p>
                      <span className="text-gray-500">
                        {request?.createdBy?.role}
                      </span>
                    </div>
                  </div>
                  {/* ))} */}
                </div>
              </div>

              {access &&
                access[`respond_to_${request?.requestType}_request`] && (
                  <div className="space-y-4 py-6">
                    <p className="text-gray-600 font-semibold text-sm">
                      CHANGE STATUS
                    </p>
                    <div className="space-y-3">
                      {/* {task?.users?.map((m, index) => ( */}
                      <div className="flex gap-4 py-2 items-center border-t border-gray-200">
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={statusOptions}
                          getOptionLabel={(option) => option.label}
                          value={status}
                          onChange={(e, option) => setStatus(option)}
                          sx={{ width: 300 }}
                          renderInput={(params) => (
                            <TextField {...params} label="Select Status" />
                          )}
                        />
                      </div>
                      {status && (
                        <Button
                          variant="contained"
                          color={
                            status?.value === "in-progress"
                              ? "warning"
                              : status?.value === "rejected"
                              ? "error"
                              : "success"
                          }
                          onClick={handleChangeStatus}
                        >
                          {`Change to ${status.label}`}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div>
          {/* Timeline Tab Content */}
          <Timeline />
        </div>
      </CustomTabs>
    </div>
  );
};

export default RequestDescription;
