import React from "react";
import PrivateRoute from "./PrivateRoute";
import RequesterStaff from "../pages/RequesterStaff";
import CreateRequest from "../pages/RequesterStaff/CreateRequest";
import { Route, Routes } from "react-router-dom";
import MyProfile from "../pages/RequesterStaff/MyProfile";
import RequestTimeline from "../pages/RequesterStaff/RequestTimeline";
import MyHistory from "../pages/RequesterStaff/MyHistory";
function RequesterStaffRoutes() {
  return (
    <Routes>
      <Route path="" Component={PrivateRoute}>
        <Route path="/" Component={RequesterStaff} />
        <Route path="/create-requests" Component={CreateRequest} />
        <Route path="/my-profile" Component={MyProfile} />
        <Route path="/history" Component={MyHistory} />
        <Route path="/timeline/:_id" Component={RequestTimeline} />
      </Route>
    </Routes>
  );
}

export default RequesterStaffRoutes;
