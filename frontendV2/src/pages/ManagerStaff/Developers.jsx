import React from "react";
import ManagerStaffLayout from "./components/ManagerStaffLayout";
import DevelopersTable from "./components/DevelopersTable";

const Developers = () => {
  return (
    <ManagerStaffLayout>
      <DevelopersTable />
    </ManagerStaffLayout>
  );
};

export default Developers;
