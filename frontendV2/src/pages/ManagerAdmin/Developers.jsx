import React from "react";
import ManagerAdminLayout from "./components/ManagerAdminLayout";
import DevelopersTable from "./components/DevelopersTable";

const Developers = () => {
  return (
    <ManagerAdminLayout>
      <DevelopersTable />
    </ManagerAdminLayout>
  );
};

export default Developers;
