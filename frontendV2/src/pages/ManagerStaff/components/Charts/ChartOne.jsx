import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';

const options = {
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    height: 335,
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },
    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: 'straight',
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: '#fff',
    strokeColors: ['#3056D3', '#80CAEE'],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: 'category',
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels:{
      style:{
        colors: 'black',
      }
    }
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
    min: 0,
    max: 100,
    labels:{
      style:{
        colors: 'black',
      }
    }
  },
};

const ChartOne = () => {
  const [state, setState] = useState({
    series: [
      {
        name: 'Requests Received',
        data: [],
      },
      {
        name: 'Requests Completed',
        data: [],
      },
    ],
  });
  const [year, setYear] = useState(new Date().getFullYear());
  const user = useSelector((state) => state.user);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/v1/request/all', {
          headers: {
            Authorization: `${user.token}`,
          },
        });
        const requests = response.data.requests;
        console.log(requests);
        const received = Array(12).fill(0);
        const completed = Array(12).fill(0);

        requests.forEach((request) => {
          const requestDate = new Date(request.createdAt);
          if (requestDate.getFullYear() === year) {
            const month = requestDate.getMonth();
            received[month] += 1;
            if (request.status === 'completed') {
              completed[month] += 1;
            }
          }
        });

        setState({
          series: [
            { name: 'Requests Received', data: received },
            { name: 'Requests Completed', data: completed },
          ],
        });
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, [year, user.token]);

  const handleYearChange = (event) => {
    setYear(parseInt(event.target.value));
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5 items-center">
            <span className="mt-1 mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-2.5 rounded-full bg-custom-blue"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Requests Received</p>
            </div>
          </div>
          <div className="flex min-w-47.5 items-center">
            <span className="mt-1 mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-2.5 rounded-full bg-dark-blue"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary">Requests Completed</p>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <label className="mr-2" htmlFor="year">
            Year:
          </label>
          <select
            id="year"
            value={year}
            onChange={handleYearChange}
            className="border rounded-md p-1"
          >
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={state.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
