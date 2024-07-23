import React from "react";
import ManagerStaffLayout from "./components/ManagerStaffLayout";
import { Typography } from "@mui/material";
import AccessTable from "./components/AccessTable";

const Configure = () => {
  return (
    <ManagerStaffLayout>
      <Typography
        variant="h5"
        component="h5"
        sx={{
          bgcolor: "grey",
          padding: "10px",
          marginTop: "20px",
          borderRadius: "10px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Manage Access
      </Typography>
      <AccessTable />
    </ManagerStaffLayout>
  );
};

export default Configure;
