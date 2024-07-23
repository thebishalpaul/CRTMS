import React from "react";
import InstitutesTable from "./components/InstitutesTable";
import ManagerStaffLayout from "./components/ManagerStaffLayout";

const Institutes = () => {
  return (
    <>
      <ManagerStaffLayout>
        <InstitutesTable />
      </ManagerStaffLayout>
    </>
  );
};

export default Institutes;
