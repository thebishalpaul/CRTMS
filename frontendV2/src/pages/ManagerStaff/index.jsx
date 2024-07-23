import React from "react";
import Dashboard from "./components/Dashboard";
import ManagerStaffLayout from "./components/ManagerStaffLayout";

const ManagerStaff = () => {
  return (
    <>
      <ManagerStaffLayout>
        <Dashboard />
      </ManagerStaffLayout>
    </>
  );
};

export default ManagerStaff;
