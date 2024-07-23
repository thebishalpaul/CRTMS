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
import { Alert, Autocomplete, Box, CircularProgress } from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import io from "socket.io-client";

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
  const [email, setEmail] = useState("");
  const [departmentArr, setDepartmentArr] = useState([]);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setDepartment(null);
  };
  const handleAdd = async () => {
    console.log(department);
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/institute/requester",
        {
          email,
          department,
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
      setDepartment(null);
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
      <DialogTitle>Create a new institute</DialogTitle>
      <DialogContent>
        {departmentArr?.length > 0 ? (
          <Autocomplete
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
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

export default function InstituteTable({ access }) {
  const user = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { toast } = useToast();

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

  const filteredRows = rows?.filter(
    (row) =>
      row?.institute_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.admin?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row?.admin?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInstitutes = async () => {
    try {
      const response = await axios.get(`/api/v1/institute/requester`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.institutes);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getInstitutes();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("institutesChange", (updatedInstitutes) => {
      getInstitutes();
    });

    return () => {
      socket.disconnect();
    };
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
          sx={{ backgroundColor: "white" }}
        />
        {access?.create_institute && (
          <Button
            variant="contained"
            color="inherit"
            onClick={() => setOpen(true)}
            startIcon={<AddBusinessIcon />}
          >
            Create Institute
          </Button>
        )}
        <AddModal open={open} setOpen={setOpen} />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Institute Name</StyledTableCell>
              <StyledTableCell align="right">Admin Name</StyledTableCell>
              <StyledTableCell align="right">Admin Email</StyledTableCell>
              <StyledTableCell align="right">Address</StyledTableCell>
              <StyledTableCell align="right">Contact Info</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredRows.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : filteredRows
            ).map((row) => (
              <StyledTableRow key={row._id}>
                <StyledTableCell component="th" scope="row">
                  {row.institute_name}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {row.admin.name}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {row.admin.email}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {row.address || "Not given"}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {row.contact_info || "Not given"}
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
    </div>
  );
}
