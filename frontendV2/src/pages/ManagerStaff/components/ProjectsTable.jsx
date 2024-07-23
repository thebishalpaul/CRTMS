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
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextareaAutosize,
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

const AddModal = ({ open, setOpen }) => {
  const user = useSelector((state) => state.user);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentArr, setDepartmentArr] = useState([]);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setProjectName("");
    setDepartment(null);
    setDescription("");
  };
  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/project/create",
        {
          projectName,
          department,
          description,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );

      toast.success(response?.data?.message);
      setOpen(false);
      setProjectName("");
      setDepartment(null);
      setDescription("");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Some error occurred while creating a new institute"
      );
    }

    setLoading(false);
  };
  const getDepartments = async () => {
    try {
      const response = await axios.get(`/api/v1/department/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setDepartmentArr(response.data.departments);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getDepartments();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("departmentsChange", (updatedDepartments) => {
      getDepartments();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create a new project</DialogTitle>
      <DialogContent>
        {departmentArr?.length > 0 ? (
          <Autocomplete
            style={{ width: "100%" }}
            id="department"
            options={departmentArr.sort(
              (a, b) =>
                -b?.division?.division_name?.localeCompare(
                  a?.division?.division_name
                )
            )}
            groupBy={(option) => option?.division?.division_name}
            getOptionLabel={(option) => option.department_name}
            sx={{ width: 300 }}
            value={department}
            onChange={(event, newValue) => {
              setDepartment(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Department" />
            )}
          />
        ) : (
          <Alert severity="error">No departments are there</Alert>
        )}
        <TextField
          label="Project Name"
          fullWidth
          margin="normal"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <TextField
          id="description"
          label="Description"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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

const EditModal = ({ open, setOpen, project }) => {
  const user = useSelector((state) => state.user);
  const [projectName, setProjectName] = useState("");
  const [departmentArr, setDepartmentArr] = useState([]);
  const [department, setDepartment] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      setProjectName(project.project_name);
      setDepartment(project.department || null);
      setDescription(project.description || "");
    }
  }, [open]);
  const handleClose = () => {
    setOpen(false);
    setProjectName("");
    setDepartment(null);
    setDescription("");
  };
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/v1/project/${project?._id}`,
        {
          projectName,
          department,
          description,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );

      toast.success(response?.data?.message);
      setOpen(false);
      setProjectName("");
      setDepartment(null);
      setDescription("");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Some error occurred while updating project"
      );
    }

    setLoading(false);
  };
  const getDepartments = async () => {
    try {
      const response = await axios.get(`/api/v1/department/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setDepartmentArr(response.data.departments);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getDepartments();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("departmentsChange", (updatedDepartments) => {
      getDepartments();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Edit project</DialogTitle>
      <DialogContent>
        {departmentArr?.length > 0 ? (
          <Autocomplete
            style={{ width: "100%" }}
            id="department"
            options={departmentArr.sort(
              (a, b) =>
                -b?.division?.division_name?.localeCompare(
                  a?.division?.division_name
                )
            )}
            groupBy={(option) => option?.division?.division_name}
            getOptionLabel={(option) => option.department_name}
            sx={{ width: 300 }}
            value={department}
            onChange={(event, newValue) => {
              setDepartment(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Department" />
            )}
          />
        ) : (
          <Alert severity="error">No departments are there</Alert>
        )}
        <TextField
          label="Project Name"
          fullWidth
          margin="normal"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <TextField
          id="description"
          label="Description"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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

export default function ProjectsTable({ access }) {
  const user = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
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

  const handleClick = (e, project) => {
    setSelectedProject(project);
    setMenuAnchor(e.target);
  };

  const handleClose = () => {
    setMenuAnchor(null);
    setSelectedProject(null);
  };

  const handleEdit = () => {
    setOpenEdit(true);
    setMenuAnchor(null);
  };

  const filteredRows = rows?.filter((row) =>
    row?.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    setMenuAnchor(null);
    const _id = selectedProject._id;
    try {
      const response = await axios.delete(`/api/v1/project/${_id}`, {
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
    setSelectedProject(null);
    setLoading(false);
  };

  const getProjects = async () => {
    setLoading("project");
    try {
      const response = await axios.get(`/api/v1/project/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.projects);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjects();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("projectsChange", (updatedProjects) => {
      getProjects();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading === "project") {
    return <CircularProgress />;
  }

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
        {access?.manage_project && (
          <Button
            variant="contained"
            color="inherit"
            onClick={() => setOpen(true)}
            startIcon={<AddToPhotosIcon />}
          >
            Create Project
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Sl No</StyledTableCell>
              <StyledTableCell>Project Name</StyledTableCell>
              <StyledTableCell align="left">Division</StyledTableCell>
              <StyledTableCell align="left">Department</StyledTableCell>
              <StyledTableCell align="left">Managed By</StyledTableCell>
              <StyledTableCell align="right"></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredRows.slice(
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
                  {row?.project_name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row?.department?.division?.division_name || (
                    <Alert sx={{ width: "fit-content" }} severity="warning">
                      Not added
                    </Alert>
                  )}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row?.department?.department_name || (
                    <Alert sx={{ width: "fit-content" }} severity="warning">
                      Not added
                    </Alert>
                  )}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row?.managed_by?.name || (
                    <Alert sx={{ width: "fit-content" }} severity="warning">
                      Not added
                    </Alert>
                  )}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {access?.manage_project && (
                    <IconButton onClick={(e) => handleClick(e, row)}>
                      <MoreVertIcon />
                    </IconButton>
                  )}
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
      <AddModal open={open} setOpen={setOpen} />
      <EditModal
        open={openEdit}
        setOpen={setOpenEdit}
        project={selectedProject}
      />
    </div>
  );
}
