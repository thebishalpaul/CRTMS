import React from "react";
import ManagerStaffLayout from "./components/ManagerStaffLayout";
import UsersTable from "./components/UsersTable";

const Users = () => {
  return (
    <ManagerStaffLayout>
      <UsersTable />
    </ManagerStaffLayout>
  );
};

export default Users;
