import React from "react";
import Profile from "../../components/Layout/Profile";
import RequesterStaffLayout from "./components/RequesterStaffLayout";

const MyProfile = () => {
  return (
    <RequesterStaffLayout>
      <Profile />
    </RequesterStaffLayout>
  );
};

export default MyProfile;
