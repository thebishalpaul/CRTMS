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
import { Box, CircularProgress, Typography } from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

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
  const [instituteName, setInstituteName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setInstituteName("");
  };
  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/institute/manager",
        {
          email,
          instituteName,
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
      setInstituteName("");
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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create a new institute</DialogTitle>
      <DialogContent>
        <TextField
          label="Institute Name"
          fullWidth
          margin="normal"
          value={instituteName}
          onChange={(e) => setInstituteName(e.target.value)}
        />
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

export default function InstituteTable() {
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
      const response = await axios.get(`/api/v1/institute/manager`, {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setRows(response.data.institutes);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Some error occurred");
    }
  };

  useEffect(() => {
    getInstitutes();
  }, [open]);

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
          sx={{ backgroundColor: "white"}}
        />
        <Button
          variant="contained"
          color="inherit"
          onClick={() => setOpen(true)}
          startIcon={<AddBusinessIcon />}
        >
          Create Institute
        </Button>
        <AddModal open={open} setOpen={setOpen} />
      </Box>

      {filteredRows.length === 0 ? (
        <Typography variant="h6" align="center">
          No Institute Created
        </Typography>
      ) : (
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
                    {row.admin?.name}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.admin?.email}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row?.address || "Not given"}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row?.contact_info || "Not given"}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
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
