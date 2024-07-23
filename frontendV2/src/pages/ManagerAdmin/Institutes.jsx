import React from "react";
import InstitutesTable from "./components/InstitutesTable";
import ManagerAdminLayout from "./components/ManagerAdminLayout";

const Institutes = () => {
  return (
    <>
      <ManagerAdminLayout>
        <InstitutesTable />
      </ManagerAdminLayout>
    </>
  );
};

export default Institutes;
