import React from "react";
import Dashboard from "./components/Dashboard";
import ReqesterAdminLayout from "./components/RequesterAdminLayout";


const RequesterAdmin = () => {

  return (
    <>
      <ReqesterAdminLayout>
        <Dashboard />
      </ReqesterAdminLayout>
    </>
  );
};

export default RequesterAdmin;
