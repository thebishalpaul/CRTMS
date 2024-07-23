import clsx from "clsx";
import React, { useState } from "react";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../../../../utils";
import TaskDialog from "./TaskDialog";
import { BiMessageAltDetail } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import UserInfo from "./UserInfo";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TaskCard = ({ task }) => {
  // console.log(task);
  return (
    <>
      <div className='w-full h-fit bg-white shadow-md p-4 rounded'>
        <div className='w-full flex justify-between'>
          <div
            className={clsx(
              "flex flex-1 gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[task?.priority]
            )}
          >
            <span className='text-lg'>{ICONS[task?.priority]}</span>
            <span className='uppercase'>{task?.priority} Priority</span>
          </div>
          <TaskDialog task={task} />
        </div>

        <>
          <div className='flex items-center gap-2'>
            <div
              className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
            />
            <h4 className='line-clamp-1 text-black'>{task?.title}</h4>
          </div>
          <span className='text-sm text-gray-600'>
            Deadline: {formatDate(new Date(task?.deadline))}
          </span>
        </>

        <div className='w-full border-t border-gray-200 my-2' />
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-3'>
            <div className='flex gap-1 items-center text-sm text-gray-600'>
              <BiMessageAltDetail />
              {/* Task Comments here: <span>{task?.activities?.length}</span> */}
            </div>
          </div>

          <div className='flex flex-row-reverse'>
            {task?.userAssigned && (
              <div
                className={clsx(
                  "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm",
                  BGS[0] 
                )}
              >
                <UserInfo user={task.userAssigned} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskCard;
