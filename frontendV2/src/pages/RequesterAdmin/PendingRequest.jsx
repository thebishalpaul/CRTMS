import React from "react";
import RequesterAdminLayot from "./components/RequesterAdminLayout";
import PendingRequestDashboard from "./components/PendingRequestDashboard";

const PendingRequest = () => {
  return (
    <RequesterAdminLayot>
      <PendingRequestDashboard />
    </RequesterAdminLayot>
  );
};

export default PendingRequest;
