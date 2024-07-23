import React, { useState, useEffect } from 'react';
import {
    Box,
    Checkbox,
    FormControlLabel,
    Typography,
    Paper,
    Grid,
    Divider,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import { useSelector } from 'react-redux';

const AccessDashboard = () => {
    const user = useSelector((state) => state.user);
    const [editMode, setEditMode] = useState(false);
    const { toast } = useToast();
    const [selections, setSelections] = useState({ change: '', ticket: '' });

    const fetchRequestFlow = async () => {
        try {
            const response = await axios.get('/api/v1/institute/requestFlow', {
                headers: {
                    Authorization: `${user?.token}`,
                },
            });
            if (response.data.success) {
                const { change_request, ticket_request } = response.data.access;
                const change = change_request ? 'Need approval' : 'Need no approval';
                const ticket = ticket_request ? 'Need approval' : 'Need no approval';
                setSelections({ change, ticket });
            } else {
                toast.error("Failed to fetch request flow settings");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Some error occurred");
        }
    };
    
    useEffect(() => {
        fetchRequestFlow();
    }, []);

    const handleChangeSelection = (value) => {
        setSelections((prevSelections) => ({ ...prevSelections, change: value }));
    };

    const handleTicketSelection = (value) => {
        setSelections((prevSelections) => ({ ...prevSelections, ticket: value }));
    };

    const updateRequestFlow = async (changeRequest, ticketRequest) => {
        try {
            const requestData = {
                request_flow: {
                    change_request: changeRequest,
                    ticket_request: ticketRequest,
                },
            };
            const response = await axios.put('/api/v1/institute/requestFlow', requestData, {
                headers: {
                    Authorization: `${user?.token}`,
                },
            });

            if (response.data.success) {
                toast.success("Request flow updated successfully");
            } else {
                toast.error(error?.response?.data?.message || "Failed to update request flow");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Some error occurred");
            console.error(error);
        }
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
    };

    const confirmChanges = () => {
        updateRequestFlow(selections.change === 'Need approval', selections.ticket === 'Need approval');
        fetchRequestFlow();
        setEditMode(false);
    };

    const cancelChanges = () => {
        setEditMode(false);
        fetchRequestFlow();
    };

    return (
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: '90%', margin: '0 auto', border: '2px orange solid' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ mb: 3 }} gutterBottom>
                    Accept Request Flow
                </Typography>
                <Box>
                    {editMode ? (
                        <Box sx={{ mb: 3 }}>
                            <IconButton onClick={confirmChanges} sx={{ mr: 3 }}>
                                <CheckIcon />
                            </IconButton>
                            <IconButton onClick={cancelChanges}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    ) : (
                        <IconButton sx={{ mb: 3 }} onClick={toggleEditMode}>
                            <EditIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>
            <Box>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Change
                        </Typography>
                    </Grid>
                    {['Need approval', 'Need no approval'].map((option) => (
                        <Grid item xs={4} key={option}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selections.change === option}
                                        onChange={() => handleChangeSelection(option)}
                                        disabled={!editMode}
                                    />
                                }
                                label={option}
                            />
                        </Grid>
                    ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Ticket
                        </Typography>
                    </Grid>
                    {['Need approval', 'Need no approval'].map((option) => (
                        <Grid item xs={4} key={option}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selections.ticket === option}
                                        onChange={() => handleTicketSelection(option)}
                                        disabled={!editMode}
                                    />
                                }
                                label={option}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Paper>
    );
};

export default AccessDashboard;
