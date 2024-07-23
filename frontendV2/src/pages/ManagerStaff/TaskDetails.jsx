import React from 'react'
import ManagerStaffLayout from './components/ManagerStaffLayout'
import TaskDescription from './components/TaskDescription/TaskDescription'

function TaskDetails() {
    return (
        <>
            <ManagerStaffLayout>
                <TaskDescription />
            </ManagerStaffLayout>
        </>
    )
}

export default TaskDetails