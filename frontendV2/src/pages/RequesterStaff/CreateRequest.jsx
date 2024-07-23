import React from "react";
import RequesterStaffLayot from "./components/RequesterStaffLayout";
import RequestTable from "./components/RequestTable";

const CreateRequest = () => {
  return (
    <RequesterStaffLayot> 
        <RequestTable/>
    </RequesterStaffLayot>
  );
};

export default CreateRequest;
