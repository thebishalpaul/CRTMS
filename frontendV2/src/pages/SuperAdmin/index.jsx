import Dashboard from "./components/Dashboard";
import SuperAdminLayout from "./components/SuperAdminLayout";

const SuperAdmin = () => {
  return (
    <>
      <SuperAdminLayout>
        <Dashboard />
      </SuperAdminLayout>
    </>
  );
};

export default SuperAdmin;
