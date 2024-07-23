import React from "react";
import DeveloperLayout from "./components/DeveloperLayout";
import TaskTable from "./components/TaskTable/TaskTable";

const Tasks = () => {
  return (
    <DeveloperLayout>
      <TaskTable />
    </DeveloperLayout>
  );
};

export default Tasks;
