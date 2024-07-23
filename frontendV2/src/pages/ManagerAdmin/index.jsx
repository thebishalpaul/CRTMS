import React from "react";
import ManagerAdminLayout from "./components/ManagerAdminLayout";
import Dashboard from "./components/Dashboard";

const ManagerAdmin = () => {
  return (
    <>
      <ManagerAdminLayout>
        <Dashboard />
      </ManagerAdminLayout>
    </>
  );
};

export default ManagerAdmin;
