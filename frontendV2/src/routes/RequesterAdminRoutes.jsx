import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RequesterAdmin from "../pages/RequesterAdmin";
import Users from "../pages/RequesterAdmin/Users";
import CreateRequest from "../pages/RequesterAdmin/CreateRequest";
import ManageAcccess from "../pages/RequesterAdmin/ManageAccess";
import PendingRequest from "../pages/RequesterAdmin/PendingRequest";
import MyProfile from "../pages/RequesterAdmin/MyProfile";
import RequestTimeline from "../pages/RequesterAdmin/RequestTimeline";
import MyHistory from "../pages/RequesterAdmin/MyHistory";

const RequesterAdminRoutes = () => {
  return (
    <Routes>
      <Route path="" Component={PrivateRoute}>
        <Route path="/" Component={RequesterAdmin} />
        <Route path="/users" Component={Users} />
        <Route path="/create-requests" Component={CreateRequest} />
        <Route path="/manage-access" Component={ManageAcccess} />
        <Route path="/pending-request" Component={PendingRequest} />
        <Route path="/history" Component={MyHistory} />
        <Route path="/timeline/:_id" Component={RequestTimeline} />
        <Route path="/my-profile" Component={MyProfile} />
      </Route>
    </Routes>
  );
};

export default RequesterAdminRoutes;
