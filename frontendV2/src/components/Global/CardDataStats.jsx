import React from 'react';

const CardDataStats = ({
  title,
  total,
  children,
}) => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        {children}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-xl font-bold text-black dark:text-white">
            {total}
          </h4>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
    </div>
  );
};

export default CardDataStats;
