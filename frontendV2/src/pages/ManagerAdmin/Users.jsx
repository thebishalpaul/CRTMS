import React from "react";
import ManagerAdminLayout from "./components/ManagerAdminLayout";
import UsersTable from "./components/UsersTable";

const Users = () => {
  return (
    <ManagerAdminLayout>
      <UsersTable />
    </ManagerAdminLayout>
  );
};

export default Users;
