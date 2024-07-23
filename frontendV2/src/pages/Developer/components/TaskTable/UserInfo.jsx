import React, { useState } from "react";
import { Popover, Typography, Avatar } from "@mui/material";
import { getInitials } from "../../../../utils";

const UserInfo = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "user-popover" : undefined;

  return (
    <div className="px-4">
      <div className="group inline-flex items-center outline-none cursor-pointer" onClick={handleClick}>
        <Typography variant="body1">{getInitials(user?.name)}</Typography>
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="flex items-center gap-4 rounded-lg shadow-lg bg-white p-8">
          <Avatar sx={{ bgcolor: "blue", width: 64, height: 64 }}>
            {getInitials(user?.name)}
          </Avatar>
          <div className="flex flex-col gap-y-1">
            <Typography variant="h6" component="p" className="text-black font-bold">
              {user?.name}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {user?.title}
            </Typography>
            <Typography variant="body2" className="text-blue-500">
              {user?.email ?? "email@example.com"}
            </Typography>
          </div>
        </div>
      </Popover>
    </div>
  );
};


export default UserInfo;
