import React, { useEffect, useRef } from "react";
import Chart from "chart.js";

export default function CardBarChart() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    const chartConfig = {
      type: "bar",
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
            label: "2024",
            backgroundColor: isDarkMode ? "#3182ce" : "#3182ce",
            borderColor: isDarkMode ? "#4299e1" : "#29C098",
            data: [27, 68, 86, 74, 10, 4, 87],
            fill: false,
            barThickness: 8,
          },
          {
            label: "2025",
            backgroundColor: isDarkMode ? "#29C098" : "#29C098",
            borderColor: isDarkMode ? "#007456" : "#007456",
            data: [27, 68, 86, 74, 10, 4, 87],
            fill: false,
            barThickness: 8,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Orders Chart",
          fontColor: isDarkMode ? "#e2e8f0" : "#0F1729",
        },
        legend: {
          labels: {
            fontColor: isDarkMode ? "#e2e8f0" : "#0F1729",
          },
          align: "end",
          position: "bottom",
        },
        tooltips: {
          mode: "index",
          intersect: false,
          backgroundColor: isDarkMode ? "#2d3748" : "#ffffff",
          titleFontColor: isDarkMode ? "#e2e8f0" : "#0F1729",
          bodyFontColor: isDarkMode ? "#e2e8f0" : "#0F1729",
        },
        scales: {
          xAxes: [{
            display: false,
            scaleLabel: {
              display: true,
              labelString: "Month",
            },
            gridLines: {
              borderDash: [2],
              borderDashOffset: [2],
              color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(33, 37, 41, 0.3)",
              zeroLineColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(33, 37, 41, 0.3)",
              zeroLineBorderDash: [2],
              zeroLineBorderDashOffset: [2],
            },
            ticks: {
              fontColor: isDarkMode ? "#e2e8f0" : "#0F1729",
            },
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: false,
              labelString: "Value",
              fontFamily: "'Inter', sans-serif",
            },
            gridLines: {
              borderDash: [2],
              drawBorder: false,
              borderDashOffset: [2],
              color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(33, 37, 41, 0.2)",
              zeroLineColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(33, 37, 41, 0.15)",
              zeroLineBorderDash: [2],
              zeroLineBorderDashOffset: [2],
            },
            ticks: {
              fontColor: isDarkMode ? "#e2e8f0" : "#0F1729",
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
            <h6 className="uppercase text-gray-500 dark:text-gray-300 mb-1 text-xs font-semibold font-heading">
              Performance
            </h6>
            <h2 className="text-dark-900 dark:text-white text-xl font-bold font-heading">
              Total orders
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