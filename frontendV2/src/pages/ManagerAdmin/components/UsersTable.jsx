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

const AddModal = ({ open, setOpen }) => {
  const user = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: "",
    level: null,
    division: null,
    departments: [],
    projects: [],
  });
  const [divisionArr, setDivisionArr] = useState([]);
  const [levelArr, setLevelArr] = useState([]);
  const [departmentArr, setDepartmentArr] = useState([]);
  const [projectArr, setProjectArr] = useState([]);
  const [assignedLevels, setAssignedLevels] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setDivisionArr([]);
    setDepartmentArr([]);
    setProjectArr([]);
    setFormData({
      email: "",
      level: null,
      division: null,
      departments: [],
      projects: [],
    });
  };

  const handleAdd = async () => {
    if (
      !assignedLevels.division ||
      !assignedLevels.department ||
      !assignedLevels.project
    ) {
      toast.error("You haven't assigned roles yet..");
      handleClose();
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`/api/v1/user/create`, formData, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      toast.success(response?.data?.message);
      handleClose();
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Some error occurred while creating a new user"
      );
    }
    setLoading(false);
  };
  const handleLevelChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      level: e.target.value,
    }));
    // console.log(formData);
    // handleDivisionChange(e, formData.division, e.target.value);
  };

  const handleDivisionChange = async (e, value, level) => {
    const divisionId = value?._id;
    setFormData((prev) => ({ ...prev, division: value }));
    try {
      const response = await axios.get(
        `/api/v1/department/by-division/${divisionId}`,
        {
          params: {
            level: level,
          },
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      if (response.data.success) {
        setDepartmentArr(response.data.departments);

        if (assignedLevels.division._id === level) {
          setFormData((prev) => ({
            ...prev,
            departments: response.data.departments,
            projects: response.data.projects,
          }));
          setProjectArr(response.data.projects);
        } else {
          setFormData((prev) => ({ ...prev, departments: [], projects: [] }));
          setProjectArr([]);
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          division: null,
          departments: [],
          projects: [],
        }));
        setDepartmentArr([]);
        setProjectArr([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const handleDepartmentChange = async (e, values) => {
    const departmentIds = values.map((department) => department._id);
    const updatedProjects = formData.projects.filter((project) =>
      departmentIds.includes(project.department._id)
    );
    setFormData((prev) => ({
      ...prev,
      departments: values,
      projects: updatedProjects,
    }));
    try {
      const response = await axios.get("/api/v1/project/by-departments", {
        params: {
          departmentIds: departmentIds.join(","),
          level: formData.level,
        },
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      if (response.data.success) {
        setProjectArr(response.data.projects);
        if (assignedLevels.department._id === formData.level) {
          setFormData((prev) => ({
            ...prev,
            projects: response.data.projects,
          }));
          if (response.data.departments) {
            setFormData((prev) => ({
              ...prev,
              departments: response.data.departments,
            }));
          }
        }
      }
    } catch (error) {
      console.log(error);
      // toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const getDivisions = async () => {
    try {
      const response = await axios.get(`/api/v1/division/all`, {
        params: {
          level: formData.level,
        },
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      if (response.data.success) {
        setDivisionArr(response.data.divisions);
        setDepartmentArr([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
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
        setLevelArr(response.data.levels);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const getConfiguration = async () => {
    try {
      const response = await axios.get(`/api/v1/institute/configuration`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      // console.log(response.data);
      if (response.data.success) {
        const { configuration } = response.data;
        setAssignedLevels(configuration.assigned_levels);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getConfiguration();
    getLevels();
    getDivisions();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("divisionsChange", (updatedDivisions) => {
      getDivisions();
    });
    socket.on("levelsChange", (updatedLevels) => {
      getLevels();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    getConfiguration();
    getLevels();
    getDivisions();
  }, [open]);

  useEffect(() => {
    getDivisions();
    // console.log(divisionArr);
  }, [formData.level]);

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
        {levelArr?.length > 0 ? (
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Level</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Level"
              value={formData.level}
              onChange={handleLevelChange}
            >
              {levelArr?.map((level) => (
                <MenuItem key={level?._id} value={level._id}>
                  {level?.level_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Alert severity="error">No levels are available</Alert>
        )}

        {divisionArr?.length > 0 ? (
          <Autocomplete
            style={{ width: "100%", marginTop: "5px" }}
            id="division"
            options={divisionArr}
            getOptionLabel={(option) => option.division_name}
            sx={{ width: 300 }}
            value={formData.division}
            onChange={(e, value) =>
              handleDivisionChange(e, value, formData.level)
            }
            renderInput={(params) => <TextField {...params} label="Division" />}
          />
        ) : null}

        {departmentArr?.length > 0 ? (
          <Autocomplete
            multiple
            style={{ width: "100%", marginTop: "5px" }}
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
            value={formData.departments}
            onChange={handleDepartmentChange}
            renderInput={(params) => (
              <TextField {...params} label="Department" />
            )}
          />
        ) : null}
        {projectArr?.length > 0 ? (
          <Autocomplete
            multiple
            style={{ width: "100%", marginTop: "5px" }}
            id="project"
            options={projectArr.sort(
              (a, b) =>
                -b?.department?.department_name?.localeCompare(
                  a?.department?.department_name
                )
            )}
            groupBy={(option) => option?.department?.department_name}
            getOptionLabel={(option) => option.project_name}
            sx={{ width: 300 }}
            value={formData.projects}
            onChange={(event, newValue) => {
              setFormData((prev) => ({ ...prev, projects: newValue }));
            }}
            renderInput={(params) => <TextField {...params} label="Project" />}
          />
        ) : null}
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

const EditModal = ({ open, setOpen, user }) => {
  const currentUser = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    level: user?.level?._id || null,
    division: null,
    departments: [],
    projects: [],
  });
  const [divisionArr, setDivisionArr] = useState([]);
  const [levelArr, setLevelArr] = useState([]);
  const [departmentArr, setDepartmentArr] = useState([]);
  const [projectArr, setProjectArr] = useState([]);
  const [assignedLevels, setAssignedLevels] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setDivisionArr([]);
    setDepartmentArr([]);
    setProjectArr([]);
  };

  const handleEdit = async () => {
    if (
      !assignedLevels.division ||
      !assignedLevels.department ||
      !assignedLevels.project
    ) {
      toast.error("You haven't assigned roles yet..");
      handleClose();
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(`/api/v1/user/${user._id}`, formData, {
        headers: {
          Authorization: `${currentUser?.token}`,
        },
      });
      // console.log(response.data);
      toast.success(response?.data?.message);
      handleClose();
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Some error occurred while editing the user"
      );
    }
    setLoading(false);
  };

  // Other handlers and useEffects similar to AddModal
  const handleLevelChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      level: e.target.value,
    }));
    // console.log(formData.division);
    // handleDivisionChange(e, formData.division, e.target.value);
  };

  const handleDivisionChange = async (e, value, level) => {
    const divisionId = value._id;
    setFormData((prev) => ({ ...prev, division: value }));
    try {
      const response = await axios.get(
        `/api/v1/department/by-division/${divisionId}`,
        {
          params: {
            level: level,
          },
          headers: {
            Authorization: `${currentUser?.token}`,
          },
        }
      );
      if (response.data.success) {
        setDepartmentArr(response.data.departments);

        if (assignedLevels.division._id === level) {
          setFormData((prev) => ({
            ...prev,
            departments: response.data.departments,
            projects: response.data.projects,
          }));
          setProjectArr(response.data.projects);
        } else {
          setFormData((prev) => ({ ...prev, departments: [], projects: [] }));
          setProjectArr([]);
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          division: null,
          departments: [],
          projects: [],
        }));
        setDepartmentArr([]);
        setProjectArr([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const handleDepartmentChange = async (e, values) => {
    const departmentIds = values.map((department) => department._id);
    const updatedProjects = formData.projects.filter((project) =>
      departmentIds.includes(project.department._id)
    );
    setFormData((prev) => ({
      ...prev,
      departments: values,
      projects: updatedProjects,
    }));
    try {
      const response = await axios.get("/api/v1/project/by-departments", {
        params: {
          departmentIds: departmentIds.join(","),
          level: formData.level,
        },
        headers: {
          Authorization: `${currentUser?.token}`,
        },
      });
      if (response.data.success) {
        setProjectArr(response.data.projects);
        if (assignedLevels.department._id === formData.level) {
          setFormData((prev) => ({
            ...prev,
            projects: response.data.projects,
          }));
          if (response.data.departments) {
            setFormData((prev) => ({
              ...prev,
              departments: response.data.departments,
            }));
          }
        }
      }
    } catch (error) {
      console.log(error);
      // toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const getDivisions = async () => {
    try {
      const response = await axios.get(`/api/v1/division/all`, {
        params: {
          level: formData.level,
        },
        headers: {
          Authorization: `${currentUser?.token}`,
        },
      });
      if (response.data.success) {
        setDivisionArr(response.data.divisions);
        setDepartmentArr([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const getLevels = async () => {
    try {
      const response = await axios.get(`/api/v1/level/all`, {
        headers: {
          Authorization: `${currentUser?.token}`,
        },
      });
      // console.log(response.data);
      if (response.data.success) {
        setLevelArr(response.data.levels);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  const getConfiguration = async () => {
    try {
      const response = await axios.get(`/api/v1/institute/configuration`, {
        headers: {
          Authorization: `${currentUser?.token}`,
        },
      });
      // console.log(response.data);
      if (response.data.success) {
        const { configuration } = response.data;
        setAssignedLevels(configuration.assigned_levels);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getConfiguration();
    getLevels();
    getDivisions();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("divisionsChange", (updatedDivisions) => {
      getDivisions();
    });
    socket.on("levelsChange", (updatedLevels) => {
      getLevels();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    getConfiguration();
    getLevels();
    getDivisions();
    setFormData({
      email: user?.email || "",
      level: user?.level?._id || null,
      division: null,
      departments: [],
      projects: [],
    });
  }, [user, open]);

  useEffect(() => {
    getDivisions();
  }, [formData?.level]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Edit User</DialogTitle>
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
        {levelArr?.length > 0 ? (
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Level</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Level"
              value={formData.level}
              onChange={handleLevelChange}
            >
              {levelArr?.map((level) => (
                <MenuItem key={level?._id} value={level._id}>
                  {level?.level_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Alert severity="error">No levels are available</Alert>
        )}

        {divisionArr?.length > 0 ? (
          <Autocomplete
            style={{ width: "100%", marginTop: "5px" }}
            id="division"
            options={divisionArr}
            getOptionLabel={(option) => option.division_name}
            sx={{ width: 300 }}
            value={formData.division}
            onChange={(e, value) =>
              handleDivisionChange(e, value, formData.level)
            }
            renderInput={(params) => <TextField {...params} label="Division" />}
          />
        ) : null}

        {departmentArr?.length > 0 ? (
          <Autocomplete
            multiple
            style={{ width: "100%", marginTop: "5px" }}
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
            value={formData.departments}
            onChange={handleDepartmentChange}
            renderInput={(params) => (
              <TextField {...params} label="Department" />
            )}
          />
        ) : null}
        {projectArr?.length > 0 ? (
          <Autocomplete
            multiple
            style={{ width: "100%", marginTop: "5px" }}
            id="project"
            options={projectArr.sort(
              (a, b) =>
                -b?.department?.department_name?.localeCompare(
                  a?.department?.department_name
                )
            )}
            groupBy={(option) => option?.department?.department_name}
            getOptionLabel={(option) => option.project_name}
            sx={{ width: 300 }}
            value={formData.projects}
            onChange={(event, newValue) => {
              setFormData((prev) => ({ ...prev, projects: newValue }));
            }}
            renderInput={(params) => <TextField {...params} label="Project" />}
          />
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button color="primary" onClick={handleEdit} disabled={loading}>
          {loading ? <CircularProgress /> : "Done"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
      row?.division?.division_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
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

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/user/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.users);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("usersChange", (updatedUsers) => {
      getUsers();
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
              <StyledTableCell>Sl No</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell align="left">Email</StyledTableCell>
              <StyledTableCell align="left">Level</StyledTableCell>
              <StyledTableCell align="left">Division</StyledTableCell>
              <StyledTableCell align="left">Departments</StyledTableCell>
              <StyledTableCell align="left">Projects</StyledTableCell>
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
                <StyledTableCell component="th" scope="row" align="left">
                  {index + 1}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row.email}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row.level?.level_name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row.division?.division_name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  <Grid
                    container
                    rowSpacing={1}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                  >
                    {row.departments?.map((department) => (
                      <Grid item xs={8}>
                        <Item>{department?.department_name}</Item>
                      </Grid>
                    ))}
                  </Grid>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  <Grid
                    container
                    rowSpacing={1}
                    columnSpacing={{ xs: 2, sm: 2, md: 3 }}
                  >
                    {row.projects?.map((project) => (
                      <Grid item xs={8}>
                        <Item>{project?.project_name}</Item>
                      </Grid>
                    ))}
                  </Grid>
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
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <AddModal open={open} setOpen={setOpen} />
      <EditModal open={openEdit} setOpen={setOpenEdit} user={selectedUser} />
    </div>
  );
}
