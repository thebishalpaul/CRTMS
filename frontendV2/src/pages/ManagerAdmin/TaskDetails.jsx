import React from 'react'
import ManagerAdminLayout from './components/ManagerAdminLayout'
import TaskDescription from './components/TaskDescription/TaskDescription'

function TaskDetails() {
    return (
        <>
            <ManagerAdminLayout>
                <TaskDescription />
            </ManagerAdminLayout>
        </>
    )
}

export default TaskDetails