import React, { useState, useEffect } from "react";
import { Box, H1, H3, Text } from "@adminjs/design-system";
import { ApiClient } from "adminjs";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    collections: 0,
    blogs: 0,
    loading: true,
    error: null,
  });

  const api = new ApiClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch stats from your resources using the model names
      const [usersResponse, collectionsResponse, blogsResponse] =
        await Promise.all([
          api.resourceAction({
            resourceId: "User",
            actionName: "list",
            params: { perPage: 1 },
          }),
          api.resourceAction({
            resourceId: "Collection",
            actionName: "list",
            params: { perPage: 1 },
          }),
          api.resourceAction({
            resourceId: "Blog",
            actionName: "list",
            params: { perPage: 1 },
          }),
        ]);

      setStats({
        users: usersResponse.data.meta.total || 0,
        collections: collectionsResponse.data.meta.total || 0,
        blogs: blogsResponse.data.meta.total || 0,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard statistics",
      }));
    }
  };

  const StatCard = ({ title, count, color }) => (
    <Box
      p="xl"
      borderRadius="lg"
      border="1px solid"
      borderColor="grey20"
      style={{
        background: "white",
        borderLeft: `4px solid ${color}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
      }}
    >
      <Box>
        <Text fontSize="sm" color="grey60" fontWeight="500" mb="xs">
          {title}
        </Text>
        <H3
          fontSize="xxl"
          fontWeight="bold"
          color={color}
          style={{ margin: 0 }}
        >
          {stats.loading ? "..." : count.toLocaleString()}
        </H3>
      </Box>
    </Box>
  );

  if (stats.error) {
    return (
      <Box p="xxl">
        <Box
          p="xl"
          borderRadius="lg"
          border="1px solid"
          borderColor="error"
          bg="white"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py="xl"
          >
            <Box textAlign="center">
              <Text color="error" fontSize="lg" mb="lg">
                ⚠️ {stats.error}
              </Text>
              <Box mt="lg">
                <button
                  onClick={fetchStats}
                  style={{
                    background: "#F59E0B",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Retry
                </button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb="xxl" p={["lg", "xl", "xxl"]}>
        <H1
          fontSize="xl"
          fontWeight="bold"
          color="grey100"
          style={{
            margin: 0,
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          BoiBritto Dashboard
        </H1>
        <Text color="grey60" fontSize="lg" mt="sm">
          Overview of platform statistics
        </Text>
      </Box>

      {/* Stats Cards */}
      <Box p={["lg", "xl", "xxl"]}>
        <Box
          display="grid"
          gridTemplateColumns={["1fr", "1fr", "repeat(3, 1fr)"]}
          gridGap="xl"
        >
          <StatCard title="Total Users" count={stats.users} color="#3B82F6" />

          <StatCard
            title="Collections Created"
            count={stats.collections}
            color="#10B981"
          />

          <StatCard
            title="Blogs Published"
            count={stats.blogs}
            color="#F59E0B"
          />
        </Box>
      </Box>

      {/* Refresh Button */}
      <Box p={["lg", "xl", "xxl"]} textAlign="center">
        <button
          onClick={fetchStats}
          disabled={stats.loading}
          style={{
            background: stats.loading
              ? "#9CA3AF"
              : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            cursor: stats.loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!stats.loading) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!stats.loading) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
            }
          }}
        >
          {stats.loading ? <>⟳ Refreshing...</> : <>Refresh</>}
        </button>
      </Box>
    </Box>
  );
};

export default Dashboard;
