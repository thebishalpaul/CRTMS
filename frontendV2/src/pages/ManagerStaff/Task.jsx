import React from 'react'
import TaskTable from './components/TaskTable/TaskTable'
import ManagerStaffLayout from './components/ManagerStaffLayout'

function Task() {
    return (
        <>
            <ManagerStaffLayout>
                <TaskTable />
            </ManagerStaffLayout>
        </>
    )
}

export default Task