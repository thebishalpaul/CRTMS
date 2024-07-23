import React from "react";
import ManagerStaffLayout from "./components/ManagerStaffLayout";
import ProjectsTable from "./components/ProjectsTable";

const Projects = () => {
  return (
    <ManagerStaffLayout>
      <ProjectsTable />
    </ManagerStaffLayout>
  );
};

export default Projects;
