import React from "react";
import RequesterAdminLayot from "./components/RequesterAdminLayout";
import RequestTable from "./components/RequestTable";

const CreateRequest = () => {
  return (
    <RequesterAdminLayot> 
        <RequestTable/>
    </RequesterAdminLayot>
  );
};

export default CreateRequest;