import { Route, Routes } from "react-router-dom";
import ManagerStaff from "../pages/ManagerStaff";
import Users from "../pages/ManagerStaff/Users";
import Projects from "../pages/ManagerStaff/Projects";
import Departments from "../pages/ManagerStaff/Departments";
import Divisions from "../pages/ManagerStaff/Divisions";
import Levels from "../pages/ManagerStaff/Levels";
import Institutes from "../pages/ManagerStaff/Institutes";
import PrivateRoute from "./PrivateRoute";
import Request from "../pages/ManagerStaff/Request";
import { AccessProvider } from "../context/AccessContext";
import MyProfile from "../pages/ManagerStaff/MyProfile";
import RequestTimeline from "../pages/ManagerStaff/RequestTimeline";
import Task from "../pages/ManagerStaff/Task";
import TaskDetails from "../pages/ManagerStaff/TaskDetails";
import Developers from "../pages/ManagerStaff/Developers";
import MyHistory from "../pages/ManagerStaff/MyHistory";
import RequestDetails from "../pages/ManagerStaff/RequestDetails";
import Configure from "../pages/ManagerStaff/Configure";

const ManagerStaffRoutes = () => {
  return (
    <AccessProvider>
      <Routes>
        <Route path="" Component={PrivateRoute}>
          <Route path="/" Component={ManagerStaff} />
          <Route path="/users" Component={Users} />
          <Route path="/developers" Component={Developers} />
          <Route path="/projects" Component={Projects} />
          <Route path="/departments" Component={Departments} />
          <Route path="/configure" Component={Configure} />
          <Route path="/divisions" Component={Divisions} />
          <Route path="/levels" Component={Levels} />
          <Route path="/institutes" Component={Institutes} />
          <Route path="/request" Component={Request} />
          <Route path="/request/:id" Component={RequestDetails} />
          <Route path="/history" Component={MyHistory} />
          <Route path="/my-profile" Component={MyProfile} />
          <Route path="/task" Component={Task} />
          <Route path="/task/:id" Component={TaskDetails} />
          <Route path="/timeline/:_id" Component={RequestTimeline} />
        </Route>
      </Routes>
    </AccessProvider>
  );
};

export default ManagerStaffRoutes;
