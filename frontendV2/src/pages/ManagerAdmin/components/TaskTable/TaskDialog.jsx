import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { HiDuplicate } from "react-icons/hi";
import { MdAdd, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { MoreVert } from "@mui/icons-material";
import AddTask from "./AddTask";
import { useSelector } from "react-redux";
import { useToast } from "../../../../context/ToastContext";
import axios from "axios";
import EditTask from "./EditTask";

const TaskDialog = ({ task }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const user = useSelector((state) => state.user);
  const { toast } = useToast();

  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const deleteHandler = async () => {
    try {
      const response = await axios.delete(`/api/v1/task/delete/${task._id}`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      if (response.data.success) {
        toast.success("Task deleted successfully");
      } else {
        toast.error("Task deletion failed");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const items = [
    {
      label: "Open Task",
      icon: <AiTwotoneFolderOpen className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => navigate(`/${user.role}/task/${task._id}`),
    },
    {
      label: "Edit",
      icon: <MdOutlineEdit className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => setOpenEdit(true),
    },
  ];

  return (
    <>
      <div>
        <IconButton aria-label="more" aria-controls="menu" aria-haspopup="true" onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>
        <Menu
          id="menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {items.map((el) => (
            <MenuItem key={el.label} onClick={() => { handleMenuClose(); el.onClick(); }}>
              {el.icon}
              {el.label}
            </MenuItem>
          ))}
          <MenuItem onClick={() => { handleMenuClose(); deleteHandler(); }}>
            <RiDeleteBin6Line className="mr-2 h-5 w-5 text-red-400" aria-hidden="true" />
            Delete
          </MenuItem>
        </Menu>
      </div>

      <EditTask open={openEdit} setOpen={setOpenEdit} task={task} />
    </>
  );
};

export default TaskDialog;
