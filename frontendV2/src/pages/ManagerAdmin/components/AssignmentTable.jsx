import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import EditIcon from "@mui/icons-material/Edit";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import io from "socket.io-client";
import { setUser } from "../../../slices/userSlice";

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
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const EditModal = ({ open, setOpen, _key }) => {
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [levelsArr, setLevelsArr] = useState([]);
  const [value, setValue] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setValue("");
  };
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        "/api/v1/institute/configuration",
        {
          _key,
          value,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );

      toast.success(response?.data?.message);
      setOpen(false);
      setValue("");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        "Some error occurred while creating a new institute"
      );
    }

    setLoading(false);
  };
  const getLevels = async () => {
    try {
      const response = await axios.get(`/api/v1/level/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setLevelsArr(response.data.levels);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
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

    socket.on("levelsChange", () => {
      getLevels();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Assign role for {_key?.toUpperCase()}</DialogTitle>
      <DialogContent>
        {levelsArr?.length > 0 ? (
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Select Level</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Select Level"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              {levelsArr?.map((level) => (
                <MenuItem key={level?._id} value={level._id}>
                  {level?.level_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Alert severity="error">No levels are there</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button color="primary" onClick={handleUpdate} disabled={loading}>
          {loading ? <CircularProgress /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AssignmentTable() {
  const user = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const dispatch = useDispatch();
  const [key, setKey] = useState(null);

  const getConfiguration = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/institute/configuration`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        const { user, configuration } = response.data;
        // Dispatch actions to update Redux store
        dispatch(setUser(user));
        localStorage.removeItem("user");
        localStorage.setItem("user", JSON.stringify(user));
        setRows(response.data.configuration);
        const assignedRoles = configuration.assigned_levels;
        const temp = [];
        Object.keys(assignedRoles).forEach((key) => {
          temp.push([key, assignedRoles[key]]);
        });
        setRows(temp);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getConfiguration();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("institutesChange", () => {
      getConfiguration();
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <div>
      <TableContainer component={Paper} sx={{ marginTop: 5 }}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow key={row[0]}>
                <StyledTableCell component="th" scope="row">
                  {row[0]?.toUpperCase()}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row[1]?.level_name || (
                    <Alert sx={{ width: "fit-content" }} severity="warning">
                      Not added
                    </Alert>
                  )}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <IconButton
                    onClick={() => {
                      setOpen(true);
                      setKey(row[0]);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <EditModal open={open} setOpen={setOpen} _key={key} />
    </div>
  );
}
