import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser, setUser } from "../../slices/userSlice"; // Adjust the path as necessary
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useToast } from "../../context/ToastContext";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  console.log(user);
  const [profileImage, setProfileImage] = useState(user.profile_picture);
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    setProfileImage(user.profile_picture);
  }, [user?.profile_picture]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    handleMenuClose();
    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const response = await axios.post(
        "/api/v1/user/upload-profile-image",
        formData,
        {
          headers: {
            Authorization: `${user?.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        dispatch(setUser(response?.data?.user));
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
  };

  const handleRemoveImage = async () => {
    handleMenuClose();

    try {
      const response = await axios.put(
        "/api/v1/user/edit-profile",
        {
          profile_picture: null,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );

      if (response.data.success) {
        dispatch(setUser(response?.data?.user));
      }
    } catch (error) {
      console.error("Error removing profile image:", error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const updatedUserData = { name, email };
      if (password) {
        updatedUserData.password = password;
      }

      const response = await axios.put(
        "/api/v1/user/edit-profile",
        updatedUserData,
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setUser(response.data.user));
        setPassword("");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setLoading(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        maxWidth: "600px",
        mx: "auto",
        mt: 3,
        p: 4,
        bgcolor: "background.paper",
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Box sx={{ width: 128, height: 128, mb: 2, position: "relative" }}>
          <Avatar
            src={profileImage}
            alt="name"
            className="w-full h-full rounded-full object-cover"
            style={{ width: "100%", height: "100%", borderRadius: "50%" }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <IconButton
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
              "&:hover": {
                opacity: 1,
                background: "#00000099",
              },
            }}
            onClick={handleMenuClick}
          >
            <FaPencilAlt style={{ color: "#fff" }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleUploadClick}>Upload Image</MenuItem>
            <MenuItem onClick={handleRemoveImage}>Remove Image</MenuItem>
          </Menu>
        </Box>
      </Box>
      <Box component="form" sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          variant="outlined"
          type="email"
        />
        <TextField
          fullWidth
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          variant="outlined"
          type="password"
          placeholder="Leave blank to keep current password"
        />
        {loading ? (
          <CircularProgress />
        ) : (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleProfileUpdate}
            disabled={loading}
          >
            Update
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
