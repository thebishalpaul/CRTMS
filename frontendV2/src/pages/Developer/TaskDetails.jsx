import React from "react";
import DeveloperLayout from "./components/DeveloperLayout";
import TaskDescription from "./components/TaskDescription/TaskDescription";

function TaskDetails() {
  return (
    <>
      <DeveloperLayout>
        <TaskDescription />
      </DeveloperLayout>
    </>
  );
}

export default TaskDetails;
