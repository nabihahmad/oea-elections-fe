import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Vote, UserCheck } from "lucide-react";

const stats = [
  { label: "Updated Mobiles", value: "—", icon: Users, color: "text-accent" },
  { label: "Total Voted", value: "—", icon: Vote, color: "text-success" },
  { label: "Total Check Ins", value: "—", icon: UserCheck, color: "text-warning" },
  { label: "Stats", value: "—", icon: BarChart3, color: "text-foreground" },
];

const ReportsPage = () => {
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
          <p className="text-sm text-muted-foreground">
            Charts and detailed reports will be added here. Let me know what graphs and data you'd like to see.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
