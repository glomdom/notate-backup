"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthProvider";
import { Bell, BookOpen, Hourglass, LayoutDashboard, LogOut, Star, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// XXX: mock data, trea smenim s api calls
const assignments = [
  { course: 'Mathematics', title: 'Linear Algebra', status: 'pending', due: '2024-03-20' },
  { course: 'Literature', title: 'Modern Poetry', status: 'submitted', due: '2024-03-18' },
  { course: 'Physics', title: 'Quantum Mechanics', status: 'late', due: '2024-03-15' }
]

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/40 p-4">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Notate</h2>
        </div>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            Assignments
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <UploadCloud className="mr-2 h-4 w-4" />
            Submissions
          </Button>
        </nav>

        <Separator className="my-4" />

        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}</h1>
            <p className="text-muted-foreground">Student Portal Dashboard</p>
          </div>

          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Assignments</CardTitle>
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
              <p className="text-sm text-muted-foreground">+0.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Average Grade</CardTitle>
              <Star className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">A-</div>
              <p className="text-sm text-muted-foreground">Current semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Next Deadline</CardTitle>
              <Hourglass className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3 days</div>
              <p className="text-sm text-muted-foreground">Linear Algebra</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Assignments</CardTitle>
              <Button>
                <UploadCloud className="mr-2 h-4 w-4" />
                New Submission
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{assignment.course}</div>
                    <div className="text-sm text-muted-foreground">{assignment.title}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        assignment.status === 'submitted' ? 'success' :
                        assignment.status === 'late' ? 'destructive' : 'default'
                      }
                    >
                      {assignment.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Due: {assignment.due}
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
