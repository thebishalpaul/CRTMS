import React from "react";
import ManagerStaffLayout from "./components/ManagerStaffLayout";
import DepartmentsTable from "./components/DepartmentsTable";

const Departments = () => {
  return (
    <ManagerStaffLayout>
      <DepartmentsTable />
    </ManagerStaffLayout>
  );
};

export default Departments;
