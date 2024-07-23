import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Grid,
  Divider,
} from '@mui/material';

const AccessDashboard = () => {

  const [changeSelection, setChangeSelection] = useState('Yes');
  const [taskSelection, setTaskSelection] = useState('No');

  const handleChangeSelection = (value) => {
    setChangeSelection(value);
  };

  const handleTaskSelection = (value) => {
    setTaskSelection(value);
  };


  return (
    <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: '90%', margin: '0 auto', border: '2px orange solid' }}>
      <Typography variant="h6" sx={{ mb: 3 }} gutterBottom>
        Accept Request Flow
      </Typography>
      <Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Change
            </Typography>
          </Grid>
          {['Yes', 'No'].map((option) => (
            <Grid item xs={2} key={option}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={changeSelection === option}
                    onChange={() => handleChangeSelection(option)}
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
              Task
            </Typography>
          </Grid>
          {['Yes', 'No'].map((option) => (
            <Grid item xs={2} key={option}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={taskSelection === option}
                    onChange={() => handleTaskSelection(option)}
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
