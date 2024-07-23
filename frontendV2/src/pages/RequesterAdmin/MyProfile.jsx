import React from "react";
import Profile from "../../components/Layout/Profile";
import RequesterAdminLayout from "./components/RequesterAdminLayout";

const MyProfile = () => {
  return (
    <RequesterAdminLayout>
      <Profile />
    </RequesterAdminLayout>
  );
};

export default MyProfile;
