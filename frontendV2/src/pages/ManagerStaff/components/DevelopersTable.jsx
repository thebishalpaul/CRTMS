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
  Box,
  CircularProgress,
  FormControl,
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

const AddModal = ({ open, setOpen, getDevelopers }) => {
  const user = useSelector((state) => state.user);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [projectArr, setProjectArr] = useState([]);
  const [project, setProject] = useState("");

  const handleClose = () => {
    setOpen(false);
    setDeveloperName("");
    setDivision(null);
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/user/create-developer",
        {
          email,
          project,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      toast.success(response?.data?.message);
      setOpen(false);
      setEmail("");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Some error occurred while creating a new developer"
      );
    }
    setLoading(false);
    getDevelopers();
  };

  const getProjects = async () => {
    try {
      const response = await axios.get(`/api/v1/project/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setProjectArr(response.data.projects);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProjects();
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Create a new developer</DialogTitle>
      <DialogContent>
        <TextField
          label="Developer Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {projectArr?.length > 0 ? (
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Project</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              {projectArr?.map((project) => (
                <MenuItem key={project?._id} value={project._id}>
                  {project?.project_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Alert severity="error">No projects are there</Alert>
        )}
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

export default function DevelopersTable() {
  const user = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
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

  const handleClick = (e, developer) => {
    setSelectedDeveloper(developer);
    setMenuAnchor(e.target);
  };

  const handleClose = () => {
    setMenuAnchor(null);
    setSelectedDeveloper(null);
  };

  const filteredRows = rows?.filter((row) =>
    row?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = () => {
    setOpenEdit(true);
    setMenuAnchor(null);
  };

  const handleDelete = async () => {
    setMenuAnchor(null);
    const _id = selectedDeveloper?._id;

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
    setSelectedDeveloper(null);
    setLoading(false);
    getDevelopers();
  };

  const getDevelopers = async () => {
    try {
      const response = await axios.get(`/api/v1/user/developers`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.developers);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getDevelopers();
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
          Create Developer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Sl No</StyledTableCell>
              <StyledTableCell>Developer Name</StyledTableCell>
              <StyledTableCell align="left">Email</StyledTableCell>
              <StyledTableCell align="left">Project</StyledTableCell>
              <StyledTableCell align="right"></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredRows?.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : filteredRows
            ).map((row, index) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell component="th" scope="row">
                  {index + 1}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  {row.email}
                </StyledTableCell>

                <StyledTableCell component="th" scope="row">
                  {row?.projects[0]?.project_name || "Not Assigned"}
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
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <AddModal open={open} setOpen={setOpen} getDevelopers={getDevelopers} />
    </div>
  );
}
