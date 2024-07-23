import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
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
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import io from "socket.io-client";
import DeleteIcon from "@mui/icons-material/Delete";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import EditIcon from "@mui/icons-material/Edit";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
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

const AddModal = ({ open, setOpen, fetchUsers }) => {
  const user = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setFormData({
      email: "",
    });
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/v1/user/create-requester-staff`,
        formData,
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      if (response.data.success) {
        console.log(response.data);
        toast.success(response?.data?.message);
        fetchUsers();
        handleClose();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        "Some error occurred while creating a new user"
      );
    }
    setLoading(false);
  };

  const getConfiguration = async () => {
    try {
      const response = await axios.get(`/api/v1/institute/configuration`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        const { configuration } = response.data;
        setAssignedLevels(configuration.assigned_levels);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  // useEffect(() => {
  //   getConfiguration();
  //   getLevels();
  //   getDivisions();
  //   const socket = io("http://localhost:8000");

  //   socket.on("connect", () => {
  //     console.log("Socket connected");
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("Socket disconnected");
  //   });

  //   socket.on("divisionsChange", (updatedDivisions) => {
  //     getDivisions();
  //   });
  //   socket.on("levelsChange", (updatedLevels) => {
  //     getLevels();
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   getConfiguration();
  //   getLevels();
  //   getDivisions();
  // }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Create a new user</DialogTitle>
      <DialogContent>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button color="primary" onClick={handleAdd} disabled={loading}>
          {loading ? <CircularProgress /> : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditModal = ({ open, setOpen, user }) => { };

export default function UsersTable() {
  const user = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleClick = (e, user) => {
    setSelectedUser(user);
    setMenuAnchor(e.target);
  };

  const handleClose = () => {
    setMenuAnchor(null);
    setSelectedUser(null);
  };

  const filteredRows = rows?.filter(
    (row) =>
      row?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = () => {
    setOpenEdit(true);
    setMenuAnchor(null);
  };

  const handleDelete = async () => {
    setMenuAnchor(null);
    const _id = selectedUser?._id;

    try {
      const response = await axios.delete(`/api/v1/user/${_id}`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
    setSelectedUser(null);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/v1/user/all", {
        headers: {
          Authorization: `${user.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.users);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Button
          variant="contained"
          color="inherit"
          onClick={() => setOpen(true)}
          startIcon={<AddToPhotosIcon />}
        >
          Create User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell align="left">Email</StyledTableCell>
              <StyledTableCell align="right">Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredRows?.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              : filteredRows
            )?.map((row) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  {row.email}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <IconButton onClick={(e) => handleClick(e, row)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleClose}
                  >
                    <MenuItem
                      onClick={handleEdit}
                      sx={{ display: "flex", gap: "5px" }}
                    >
                      <EditIcon />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={handleDelete}
                      sx={{ display: "flex", gap: "5px" }}
                    >
                      <DeleteIcon />
                      Delete
                    </MenuItem>
                  </Menu>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRows?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <AddModal open={open} setOpen={setOpen} fetchUsers={fetchUsers} />
      <EditModal open={openEdit} setOpen={setOpenEdit} user={selectedUser} />
    </div>
  );
}
