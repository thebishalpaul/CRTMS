import React from "react";
import ManagerAdminLayout from "./components/ManagerAdminLayout";
import RequestDescription from "./components/RequestDescription";

function RequestDetails() {
  return (
    <>
      <ManagerAdminLayout>
        <RequestDescription />
      </ManagerAdminLayout>
    </>
  );
}

export default RequestDetails;
