import React from "react";
import ManagerAdminLayout from "./components/ManagerAdminLayout";
import DivisionsTable from "./components/DivisionsTable";

const Divisions = () => {
  return (
    <ManagerAdminLayout>
      <DivisionsTable />
    </ManagerAdminLayout>
  );
};

export default Divisions;
