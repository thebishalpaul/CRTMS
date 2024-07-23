import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';

const ChartThree = () => {
  const user = useSelector((state) => state.user);
  const [chartData, setChartData] = useState({
    series: [
      { name: 'Ticket', data: [] },
      { name: 'Change', data: [] },
    ],
    categories: [],
  });

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/v1/count/topProjects', {
        headers: { Authorization: `${user.token}` },
      });
      if (res.data.success) {
        const projects = res.data.topProjects;
        const categories = projects.map((project) => project.project_name);
        const ticketData = projects.map((project) => project.ticketRequests);
        const changeData = projects.map((project) => project.changeRequests);

        setChartData({
          series: [
            { name: 'Ticket', data: ticketData },
            { name: 'Change', data: changeData },
          ],
          categories,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const options = {
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'bar',
      height: 335,
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: '25%',
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: '25%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: 'black',
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'black',
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Satoshi',
      fontWeight: 500,
      fontSize: '14px',
      markers: { radius: 99 },
      labels: {
        colors: 'black', 
      },
    },
    fill: { opacity: 1 },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-3 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Top 5 Projects with Maximum Requests
          </h4>
        </div>
      </div>

      <div>
        <div id="chartThree">
          <ReactApexChart
            options={options}
            series={chartData.series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartThree;