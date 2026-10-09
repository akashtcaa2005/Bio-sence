
import { useEffect, useState } from "react";
import { Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import HealthChart from "@/components/health/HealthChart";

const Reports = () => {
  useEffect(() => {
    document.title = "Bio Sense - Health Reports";
  }, []);

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const mockReports = [
    {
      id: 1,
      title: "Monthly Health Summary",
      date: "February 1, 2026",
      type: "Summary",
      status: "Available",
      patient: "John Doe",
      age: 34,
      data: [
        { time: "Sep", value: 72 },
        { time: "Oct", value: 75 },
        { time: "Nov", value: 80 },
        { time: "Dec", value: 78 },
        { time: "Jan", value: 76 }
      ]
    },
    {
      id: 2,
      title: "Cardio Assessment",
      date: "January 15, 2026",
      type: "Specialized",
      status: "Available",
      patient: "John Doe",
      age: 34,
      data: [
        { time: "Week 1", value: 65 },
        { time: "Week 2", value: 68 },
        { time: "Week 3", value: 72 },
        { time: "Week 4", value: 70 }
      ]
    },
    {
      id: 3,
      title: "Glucose Monitoring Report",
      date: "January 10, 2026",
      type: "Specialized",
      status: "Available",
      patient: "John Doe",
      age: 34,
      data: [
        { time: "Day 1", value: 100 },
        { time: "Day 2", value: 105 },
        { time: "Day 3", value: 98 },
        { time: "Day 4", value: 102 },
        { time: "Day 5", value: 100 }
      ]
    },
    {
      id: 4,
      title: "Sleep Quality Analysis",
      date: "December 28, 2025",
      type: "Specialized",
      status: "Processing",
      patient: "John Doe",
      age: 34,
    },
  ];

  const pastHistory = [
    {
      id: 101,
      title: "Annual Wellness Check",
      date: "March 5, 2025",
      type: "Summary",
      status: "Available",
      patient: "John Doe",
      age: 33,
      data: [
        { time: "Q1", value: 74 },
        { time: "Q2", value: 77 },
        { time: "Q3", value: 73 },
        { time: "Q4", value: 75 }
      ]
    },
    {
      id: 102,
      title: "Blood Pressure History",
      date: "November 12, 2024",
      type: "Specialized",
      status: "Available",
      patient: "John Doe",
      age: 32,
      data: [
        { time: "Jan", value: 118 },
        { time: "Mar", value: 122 },
        { time: "Jun", value: 119 },
        { time: "Sep", value: 125 },
        { time: "Nov", value: 121 }
      ]
    },
    {
      id: 103,
      title: "Cholesterol Panel",
      date: "July 20, 2024",
      type: "Lab",
      status: "Available",
      patient: "John Doe",
      age: 32,
      data: [
        { time: "2022", value: 195 },
        { time: "2023", value: 202 },
        { time: "2024", value: 188 }
      ]
    },
    {
      id: 104,
      title: "Respiratory Function Test",
      date: "February 8, 2024",
      type: "Specialized",
      status: "Available",
      patient: "John Doe",
      age: 32,
      data: [
        { time: "Test 1", value: 88 },
        { time: "Test 2", value: 90 },
        { time: "Test 3", value: 92 }
      ]
    },
    {
      id: 105,
      title: "Kidney Function Report",
      date: "September 3, 2023",
      type: "Lab",
      status: "Available",
      patient: "John Doe",
      age: 31,
      data: [
        { time: "Month 1", value: 96 },
        { time: "Month 3", value: 94 },
        { time: "Month 6", value: 97 }
      ]
    },
    {
      id: 106,
      title: "Diabetes Screening",
      date: "April 14, 2023",
      type: "Lab",
      status: "Available",
      patient: "John Doe",
      age: 31,
      data: [
        { time: "Fasting", value: 92 },
        { time: "1hr", value: 145 },
        { time: "2hr", value: 118 }
      ]
    },
  ];

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const ReportRow = ({ report }: { report: any }) => (
    <div
      key={report.id}
      className="grid grid-cols-6 py-4 px-6 border-b last:border-b-0 items-center text-sm"
    >
      <div className="col-span-2 font-medium">{report.title}</div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        {report.date}
      </div>
      <div>
        <Badge variant="outline">{report.type}</Badge>
      </div>
      <div className="text-muted-foreground text-xs">Age {report.age}</div>
      <div>
        {report.status === "Available" ? (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => handleViewReport(report)}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>
        ) : (
          <span className="text-muted-foreground italic">{report.status}</span>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Health Reports</h1>
          <p className="text-muted-foreground">
            View your personalized health reports
          </p>
        </div>
      </div>

      {/* Recent Reports */}
      <h2 className="text-lg font-semibold mb-3">Recent Reports</h2>
      <div className="bg-card rounded-lg shadow mb-8">
        <div className="grid grid-cols-6 py-3 px-6 font-medium text-sm border-b text-muted-foreground">
          <div className="col-span-2">Report Name</div>
          <div>Date</div>
          <div>Type</div>
          <div>Patient Age</div>
          <div>Actions</div>
        </div>
        {mockReports.map((report) => (
          <ReportRow key={report.id} report={report} />
        ))}
      </div>

      {/* Past History */}
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        Past Patient History
      </h2>
      <div className="bg-card rounded-lg shadow">
        <div className="grid grid-cols-6 py-3 px-6 font-medium text-sm border-b text-muted-foreground">
          <div className="col-span-2">Report Name</div>
          <div>Date</div>
          <div>Type</div>
          <div>Patient Age</div>
          <div>Actions</div>
        </div>
        {pastHistory.map((report) => (
          <ReportRow key={report.id} report={report} />
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Report Date</div>
                <div className="font-medium">{selectedReport?.date}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Report Type</div>
                <div className="font-medium">{selectedReport?.type}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Patient Age</div>
                <div className="font-medium">{selectedReport?.age} yrs</div>
              </div>
            </div>
            {selectedReport?.data && (
              <div className="h-64 mt-2">
                <h3 className="font-medium mb-2">Health Variation History</h3>
                <HealthChart data={selectedReport.data} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;

