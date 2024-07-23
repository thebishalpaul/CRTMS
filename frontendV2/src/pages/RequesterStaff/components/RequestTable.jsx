import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Typography,
  TablePagination,
  Link,
  CircularProgress,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RequestForm from "./RequestForm";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import PdfModal from "../../../components/Global/PdfModal";
import { getUser } from "../../../slices/userSlice";
import { MoreVert, Timeline } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";

const RequestTable = ({ access }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [alignment, setAlignment] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [requestArr, setRequestArr] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const navigate = useNavigate();

  const handleAlignment = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      filterRequests(newAlignment, searchQuery);
    }
  };
  // console.log(access);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const handleClick = (e, request) => {
    setSelectedRequest(request);
    setMenuAnchor(e.target);
  };

  const handleClose = () => {
    setMenuAnchor(null);
    setSelectedRequest(null);
  };

  const filterRequests = (type, query) => {
    let filtered = requestArr;
    if (type !== "All") {
      filtered = filtered.filter(
        (request) => request.requestType.toLowerCase() === type
      );
    }
    if (query) {
      filtered = filtered.filter((request) =>
        request.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredRequests(filtered);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterRequests(alignment, query);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/v1/request/requester-staff-requests",
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      console.log(response.data.requests);
      if (response.data.success) {
        setRequestArr(response.data.requests);
        setFilteredRequests(response.data.requests);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfClick = (pdfName) => {
    const pdfUrl = `http://localhost:8000/uploads/${pdfName}`;
    console.log(`File URL: ${pdfUrl}`);
    setPdfUrl(pdfUrl);
    setPdfModalOpen(true);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Paper style={{ padding: "20px", margin: "2rem" }}>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Grid item>
          <Typography variant="h6">Requests List</Typography>
          <Typography variant="body2">
            See information about your Requests
          </Typography>
        </Grid>
        <Grid item>
          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="text alignment"
          >
            <ToggleButton value="All" aria-label="all">
              All
            </ToggleButton>
            <ToggleButton value="change" aria-label="change">
              Change
            </ToggleButton>
            <ToggleButton value="ticket" aria-label="ticket">
              Ticket
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            style={{ backgroundColor: "black", color: "white" }}
            onClick={() => setOpen(true)}
            startIcon={<AddIcon />}
          >
            Create Request
          </Button>
          <RequestForm
            open={open}
            setOpen={setOpen}
            fetchRequests={fetchRequests}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Search by title"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: <SearchIcon />,
            }}
          />
        </Grid>
      </Grid>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead style={{ backgroundColor: "#ECEFF1" }}>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Attachments</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No Request Created
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? filteredRequests.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : filteredRequests
                  ).map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>{member.title}</TableCell>
                      <TableCell>{member.description}</TableCell>
                      <TableCell>
                        <ul key={member._id}>
                          {member.attachments.length === 0 ? (
                            <li>No attachment uploaded</li>
                          ) : (
                            member.attachments.map((att) => {
                              const fileNameParts = att.name.split("-");
                              const displayedName = fileNameParts
                                .slice(1)
                                .join("-");
                              return (
                                <li key={att._id}>
                                  <Link
                                    onClick={() => handlePdfClick(att.name)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {displayedName}
                                  </Link>
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </TableCell>
                      <TableCell>{member.status}</TableCell>
                      <TableCell>{member.projectId.project_name}</TableCell>
                      <TableCell>{formatDate(member.createdAt)}</TableCell>

                      <TableCell align="right">
                        <IconButton onClick={(e) => handleClick(e, member)}>
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor}
                          open={Boolean(menuAnchor)}
                          onClose={handleClose}
                        >
                          <MenuItem
                            onClick={() =>
                              navigate(
                                `/${user?.role}/timeline/${selectedRequest?._id}`
                              )
                            }
                            sx={{ display: "flex", gap: "5px" }}
                          >
                            <Timeline />
                            Timeline
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
            component="div"
            count={filteredRequests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      {pdfUrl && (
        <PdfModal
          open={pdfModalOpen}
          handleClose={() => setPdfModalOpen(false)}
          pdfUrl={pdfUrl}
        />
      )}
    </Paper>
  );
};

export default RequestTable;
