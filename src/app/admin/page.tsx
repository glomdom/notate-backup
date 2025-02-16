"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

//
// Types – adjust these to match your backend DTOs
//
type SchoolClass = {
  id: string;
  className: string;
};

type CreateClassForm = {
  className: string;
  teacherIds: string; // Comma-separated teacher IDs
};

//
// Data fetching function using your api wrapper and cookie-stored token
//
const fetchClasses = async (token: string): Promise<SchoolClass[]> => {
  const response = await api.get("/class/classes", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) {
    throw new Error("Error fetching classes");
  }
  return response.data;
};

//
// Mutation function to create a class using api.post
//
const createClass = async ({
  token,
  payload,
}: {
  token: string;
  payload: CreateClassForm;
}) => {
  const response = await api.post(
    "/class/classes",
    {
      className: payload.className,
      teacherIds: payload.teacherIds.split(",").map((id) => id.trim()),
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (response.status !== 200 && response.status !== 201) {
    throw new Error("Error creating class");
  }
  return response.data;
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Redirect if auth is resolved and user is not an Admin.
  React.useEffect(() => {
    if (!loading && (!user || user.role !== "Admin")) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Retrieve token from cookies
  const token = Cookies.get("auth") || "";

  // React Query: Fetch classes using object syntax (v5)
  const {
    data: classes,
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetchClasses(token),
    enabled: !!token,
  });

  // Mutation: Create a new class using api.post
  const mutation = useMutation({
    mutationFn: (payload: CreateClassForm) => createClass({ token, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });

  // Set up react-hook-form for creating a class
  const { register, handleSubmit, reset } = useForm<CreateClassForm>();

  // Full-screen loading state until auth is resolved
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Create Class Form */}
      <div className="mb-8 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Create New Class</h2>
        <form
          onSubmit={handleSubmit((data) => {
            mutation.mutate(data);
            reset();
          })}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              {...register("className", { required: true })}
              placeholder="Enter class name"
            />
          </div>
          <div>
            <Label htmlFor="teacherIds">Teacher IDs (comma-separated)</Label>
            <Input
              id="teacherIds"
              {...register("teacherIds", { required: true })}
              placeholder="e.g., id1, id2, id3"
            />
          </div>
          <Button type="submit">Create Class</Button>
        </form>
      </div>

      {/* List Existing Classes */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Classes</h2>
        {classesLoading ? (
          <p>Loading classes...</p>
        ) : classesError ? (
          <p>Error loading classes.</p>
        ) : (
          <ul>
            {classes?.map((cls: SchoolClass) => (
              <li
                key={cls.id}
                className="mb-2 p-2 border rounded hover:bg-gray-50"
              >
                {cls.className}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
