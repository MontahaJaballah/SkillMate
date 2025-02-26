import React from "react";
import Chart from "chart.js";

// components
import CardBarChart from "../../components/Cards/CardBarChart.jsx";
import CardLineChart from "../../components/Cards/CardLineChart.jsx";
import CardPageVisits from "../../components/Cards/CardPageVisits.jsx";
import CardSocialTraffic from "../../components/Cards/CardSocialTraffic.jsx";
import CardTable from "../../components/Cards/CardTable.jsx";

export default function Dashboard() {
  return (
    <>
      {/* Content */}
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <CardLineChart />
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <CardBarChart />
          </div>
        </div>
        <div className="flex flex-wrap mt-4">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <CardPageVisits />
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <CardSocialTraffic />
          </div>
        </div>
        <div className="flex flex-wrap mt-4">
          <div className="w-full mb-12 px-4">
            <CardTable />
          </div>
        </div>
      </div>
    </>
  );
}