import React, { useEffect, useState } from 'react';
import WelcomeBanner from '../../../components/Global/WelcomeBanner';
import CardDataStats from '../../../components/Global/CardDataStats';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import axios from 'axios';
import { useSelector } from 'react-redux';
import ChartOne from './Charts/ChartOne';
import ChartTwo from './Charts/ChartTwo';
import ChartThree from './Charts/ChartThree';

function Dashboard() {
  const user = useSelector((state) => state.user);
  const [totalProject, setTotalProject] = useState(0);
  const [inprogressProject, setInprogressProject] = useState(0);
  const [inprogressChange, setInprogressChange] = useState(0);
  const [inprogressTicket, setInprogressTicket] = useState(0);
  console.log(user.token);
  const fetchCount = async () => {
    try {
      const [res1, res2, res3, res4] = await Promise.all([
        axios.get('/api/v1/count/projects', {
          headers: {
            Authorization: `${user.token}`
          }
        }),
        axios.get('/api/v1/count/projects?status=inprogress', {
          headers: {
            Authorization: `${user.token}`
          }
        }),
        axios.get('/api/v1/count/requests?status=in-progress&requestType=change', {
          headers: {
            Authorization: `${user.token}`
          }
        }),
        axios.get('/api/v1/count/requests?status=in-progress&requestType=ticket', {
          headers: {
            Authorization: `${user.token}`
          }
        })
      ]);
      if (res1.data.success) setTotalProject(res1.data.count);
      if (res2.data.success) setInprogressProject(res2.data.count);
      if (res3.data.success) setInprogressChange(res3.data.count);
      if (res4.data.success) setInprogressTicket(res4.data.count);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <div className="flex h-fill-available overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <main>
          <div className="sm:px-6 w-full mx-auto">
            <WelcomeBanner />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <CardDataStats title="Total Projects" total={totalProject}>
              <InsertChartIcon className="fill-primary dark:fill-white" style={{ fontSize: 48 }} />
            </CardDataStats>

            <CardDataStats title="Projects In Progress" total={inprogressProject}>
              <HourglassFullIcon className="fill-primary dark:fill-white" style={{ fontSize: 48 }} />
            </CardDataStats>

            <CardDataStats title="Change Requests In Progress" total={inprogressChange}>
              <AutorenewIcon className="fill-primary dark:fill-white" style={{ fontSize: 48 }} />
            </CardDataStats>

            <CardDataStats title="Ticket Requests In Progress" total={inprogressTicket}>
              <ConfirmationNumberIcon className="fill-primary dark:fill-white" style={{ fontSize: 48 }} />
            </CardDataStats>
          </div>
          <div className="mt-4 m-3 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7 2xl:gap-7.5">
            <ChartOne />
            <ChartTwo />
            <ChartThree />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
