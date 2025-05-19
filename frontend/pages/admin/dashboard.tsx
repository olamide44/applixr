import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '@/lib/auth';

interface DashboardStats {
  total_users: number;
  total_applications: number;
  total_companies: number;
  applications_by_status: Record<string, number>;
  recent_activity: {
    new_applications: number;
    new_users: number;
  };
}

interface UserStats {
  users_by_role: Record<string, number>;
  active_users: number;
}

interface ApplicationStats {
  applications_by_month: Record<string, number>;
  average_applications_per_user: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [applicationStats, setApplicationStats] = useState<ApplicationStats | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const [dashboardRes, userRes, applicationRes] = await Promise.all([
          fetch('/api/admin/dashboard-stats'),
          fetch('/api/admin/user-stats'),
          fetch('/api/admin/application-stats'),
        ]);

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setDashboardStats(data);
        }

        if (userRes.ok) {
          const data = await userRes.json();
          setUserStats(data);
        }

        if (applicationRes.ok) {
          const data = await applicationRes.json();
          setApplicationStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user, router]);

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardStats?.total_users || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardStats?.total_applications || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardStats?.total_companies || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userStats?.active_users || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardStats?.applications_by_status ? 
                    Object.entries(dashboardStats.applications_by_status).map(([status, count]) => ({
                      status,
                      count,
                    })) : []
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={applicationStats?.applications_by_month ?
                    Object.entries(applicationStats.applications_by_month).map(([month, count]) => ({
                      month,
                      count,
                    })) : []
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-semibold">New Applications</p>
                <p className="text-2xl font-bold">{dashboardStats?.recent_activity.new_applications || 0}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">New Users</p>
                <p className="text-2xl font-bold">{dashboardStats?.recent_activity.new_users || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 