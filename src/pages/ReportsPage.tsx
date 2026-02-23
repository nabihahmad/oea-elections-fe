import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Users, Vote, UserCheck, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Stats {
  label: string;
  key: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const ReportsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats[]>([
    { label: "Total Eligible Engineers", key: "totalEligibleEngineers", value: "—", icon: Users, color: "text-accent" },
    { label: "Checked In Engineers", key: "checkedInEngineers", value: "—", icon: UserCheck, color: "text-warning" },
    { label: "Total Votes", key: "totalVotes", value: "—", icon: Vote, color: "text-success" },
    { label: "Total Affiliated Votes", key: "totalAffiliatedVotes", value: "—", icon: HeartHandshake, color: "text-success" },
    { label: "Total Mobile Numbers", key: "totalMobileNumbers", value: "—", icon: Smartphone, color: "text-foreground" },
  ]);

  const [voteTimeseries, setVoteTimeseries] = useState<Array<{ datetime: string; totalVotes: number; affiliatedVotes: number }>>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reporting/main-counts`, {
          method: "GET",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
        });
        const data = await response.json();
        
        setStats((prevStats) =>
          prevStats.map((stat) => ({
            ...stat,
            value: String(data[stat.key] || "—"),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchTimeseries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reporting/votes-timeseries`, {
          method: "GET",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
        });
        const data = await response.json();
        
        const timeseries = Object.entries(data).map(([datetime, values]: [string, any]) => ({
          datetime,
          totalVotes: values.totalVotes,
          affiliatedVotes: values.affiliatedVotes,
        }));
        
        setVoteTimeseries(timeseries);
      } catch (error) {
        console.error("Failed to fetch votes timeseries:", error);
      }
    };

    fetchTimeseries();
  }, [user?.token]);

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Reporting Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview and reports</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:flex-row sm:text-left">
              <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                <p className="text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {voteTimeseries.length == 0 && (
            <p className="text-sm text-muted-foreground">No voting data available.</p>
          )}
          {voteTimeseries.length > 0 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left px-4 py-2">Date & Time</th>
                      <th className="text-right px-4 py-2">Total Votes</th>
                      <th className="text-right px-4 py-2">Affiliated Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voteTimeseries.map((row) => (
                      <tr key={row.datetime} className="border-b hover:bg-muted">
                        <td className="px-4 py-2">{row.datetime}</td>
                        <td className="text-right px-4 py-2">{row.totalVotes}</td>
                        <td className="text-right px-4 py-2">{row.affiliatedVotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {voteTimeseries.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Votes Over Time</h3>
              <div className="h-80 w-full">
              <svg viewBox="0 0 800 300" className="w-full h-full">
              {/* Y-axis */}
              <line x1="60" y1="20" x2="60" y2="260" stroke="currentColor" strokeWidth="2" />
              {/* X-axis */}
              <line x1="60" y1="260" x2="780" y2="260" stroke="currentColor" strokeWidth="2" />
              
              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const maxVotes = Math.max(...voteTimeseries.map(p => Math.max(p.totalVotes, p.affiliatedVotes)));
                const value = Math.round(maxVotes * ratio);
                const y = 260 - ratio * 240;
                return (
                <g key={`y-label-${ratio}`}>
                  <text x="50" y={y + 4} textAnchor="end" className="text-xs fill-muted-foreground">{value}</text>
                </g>
                );
              })}
              
              {/* X-axis labels */}
              {voteTimeseries.map((point, i) => {
                if (i % Math.ceil(voteTimeseries.length / 5) === 0) {
                const x = 60 + (i / voteTimeseries.length) * 720;
                return (
                  <g key={`x-label-${i}`}>
                  <text x={x} y="280" textAnchor="middle" className="text-xs fill-muted-foreground">{point.datetime.substring(11, 16)}</text>
                  </g>
                );
                }
              })}
              
              {/* Plot lines for totalVotes */}
              {voteTimeseries.map((point, i) => {
              const nextPoint = voteTimeseries[i + 1];
              const x1 = 60 + (i / voteTimeseries.length) * 720;
              const x2 = 60 + ((i + 1) / voteTimeseries.length) * 720;
              const maxVotes = Math.max(...voteTimeseries.map(p => Math.max(p.totalVotes, p.affiliatedVotes)));
              const y1 = 260 - (point.totalVotes / maxVotes) * 240;
              const y2 = nextPoint ? 260 - (nextPoint.totalVotes / maxVotes) * 240 : y1;
              
              return nextPoint ? (
                <line key={`total-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10b981" strokeWidth="2" />
              ) : null;
              })}
              
              {/* Plot lines for affiliatedVotes */}
              {voteTimeseries.map((point, i) => {
              const nextPoint = voteTimeseries[i + 1];
              const x1 = 60 + (i / voteTimeseries.length) * 720;
              const x2 = 60 + ((i + 1) / voteTimeseries.length) * 720;
              const maxVotes = Math.max(...voteTimeseries.map(p => Math.max(p.totalVotes, p.affiliatedVotes)));
              const y1 = 260 - (point.affiliatedVotes / maxVotes) * 240;
              const y2 = nextPoint ? 260 - (nextPoint.affiliatedVotes / maxVotes) * 240 : y1;
              
              return nextPoint ? (
                <line key={`affiliated-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2" />
              ) : null;
              })}
              </svg>
              </div>
              <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500"></div>
              <span>Total Votes</span>
              </div>
              <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500"></div>
              <span>Affiliated Votes</span>
              </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
