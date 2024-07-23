import React from "react";
import TaskCard from "./TaskCard";

const BoardView = ({ tasks }) => {
  return (
    <div className='w-full py-4'>
      {tasks.length === 0 ? (
        <div className='text-center text-gray-600'>
          No Task Created
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10'>
          {tasks.map((task, index) => (
            <TaskCard task={task} key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardView;
