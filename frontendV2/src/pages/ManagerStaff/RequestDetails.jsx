import React from "react";
import ManagerStaffLayout from "./components/ManagerStaffLayout";
import RequestDescription from "./components/RequestDescription";

function RequestDetails() {
  return (
    <>
      <ManagerStaffLayout>
        <RequestDescription />
      </ManagerStaffLayout>
    </>
  );
}

export default RequestDetails;
