import React, { useEffect, useState } from "react";
import RequesterAdminLayout from "./components/RequesterAdminLayout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Paper,
  Divider,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import { FiberManualRecord as FiberManualRecordIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import allUsers from "../../assets/images/users.png";
import { DatePicker, Space } from "antd";
import CommentSection from "../../components/Global/ComentSection";

const { RangePicker } = DatePicker;

const useStyles = makeStyles((theme) => ({
  dayDivider: {
    paddingLeft: "16px",
    paddingTop: "8px",
    paddingBottom: "8px",
    backgroundColor: "#f6f8fa",
    borderBottom: "1px solid #e1e4e8",
  },
  commitItem: {
    paddingLeft: "16px",
    paddingTop: "8px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e1e4e8",
    display: "flex",
    alignItems: "center",
  },
  commitIcon: {
    marginRight: "8px",
  },
  filterContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
}));

const RequestTimeline = () => {
  const classes = useStyles();
  const user = useSelector((state) => state.user);
  const { _id } = useParams();
  const [histories, setHistories] = useState([]);
  const [groupedHistories, setGroupedHistories] = useState({});
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [selectedUserFilter, setSelectedUserFilter] = useState("");
  const [users, setUsers] = useState([]);

  const fetchTimeline = async () => {
    try {
      const response = await axios.get(`/api/v1/history/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
        params: {
          targetModel: "request",
          target: _id,
        },
      });
      if (response.data.success) {
        setHistories(response?.data?.histories);
        const relatedUsers = response.data.histories?.map(
          (history) => history.user
        );

        const uniqueUsers = Array.from(
          new Set(relatedUsers.map((user) => user._id))
        ).map((userId) => relatedUsers.find((user) => user._id === userId));

        setUsers(uniqueUsers);
      } else {
        console.error("Failed to fetch histories:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching histories:", error);
    }
  };

  useEffect(() => {
    if (_id && user) {
      fetchTimeline();
    }
  }, [_id, user]);

  const groupHistory = (h) => {
    if (histories.length > 0) {
      const grouped = {};
      h.forEach((history) => {
        const date = new Date(history.updatedAt);
        const dayDate = `${date.toLocaleString("en-us", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`;
        if (!grouped[dayDate]) {
          grouped[dayDate] = [history];
        } else {
          grouped[dayDate].push(history);
        }
      });
      setGroupedHistories(grouped);
    }
  };

  useEffect(() => {
    groupHistory(histories);
  }, [histories]);

  const handleUserFilterChange = (event) => {
    setSelectedUserFilter(event.target.value);
    handleFilterHistories({
      user: event.target.value,
      dateString: selectedDateFilter,
    });
  };

  const handleDateFilterChange = (date, dateString) => {
    setSelectedDateFilter(dateString);
    handleFilterHistories({ user: selectedUserFilter, dateString: dateString });
  };

  const handleFilterHistories = ({ user, dateString }) => {
    console.log(user, dateString);
    const filteredUser = user
      ? histories.filter((h) => h?.user?._id === user)
      : histories;

    const filteredDate =
      dateString && dateString.length === 2 && dateString[0] && dateString[1]
        ? filteredUser.filter(
          (h) =>
            new Date(h.updatedAt) >= new Date(dateString[0]) &&
            new Date(h.updatedAt) <= new Date(dateString[1])
        )
        : filteredUser;

    console.log(filteredDate);

    groupHistory(filteredDate);
  };

  return (
    <RequesterAdminLayout>
      <div className={classes.filterContainer}>
        <Typography variant="h5" gutterBottom>
          Request Timeline
        </Typography>
        <Space direction="horizontal">
          <Select
            value={selectedUserFilter}
            onChange={handleUserFilterChange}
            displayEmpty
            sx={{
              width: 160,
              display: "flex",
              alignItems: "center",
              height: 45,
            }}
            renderValue={(selected) => (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  alt={users.find((user) => user._id === selected)?.name || ""}
                  src={
                    !selected
                      ? allUsers
                      : users.find((user) => user._id === selected)
                        ?.profile_picture
                  }
                  style={{ marginRight: 8 }}
                />
                {users.find((user) => user._id === selected)?.name ||
                  "All Users"}
              </div>
            )}
          >
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                <Avatar
                  alt={user.name}
                  src={user.profile_picture}
                  style={{ marginRight: 8 }}
                />
                {user.name}
              </MenuItem>
            ))}
            <MenuItem value="">View timeline for all users</MenuItem>
          </Select>

          <RangePicker
            onChange={handleDateFilterChange}
            style={{ height: 45 }}
          />
        </Space>
      </div>
      <Paper elevation={3}>
        {Object.keys(groupedHistories).map((dayDate, index) => (
          <div key={dayDate}>
            {index > 0 && <Divider />}
            <Box className={classes.dayDivider}>
              <Typography variant="body2" color="textSecondary">
                {dayDate}
              </Typography>
            </Box>
            <List>
              {groupedHistories[dayDate].map((history, index) => (
                <ListItem key={index} className={classes.commitItem}>
                  <ListItemAvatar>
                    <Avatar
                      alt={history.user.name}
                      src={history.user.profile_picture}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={history.user.name}
                    secondary={`${history.heading} - ${history.description}`}
                  />
                  <Box flexGrow={1} />
                  <Typography variant="body2" color="textSecondary">
                    {new Date(history.updatedAt).toLocaleTimeString()}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </div>
        ))}
      </Paper>
      <div
        style={{
          position: "fixed",
          bottom: 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CommentSection fetchTimeline={fetchTimeline} targetId={_id} model="request" variant="comment" />
      </div>
    </RequesterAdminLayout>
  );
};

export default RequestTimeline;
