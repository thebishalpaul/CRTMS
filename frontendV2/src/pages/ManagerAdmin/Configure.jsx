import React from "react";
import ManagerAdminLayout from "./components/ManagerAdminLayout";
import { Typography } from "@mui/material";
import AssignmentTable from "./components/AssignmentTable";
import AccessTable from "./components/AccessTable";

const Configure = () => {
  return (
    <ManagerAdminLayout>
      <Typography
        variant="h5"
        component="h5"
        sx={{
          bgcolor: "grey",
          padding: "10px",
          borderRadius: "10px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Assign Roles
      </Typography>
      <AssignmentTable />
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
    </ManagerAdminLayout>
  );
};

export default Configure;
