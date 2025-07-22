"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";
import { getUsers, updateUserRole } from "@/lib/api";
import { User } from "@/types/auth/User";
import clsx from "clsx";
import { ROLES } from "@/types/auth/Role";

export default function UsersPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!token || user?.role !== "admin") {
        router.push("/");
        return;
      }
      (async() => {
        try {
          const data = await getUsers(token);
          setUsers(data);
        } catch {
          setError("Failed to fetch users");
        }
      })();
    }
  }, [loading, token, user, router]);

  const handleRoleChange = async(id: string, newRole: string) => {
    try {
      await updateUserRole(id, newRole, token!);
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch {
      setError("Failed to update roles");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <table className="w-full bg-white rounded-lg shadow-xl">
        <thead className="rounded-lg bg-blue-500">
          <tr className="*:p-4 *:text-left text-white">
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t border-gray-200 *:p-4 *:text-left">
              <td className="flex items-center gap-x-2">
                <div>
                  {u.name}
                </div>
                {u.id === user?.id && <div className="text-xs border text-green-500 border-green-500 rounded-md px-2 py-0.5">You</div>}
              </td>
              <td>
                <a className="text-blue-500 hover:underline cursor-pointer" href={'mailto:' + u.email}>{u.email}</a>
              </td>
              <td>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</td>
              <td>
                <select
                  value={u.role || "viewer"}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                  className={clsx(
                    "border px-4 py-1 w-full",
                    {
                      'text-gray-500 border-gray-300 cursor-not-allowed': u.id === user?.id
                    })}
                  disabled={u.id === user?.id}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
