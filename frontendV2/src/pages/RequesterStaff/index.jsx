import React from "react";
import Dashboard from "./components/Dashboard";
import ReqesterStaffLayout from "./components/RequesterStaffLayout"

const RequesterStaff = () => {
    return (
        <>
            <ReqesterStaffLayout>
                <Dashboard />
            </ReqesterStaffLayout>
        </>
    );
};

export default RequesterStaff;
