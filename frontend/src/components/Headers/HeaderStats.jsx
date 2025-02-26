import React from "react";

// components
import CardStats from "../Cards/CardStats.jsx";

export default function HeaderStats({ children }) {
  return (
    <>
      {/* Header */}
      <div className="relative bg-primary md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="TOTAL USERS"
                  statTitle="350,897"
                  statArrow="up"
                  statPercent="3.48"
                  statPercentColor="text-primary"
                  statDescription="Since last month"
                  statIconName="fas fa-users"
                  statIconColor="bg-primary-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="NEW MENTORS"
                  statTitle="2,356"
                  statArrow="down"
                  statPercent="3.48"
                  statPercentColor="text-secondary"
                  statDescription="Since last week"
                  statIconName="fas fa-chalkboard-teacher"
                  statIconColor="bg-secondary-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="ACTIVE SESSIONS"
                  statTitle="924"
                  statArrow="up"
                  statPercent="12.5"
                  statPercentColor="text-primary"
                  statDescription="Since yesterday"
                  statIconName="fas fa-video"
                  statIconColor="bg-blue-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="SUCCESS RATE"
                  statTitle="89.9%"
                  statArrow="up"
                  statPercent="4.02"
                  statPercentColor="text-primary"
                  statDescription="Since last quarter"
                  statIconName="fas fa-chart-line"
                  statIconColor="bg-pink-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
