import React, { useEffect, useRef } from "react";
import Chart from "chart.js";

export default function CardLineChart() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    const chartConfig = {
      type: "line",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        datasets: [
          {
            label: "Sales",
            backgroundColor: isDarkMode ? "rgba(45, 55, 72, 0.4)" : "rgba(0, 116, 86, 0.4)",
            borderColor: isDarkMode ? "#4299e1" : "#007456",
            data: [65, 78, 66, 44, 56, 67, 75],
            fill: true,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Sales Charts",
          fontColor: isDarkMode ? "#e2e8f0" : "#1a202c",
        },
        legend: {
          labels: {
            fontColor: isDarkMode ? "#e2e8f0" : "#1a202c",
          },
          align: "end",
          position: "bottom",
        },
        tooltips: {
          mode: "index",
          intersect: false,
          backgroundColor: isDarkMode ? "#2d3748" : "#ffffff",
          titleFontColor: isDarkMode ? "#e2e8f0" : "#1a202c",
          bodyFontColor: isDarkMode ? "#e2e8f0" : "#1a202c",
        },
        scales: {
          xAxes: [{
            gridLines: {
              color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            },
            ticks: {
              fontColor: isDarkMode ? "#e2e8f0" : "#1a202c",
            },
          }],
          yAxes: [{
            gridLines: {
              color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            },
            ticks: {
              fontColor: isDarkMode ? "#e2e8f0" : "#1a202c",
              beginAtZero: true,
            },
          }],
        },
      },
    };

    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart
      chartInstance.current = new Chart(chartRef.current, chartConfig);
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [document.documentElement.classList]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-gray-500 dark:text-gray-300 mb-1 text-xs font-semibold">
              Overview
            </h6>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Sales Value
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative h-350-px">
          <canvas ref={chartRef} height={350}></canvas>
        </div>
      </div>
    </div>
  );
}