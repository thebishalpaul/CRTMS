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

const AddModal = ({ open, setOpen, getDepartments }) => {
  const user = useSelector((state) => state.user);
  const [departmentName, setDepartmentName] = useState("");
  const [email, setEmail] = useState("");

  const [divisionArr, setDivisionArr] = useState([]);
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setDepartmentName("");
    setDivision(null);
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/department/create",
        {
          departmentName,
          division,
          email,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      toast.success(response?.data?.message);
      setOpen(false);
      setDepartmentName("");
      setDivision(null);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Some error occurred while creating a new institute"
      );
    } finally {
      getDepartments();
      setLoading(false);
    }
  };

  const getDivisions = async () => {
    try {
      const response = await axios.get(`/api/v1/division/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setDivisionArr(response.data.divisions);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getDivisions();
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Create a new department</DialogTitle>
      <DialogContent>
        <TextField
          label="Department Name"
          fullWidth
          margin="normal"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
        />
        <TextField
          label="Email of the outsider admin (or the approver)"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {divisionArr?.length > 0 ? (
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Division</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              {divisionArr?.map((division) => (
                <MenuItem key={division?._id} value={division._id}>
                  {division?.division_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Alert severity="error">No divisions are there</Alert>
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

const EditModal = ({ open, setOpen, department, getDepartments }) => {
  console.log(department);
  const user = useSelector((state) => state.user);
  const [departmentName, setDepartmentName] = useState("");
  const [email, setEmail] = useState("");
  const [divisionArr, setDivisionArr] = useState([]);
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (department) {
      console.log(department);
      setDepartmentName(department.department_name);
      setDivision(department.division?._id || null);
    }
  }, [open]);
  const handleClose = () => {
    setOpen(false);
    setDepartmentName("");
    setDivision(null);
  };
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/v1/department/${department?._id}`,
        {
          departmentName,
          division,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );

      toast.success(response?.data?.message);
      setOpen(false);
      setDepartmentName("");
      setDivision(null);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Some error occurred while updating department"
      );
    } finally {
      getDepartments();
      setLoading(false);
    }
  };
  const getDivisions = async () => {
    try {
      const response = await axios.get(`/api/v1/division/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setDivisionArr(response.data.divisions);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getDivisions();
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Edit department</DialogTitle>
      <DialogContent>
        <TextField
          label="Department Name"
          fullWidth
          margin="normal"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
        />
        {divisionArr?.length > 0 ? (
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Division</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              {divisionArr?.map((division) => (
                <MenuItem key={division?._id} value={division._id}>
                  {division?.division_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Alert severity="error">No divisions are there</Alert>
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

export default function DepartmentsTable({ access }) {
  const user = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
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

  const handleClick = (e, department) => {
    setSelectedDepartment(department);
    setMenuAnchor(e.target);
  };

  const handleClose = () => {
    setMenuAnchor(null);
    setSelectedDepartment(null);
  };

  const filteredRows = rows?.filter((row) =>
    row?.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = () => {
    setOpenEdit(true);
    setMenuAnchor(null);
  };

  const handleDelete = async () => {
    setMenuAnchor(null);
    const _id = selectedDepartment?._id;

    try {
      const response = await axios.delete(`/api/v1/department/${_id}`, {
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
    } finally {
      getDepartments();
      setSelectedDepartment(null);
      setLoading(false);
    }
  };

  const getDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/department/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.departments);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDepartments();
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
        {access?.create_department && (
          <Button
            variant="contained"
            color="inherit"
            onClick={() => setOpen(true)}
            startIcon={<AddToPhotosIcon />}
          >
            Create Department
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Sl No</StyledTableCell>
              <StyledTableCell>Department Name</StyledTableCell>
              <StyledTableCell align="left">Division Name</StyledTableCell>
              <StyledTableCell align="left">Managed By</StyledTableCell>
              <StyledTableCell align="left">Outsider Admin</StyledTableCell>
              {access?.create_department && (
                <StyledTableCell align="right"></StyledTableCell>
              )}
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
                  {row.department_name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row?.division?.division_name || (
                    <Alert sx={{ width: "fit-content" }} severity="warning">
                      Not added
                    </Alert>
                  )}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
                  {row?.managed_by?.name ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: `<b>Name:</b> ${row?.managed_by?.name}<br/> <b>Email:</b> ${row?.managed_by?.email}`,
                      }}
                    />
                  ) : (
                    <Alert sx={{ width: "fit-content" }} severity="warning">
                      Not added or deleted
                    </Alert>
                  )}
                </StyledTableCell>

                <StyledTableCell component="th" scope="row" align="left">
                  {row?.requesterInstitute?.admin ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: `<b>Name:</b> ${row.requesterInstitute.admin.name}<br/> <b>Email:</b> ${row.requesterInstitute.admin.email}`,
                      }}
                    />
                  ) : (
                    <Alert sx={{ width: "fit-content" }} severity="warning">
                      Not added or deleted
                    </Alert>
                  )}
                </StyledTableCell>

                {access?.create_department && (
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
                )}
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
      <AddModal open={open} setOpen={setOpen} getDepartments={getDepartments} />
      <EditModal
        open={openEdit}
        setOpen={setOpenEdit}
        department={selectedDepartment}
        getDepartments={getDepartments}
      />
    </div>
  );
}
