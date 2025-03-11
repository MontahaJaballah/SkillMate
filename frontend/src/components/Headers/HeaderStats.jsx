import React, { useState, useEffect } from "react";
import useAxios from "../../hooks/useAxios";

// components
import CardStats from "../Cards/CardStats.jsx";

export default function HeaderStats({ children }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUsersLastMonth: 0,
    newMentors: 0,
    newMentorsLastWeek: 0,
    activeSessions: 924,
    successRate: 89.9
  });
  const [loading, setLoading] = useState(true);
  const axiosInstance = useAxios();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersResponse,
          usersLastMonthResponse,
          mentorsResponse,
          mentorsLastWeekResponse
        ] = await Promise.all([
          axiosInstance.get("/stats/total-users"),
          axiosInstance.get("/stats/total-users-last-month"),
          axiosInstance.get("/stats/new-mentors"),
          axiosInstance.get("/stats/new-mentors-last-week")
        ]);

        const totalUsers = usersResponse.data.count;
        const totalUsersLastMonth = usersLastMonthResponse.data.count;
        const newMentors = mentorsResponse.data.count;
        const newMentorsLastWeek = mentorsLastWeekResponse.data.count;

        // Calculate percentage changes
        const totalUsersPercentChange = totalUsersLastMonth > 0
          ? ((totalUsers - totalUsersLastMonth) / totalUsersLastMonth * 100).toFixed(2)
          : 0;

        const newMentorsPercentChange = newMentorsLastWeek > 0
          ? ((newMentors - newMentorsLastWeek) / newMentorsLastWeek * 100).toFixed(2)
          : 0;

        setStats({
          totalUsers,
          totalUsersLastMonth,
          totalUsersPercentChange: Math.abs(totalUsersPercentChange),
          totalUsersArrow: totalUsersPercentChange >= 0 ? "up" : "down",

          newMentors,
          newMentorsLastWeek,
          newMentorsPercentChange: Math.abs(newMentorsPercentChange),
          newMentorsArrow: newMentorsPercentChange >= 0 ? "up" : "down",

          activeSessions: 924,
          successRate: 89.9
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="relative bg-primary md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div className="flex flex-wrap">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <div className="animate-pulse">
                  <div className="h-24 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
                  statTitle={stats.totalUsers.toLocaleString()}
                  statArrow={stats.totalUsersArrow}
                  statPercent={stats.totalUsersPercentChange.toString()}
                  statPercentColor="text-primary"
                  statDescription="Since last month"
                  statIconName="fas fa-users"
                  statIconColor="bg-primary-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="NEW MENTORS"
                  statTitle={stats.newMentors.toLocaleString()}
                  statArrow={stats.newMentorsArrow}
                  statPercent={stats.newMentorsPercentChange.toString()}
                  statPercentColor="text-secondary"
                  statDescription="Since last week"
                  statIconName="fas fa-chalkboard-teacher"
                  statIconColor="bg-secondary-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="ACTIVE SESSIONS"
                  statTitle={stats.activeSessions.toLocaleString()}
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
                  statTitle={`${stats.successRate.toFixed(1)}%`}
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