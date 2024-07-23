import { Routes, Route, useLocation } from "react-router-dom";
import MainPage from "./pages/Home/MainPage";
import NotFound from "./pages/NotFound/NotFound";
import Signin from "./pages/Signin/Signin";
import { useEffect } from "react";
import ManagerAdminRoutes from "./routes/ManagerAdminRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import ManagerStaffRoutes from "./routes/ManagerStaffRoutes";
import RequesterAdminRoutes from "./routes/RequesterAdminRoutes";
import RequesterStaffRoutes from "./routes/RequesterStaffRoutes";
import DeveloperRoutes from "./routes/DeveloperRoutes";

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/super-admin/*" Component={SuperAdminRoutes} />
        <Route path="/manager-admin/*" Component={ManagerAdminRoutes} />
        <Route path="/manager-staff/*" Component={ManagerStaffRoutes} />
        <Route path="/requester-admin/*" Component={RequesterAdminRoutes} />
        <Route path="/requester-staff/*" Component={RequesterStaffRoutes} />
        <Route path="/developer/*" Component={DeveloperRoutes} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
