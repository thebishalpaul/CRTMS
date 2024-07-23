import React from "react";
import SuperAdminLayout from "./components/SuperAdminLayout";
import InstitutesTable from "./components/InstitutesTable";

const Institutes = () => {
  return (
    <>
      <SuperAdminLayout>
        <InstitutesTable />
      </SuperAdminLayout>
    </>
  );
};

export default Institutes;
