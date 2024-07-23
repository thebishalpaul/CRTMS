import { Route, Routes } from "react-router-dom";
import SuperAdmin from "../pages/SuperAdmin";
import Institutes from "../pages/SuperAdmin/Institutes";
import PrivateRoute from "./PrivateRoute";

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route path="" Component={PrivateRoute}>
        <Route path="/" Component={SuperAdmin} />
        <Route path="/institutes" Component={Institutes} />
      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;
