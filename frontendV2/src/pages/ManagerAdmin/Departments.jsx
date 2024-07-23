import React from "react";
import ManagerAdminLayout from "./components/ManagerAdminLayout";
import DepartmentsTable from "./components/DepartmentsTable";

const Departments = () => {
  return (
    <ManagerAdminLayout>
      <DepartmentsTable />
    </ManagerAdminLayout>
  );
};

export default Departments;
