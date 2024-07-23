import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Divider,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { DatePicker, Space } from "antd";
import { parseISO, isAfter, isBefore, isEqual } from "date-fns";

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
  filterContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  noHistoryMessage: {
    padding: "16px",
    textAlign: "center",
    color: "#999",
  },
}));

const History = () => {
  const classes = useStyles();
  const user = useSelector((state) => state.user);
  const { _id } = useParams();
  const [histories, setHistories] = useState([]);
  const [originalHistories, setOriginalHistories] = useState([]);
  const [groupedHistories, setGroupedHistories] = useState({});

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`/api/v1/history/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
        params: {
          $or: [{ targetModel: "user", target: user._id }, { user: user._id }],
        },
      });
      if (response.data.success) {
        const fetchedHistories = response?.data?.histories;
        setHistories(fetchedHistories);
        setOriginalHistories(fetchedHistories); 
      } else {
        console.error("Failed to fetch histories:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching histories:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const groupHistory = (h) => {
    if (h.length > 0) {
      const grouped = {};
      h.forEach((history) => {
        const date = new Date(history.createdAt);
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
      console.log("Grouped Histories: ", grouped); 
      setGroupedHistories(grouped);
    } else {
      setGroupedHistories({});
    }
  };

  useEffect(() => {
    groupHistory(histories);
  }, [histories]);

  const handleDateFilterChange = (dates, dateStrings) => {
    const [startDateString, endDateString] = dateStrings;
    if (!startDateString || !endDateString || new Date(startDateString) > new Date(endDateString)) {
      setHistories(originalHistories);
      groupHistory(originalHistories);
      return;
    }

    const startDate = parseISO(startDateString);
    const endDate = parseISO(endDateString);

    // Adjust endDate to include the entire day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const filteredHistories = originalHistories.filter((h) => {
      const createdAtDate = parseISO(h.createdAt);

      const isAfterStartDate = isAfter(createdAtDate, startDate) || isEqual(createdAtDate, startDate);
      const isBeforeEndDate = isBefore(createdAtDate, adjustedEndDate) || isEqual(createdAtDate, adjustedEndDate);

      return isAfterStartDate && isBeforeEndDate;
    });

    console.log("Filtered Histories: ", filteredHistories);

    setHistories(filteredHistories);
    groupHistory(filteredHistories);
  };

  return (
    <>
      <div className={classes.filterContainer}>
        <Typography variant="h5" gutterBottom>
          History
        </Typography>
        <Space direction="horizontal">
          <RangePicker
            onChange={handleDateFilterChange}
            style={{ height: 45 }}
          />
        </Space>
      </div>
      <Paper elevation={3}>
        {Object.keys(groupedHistories).length === 0 ? (
          <Typography className={classes.noHistoryMessage}>
            No History Available for Selected Range
          </Typography>
        ) : (
          Object.keys(groupedHistories).map((dayDate, index) => (
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
                    <ListItemText
                      primary={history.heading}
                      secondary={
                        <>
                          <Typography variant="body2" color="textPrimary">
                            {history.description}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(history.createdAt).toLocaleTimeString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          ))
        )}
      </Paper>
    </>
  );
};

export default History;
