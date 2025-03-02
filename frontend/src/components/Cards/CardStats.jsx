import React from "react";
import PropTypes from "prop-types";

export default function CardStats({
  statSubtitle = "Traffic",
  statTitle = "350,897",
  statArrow = "up",
  statPercent = "3.48",
  statPercentColor = "text-primary",
  statDescription = "Since last month",
  statIconName = "far fa-chart-bar",
  statIconColor = "bg-primary",
}) {
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 rounded mb-6 xl:mb-0 shadow-lg">
        <div className="flex-auto p-4">
          <div className="flex flex-wrap">
            <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
              <h5 className="text-dark-500 dark:text-gray-400 uppercase font-heading text-xs font-semibold">
                {statSubtitle}
              </h5>
              <span className="font-heading font-bold text-xl text-dark-900 dark:text-white">
                {statTitle}
              </span>
            </div>
            <div className="relative w-auto pl-4 flex-initial">
              <div className={`text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full ${statIconColor} dark:opacity-80`}>
                <i className={statIconName}></i>
              </div>
            </div>
          </div>
          <p className="text-sm text-dark-500 dark:text-gray-400 mt-4">
            <span className={`${statPercentColor} mr-2`}>
              <i className={`fas fa-arrow-${statArrow} ${statArrow === "up" ? "text-primary" : "text-secondary"}`}></i>{" "}
              {statPercent}%
            </span>
            <span className="whitespace-nowrap">{statDescription}</span>
          </p>
        </div>
      </div>
    </>
  );
}

CardStats.propTypes = {
  statSubtitle: PropTypes.string,
  statTitle: PropTypes.string,
  statArrow: PropTypes.oneOf(["up", "down"]),
  statPercent: PropTypes.string,
  statPercentColor: PropTypes.string,
  statDescription: PropTypes.string,
  statIconName: PropTypes.string,
  statIconColor: PropTypes.string,
};