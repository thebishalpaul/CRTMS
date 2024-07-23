import { Route, Routes } from "react-router-dom";
import Developer from "../pages/Developer";
import PrivateRoute from "./PrivateRoute";
import { AccessProvider } from "../context/AccessContext";
import MyProfile from "../pages/Developer/MyProfile";
import Tasks from "../pages/Developer/Tasks";
import TaskDetails from "../pages/Developer/TaskDetails";

const DeveloperRoutes = () => {
  return (
    <AccessProvider>
      <Routes>
        <Route path="" Component={PrivateRoute}>
          <Route path="/" Component={Developer} />
          <Route path="/my-profile" Component={MyProfile} />
          <Route path="/tasks" Component={Tasks} />
          <Route path="/task/:id" Component={TaskDetails} />
        </Route>
      </Routes>
    </AccessProvider>
  );
};

export default DeveloperRoutes;
