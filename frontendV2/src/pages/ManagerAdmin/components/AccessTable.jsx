import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Checkbox,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import io from "socket.io-client";
import { setUser } from "../../../slices/userSlice";
import { tableCellClasses } from "@mui/material/TableCell";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
const accessLabels = {
  create_department: "Permission to Create Department",
  create_institute: "Permission Create Institute",
  manage_user: "Permission to View and Create Users",
  manage_project: "Permission to View and Create Projects",
  manage_developers: "Permission to View and Create Developers",
  manage_access: "Permission to Manage Access of Lower Level Users",
  manage_change_request: "Permission to View Change Requests",
  manage_ticket_request: "Permission to View Ticket Requests",
  approve_response_to_change_request: "Permission to Approve Responses to Change Requests",
  approve_response_to_ticket_request: "Permission to Approve Responses to Ticket Requests",
  respond_to_change_request: "Permission to Update Change Requests Status",
  respond_to_ticket_request: "Permission to Update Ticket Requests Status",
  view_tasks: "Permission to only View Tasks",
  manage_tasks: "Permission to Create and Edit Tasks",
  edit_configuration: "Edit Configuration",
};

const EditModal = ({ open, setOpen, level, setLevel }) => {
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [allAccessChecked, setAllAccessChecked] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/v1/level/${level._id}`,
        { ...level },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Access updated successfully");
        setOpen(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
    setLoading(false);
  };

  const handleAccessChange = (event) => {
    const { name, value } = event.target;
    setLevel((prev) => ({
      ...prev,
      access: {
        ...prev.access,
        [name]: value === "true",
      },
    }));
  };

  const handleSetAllAccessTrue = () => {
    setLevel((prev) => ({
      ...prev,
      access: Object.keys(prev.access).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {}),
    }));
  };

  const handleSetAllAccessToPrev = () => {
    setLevel((prev) => ({
      ...prev,
      access: Object.keys(prev.access).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {}),
    }));
  };

  const handleCheckboxChange = (event) => {
    setAllAccessChecked(event.target.checked);
    if (event.target.checked) {
      handleSetAllAccessTrue();
    }
    else {
      handleSetAllAccessToPrev();
    }
  };

  useEffect(() => {
    if (level) {
      setAllAccessChecked(Object.values(level.access).every((access) => access));
    }
  }, [level]);

  if (!level) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Level</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <TextField
            margin="dense"
            label="Level Name"
            type="text"
            fullWidth
            variant="outlined"
            value={level.level_name}
            onChange={(e) => setLevel({ ...level, level_name: e.target.value })}
          />
        </Box>

        {Object.entries(level.access).map(([key, value]) => (
          <Box key={key} mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              {accessLabels[key]}
            </Typography>
            <RadioGroup
              row
              name={key}
              value={value.toString()}
              onChange={handleAccessChange}
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ background: "#EDEDED" }}>
        <Box sx={{ width: '100%', display: 'flex' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allAccessChecked}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label="Give all permissions ?"
          />
        </Box>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={25} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AccessTable() {
  const user = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const getLevels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/level/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.levels);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLevels();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("levelsChange", (updatedLevels) => {
      getLevels();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleEditClick = (level) => {
    setSelectedLevel(level);
    setOpen(true);
  };
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <div>
      <TableContainer component={Paper} sx={{ marginTop: 5 }}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Level Name</StyledTableCell>
              <StyledTableCell>Access</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell component="th" scope="row">
                  {row.level_name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {Object.entries(row.access).filter(
                    ([key, value]) => value === true
                  ).length === 0 ? (
                    <Alert sx={{ width: "fit-content" }} severity="warning">
                      No access given
                    </Alert>
                  ) : (
                    Object.entries(row.access)
                      .filter(([key, value]) => value === true)
                      .map(([key, value]) => (
                        <div key={key}>
                          <strong>{accessLabels[key]}</strong>: {value ? "Yes" : "No"}
                        </div>
                      ))
                  )}
                </StyledTableCell>

                <StyledTableCell align="right">
                  <IconButton onClick={() => handleEditClick(row)}>
                    <EditIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <EditModal
        open={open}
        setOpen={setOpen}
        level={selectedLevel}
        setLevel={setSelectedLevel}
      />
    </div>
  );
}
