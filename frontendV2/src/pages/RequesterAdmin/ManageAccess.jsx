import React from "react";
import RequesterAdminLayot from "./components/RequesterAdminLayout";
import AccessDashboard from "./components/AccessTable";

const ManageAcccess = () => {
  return (
    <RequesterAdminLayot>
      <AccessDashboard />
    </RequesterAdminLayot>
  );
};

export default ManageAcccess;
