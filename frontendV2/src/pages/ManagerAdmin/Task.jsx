import React from 'react'
import TaskTable from './components/TaskTable/TaskTable'
import ManagerAdminLayout from './components/ManagerAdminLayout'

function Task() {
    return (
        <>
            <ManagerAdminLayout>
                <TaskTable />
            </ManagerAdminLayout>
        </>
    )
}

export default Task