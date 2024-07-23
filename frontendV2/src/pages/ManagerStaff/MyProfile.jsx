import React from "react";
import Profile from "../../components/Layout/Profile";
import ManagerStaffLayout from "./components/ManagerStaffLayout";

const MyProfile = () => {
  return (
    <ManagerStaffLayout>
      <Profile />
    </ManagerStaffLayout>
  );
};

export default MyProfile;
