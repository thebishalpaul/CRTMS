import React, { useEffect, useState } from "react";
import clsx from "clsx";

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
  MenuItem,
  Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import PdfModal from "../../../../components/Global/PdfModal";
import { DoneAll, MoreVert, Timeline } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import { FileOpen } from "@mui/icons-material";
import { REQUEST_TYPE } from "../../../../utils";

const RequestTable = () => {
  const user = useSelector((state) => state.user);
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
      const response = await axios.get("/api/v1/request/all", {
        headers: {
          Authorization: `${user?.token}`,
        },
      });
      console.log(response.data.requests);
      if (response.data.success) {
        const fetchedRequest = response.data.requests;
        const sortOrder = {
          "awaiting-approval": 6,
          approved: 2,
          "in-progress": 3,
          rejected: 5,
          "complete-requested": 1,
          completed: 4,
        };
        fetchedRequest.sort((a, b) => {
          return sortOrder[a.status] - sortOrder[b.status];
        });
        setRequestArr(fetchedRequest);
        setFilteredRequests(fetchedRequest);
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

  const approveCompleteRequest = async () => {
    try {
      const response = await axios.put(
        `/api/v1/request/change-status/${selectedRequest?._id}`,
        {
          status: "completed",
        },
        {
          headers: {
            Authorization: `${user?.token}`,
          },
        }
      );
      if (response.data?.success) {
        toast.success(response.data?.message || "Updated successfully");
        fetchRequests();
      }
    } catch (error) {
      console.error("Some error occurred");
    } finally {
      handleClose();
    }
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
            See information about all Requests
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
                  <TableCell>Sl No.</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Institute Name</TableCell>
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
                  ).map((member, index) => (
                    <TableRow key={member._id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{member.title}</TableCell>
                      <TableCell>{member.description}</TableCell>
                      <TableCell>
                        {member.createdBy.name}
                        <br />
                        {member.createdBy.email}
                      </TableCell>
                      <TableCell>{member.institute.institute_name}</TableCell>
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
                      <TableCell>
                        <div className={clsx("flex items-center gap-2")}>
                          <div
                            className={clsx(
                              "w-4 h-4 rounded-full",
                              REQUEST_TYPE[member?.status]
                            )}
                          />
                          <span className="text-black uppercase">
                            {member.status == "approved"
                              ? "received"
                              : member.status}
                          </span>
                        </div>
                      </TableCell>
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
                                `/${user?.role}/request/${selectedRequest?._id}`
                              )
                            }
                            sx={{ display: "flex", gap: "5px" }}
                          >
                            <FileOpen />
                            Open request
                          </MenuItem>
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
                          {selectedRequest?.status === "complete-requested" && (
                            <MenuItem
                              onClick={approveCompleteRequest}
                              sx={{ display: "flex", gap: "5px" }}
                            >
                              <DoneAll />
                              Approve
                            </MenuItem>
                          )}
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
