import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { MoreVert } from "@mui/icons-material";
import { useSelector } from "react-redux";

const TaskDialog = ({ task }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const user = useSelector((state) => state.user);

  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const items = [
    {
      label: "Open Task",
      icon: <AiTwotoneFolderOpen className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => navigate(`/${user.role}/task/${task._id}`),
    },
  ];

  return (
    <>
      <div>
        <IconButton
          aria-label="more"
          aria-controls="menu"
          aria-haspopup="true"
          onClick={handleMenuOpen}
        >
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
            <MenuItem
              key={el.label}
              onClick={() => {
                handleMenuClose();
                el.onClick();
              }}
            >
              {el.icon}
              {el.label}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </>
  );
};

export default TaskDialog;
