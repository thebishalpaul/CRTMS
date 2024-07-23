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
  MenuItem,
  Select,
} from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import io from "socket.io-client";
import DeleteIcon from "@mui/icons-material/Delete";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";

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
  const [divisionName, setDivisionName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setDivisionName("");
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/division/create",
        {
          divisionName,
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );

      toast.success(response?.data?.message);
      setOpen(false);
      setDivisionName("");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Some error occurred while creating a new institute"
      );
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Create a new division</DialogTitle>
      <DialogContent>
        <TextField
          label="Division Name"
          fullWidth
          margin="normal"
          value={divisionName}
          onChange={(e) => setDivisionName(e.target.value)}
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

const EditModal = ({ open, setOpen }) => {};

export default function DivisionsTable() {
  const user = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);

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

  const filteredRows = rows?.filter((row) =>
    row?.division_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (_id) => {
    setLoading(_id);
    try {
      const response = await axios.delete(`/api/v1/division/${_id}`, {
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
    setLoading(false);
  };

  const getDivisions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/division/all`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.divisions);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          Create Division
        </Button>
        <AddModal open={open} setOpen={setOpen} />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Sl No</StyledTableCell>
              <StyledTableCell>Division Name</StyledTableCell>
              <StyledTableCell align="left">Managed by</StyledTableCell>
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
                  {row.division_name}
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
                <StyledTableCell align="right">
                  <IconButton
                    onClick={() => handleDelete(row._id)}
                    disabled={row?._id === loading}
                  >
                    {row?._id === loading ? (
                      <CircularProgress />
                    ) : (
                      <DeleteIcon />
                    )}
                  </IconButton>
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
