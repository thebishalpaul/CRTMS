import React from "react";
import TaskCard from "./TaskCard";

const BoardView = ({ tasks }) => {
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  const statusOrder = { "in-progress": 1, "to-do": 2, completed: 3 };

  tasks.sort((a, b) => {
    // First, compare by status
    const statusComparison = statusOrder[a.status] - statusOrder[b.status];
    if (statusComparison !== 0) {
      return statusComparison;
    }

    // If statuses are the same, compare by priority
    const priorityComparison =
      priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    // If priorities are the same, compare by deadline
    return new Date(a.deadline) - new Date(b.deadline);
  });

  return (
    <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10">
      {tasks.map((task, index) => (
        <TaskCard task={task} key={index} />
      ))}
    </div>
  );
};

export default BoardView;
