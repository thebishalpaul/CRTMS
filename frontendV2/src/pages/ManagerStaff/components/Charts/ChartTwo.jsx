import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { MenuItem, Select } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSelector } from 'react-redux';
import axios from 'axios';

const options = {
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'donut',
  },
  colors: ['#3C50E0', '#0FADCF'],
  labels: ['Change', 'Ticket'],
  legend: {
    show: false,
    position: 'bottom',
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 380,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};
const ChartTwo = () => {
  const user = useSelector((state) => state.user);
  const [state, setState] = useState({
    series: [0, 0],
    percentages: [0, 0],
  });

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/v1/request/all", {
        headers: {
          Authorization: `${user.token}`
        }
      })
      if (res.data.success) {
        const requests = res.data.requests;
        // console.log(requests);
        const ticketRequest = requests.filter(r => r.requestType === "ticket").length;
        const changeRequest = requests.filter(r => r.requestType === "change").length;
        let totalRequest = ticketRequest + changeRequest;
        //to avoid divide by 0
        if (totalRequest === 0) {
          totalRequest = 1;
        }
        const changePercentage = ((changeRequest / totalRequest) * 100).toFixed(2);
        const ticketPercentage = ((ticketRequest / totalRequest) * 100).toFixed(2);

        setState({
          series: [changeRequest, ticketRequest],
          percentages: [changePercentage, ticketPercentage]
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={state.series} type="donut" />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        <div className="sm:w-1/2 w-full px-8">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#3C50E0]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
              <span> Change Requests </span>
              <span> {state.percentages[0]}% </span>
            </p>
          </div>
        </div>
        <div className="sm:w-1/2 w-full px-8">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#0FADCF]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
              <span> Ticket Requests </span>
              <span> {state.percentages[1]}% </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;