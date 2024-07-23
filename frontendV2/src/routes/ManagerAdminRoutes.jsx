import { Route, Routes } from "react-router-dom";
import ManagerAdmin from "../pages/ManagerAdmin";
import Institutes from "../pages/ManagerAdmin/Institutes";
import Projects from "../pages/ManagerAdmin/Projects";
import Users from "../pages/ManagerAdmin/Users";
import Divisions from "../pages/ManagerAdmin/Divisions";
import Departments from "../pages/ManagerAdmin/Departments";
import Levels from "../pages/ManagerAdmin/Levels";
import Configure from "../pages/ManagerAdmin/Configure";
import PrivateRoute from "./PrivateRoute";
import Developers from "../pages/ManagerAdmin/Developers";
import Request from "../pages/ManagerAdmin/Request";
import MyProfile from "../pages/ManagerAdmin/MyProfile";
import Task from "../pages/ManagerAdmin/Task";
import TaskDetails from "../pages/ManagerAdmin/TaskDetails";
import RequestTimeline from "../pages/ManagerAdmin/RequestTimeline";
import MyHistory from "../pages/ManagerAdmin/MyHistory";
import RequestDetails from "../pages/ManagerAdmin/RequestDetails";

const ManagerAdminRoutes = () => {
  return (
    <Routes>
      <Route path="" Component={PrivateRoute}>
        <Route path="/" Component={ManagerAdmin} />
        <Route path="/institutes" Component={Institutes} />
        <Route path="/projects" Component={Projects} />
        <Route path="/users" Component={Users} />
        <Route path="/developers" Component={Developers} />
        <Route path="/divisions" Component={Divisions} />
        <Route path="/departments" Component={Departments} />
        <Route path="/levels" Component={Levels} />
        <Route path="/configure" Component={Configure} />
        <Route path="/request" Component={Request} />
        <Route path="/request/:id" Component={RequestDetails} />
        <Route path="/my-profile" Component={MyProfile} />
        <Route path="/task" Component={Task} />
        <Route path="/task/:id" Component={TaskDetails} />
        <Route path="/history" Component={MyHistory} />
        <Route path="/timeline/:_id" Component={RequestTimeline} />
      </Route>
    </Routes>
  );
};

export default ManagerAdminRoutes;
