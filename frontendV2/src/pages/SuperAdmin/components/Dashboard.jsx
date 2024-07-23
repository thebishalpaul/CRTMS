import React, { useEffect, useState } from 'react';
import WelcomeBanner from '../../../components/Global/WelcomeBanner';
import CardDataStats from '../../../components/Global/CardDataStats';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import axios from 'axios';
import { useSelector } from 'react-redux';
function Dashboard() {
  const user = useSelector((state) => state.user);
  const [total, setTotal] = useState(0);

  const fetchCount = async () => {
    try {
      const response = await axios.get('/api/v1/count/institutes',
        {
          headers: {
            Authorization: `${user.token}`
          }
        }
      );
      if (response.data.success)
        setTotal(response.data.count);
      // console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchCount();
  }, [total]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <WelcomeBanner />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <CardDataStats title="Total Institutes" total={total} levelUp>
              <InsertChartIcon className="fill-primary dark:fill-white" style={{ fontSize: 48 }} />
            </CardDataStats>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
