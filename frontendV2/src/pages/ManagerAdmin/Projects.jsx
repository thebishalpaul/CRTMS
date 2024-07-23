import React from "react";
import ManagerAdminLayout from "./components/ManagerAdminLayout";
import ProjectsTable from "./components/ProjectsTable";

const Projects = () => {
  return (
    <ManagerAdminLayout>
      <ProjectsTable />
    </ManagerAdminLayout>
  );
};

export default Projects;
