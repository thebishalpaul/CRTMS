import React from "react";
import UsersTable from "./components/UsersTable";
import RequesterAdminLayot from "./components/RequesterAdminLayout";

const Users = () => {
  return (
    <RequesterAdminLayot>
      <UsersTable />
    </RequesterAdminLayot>
  );
};

export default Users;
