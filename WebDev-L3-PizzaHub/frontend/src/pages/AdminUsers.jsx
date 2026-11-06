
import { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaMagnifyingGlass,
  FaRotateRight,
  FaTrash,
  FaUserShield,
  FaCircleCheck,
  FaCircleXmark,
} from "react-icons/fa6";
import toast from "react-hot-toast";
import api from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/user/get-all-users");

      setUsers(response.data.users || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Verified" && user.isVerified) ||
        (statusFilter === "Unverified" && !user.isVerified);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const updateRole = async (userId, newRole) => {
    const currentUser = users.find((user) => user._id === userId);

    if (!currentUser || currentUser.role === newRole) return;

    const confirmed = window.confirm(
      `Change ${currentUser.name}'s role to ${newRole}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(userId);

      const response = await api.put(
        `/user/update-role/${userId}`,
        { role: newRole }
      );

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId
            ? { ...user, ...response.data.user }
            : user
        )
      );

      toast.success(response.data.message || "User role updated.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name} (${user.email})? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user._id);

      const response = await api.delete(
        `/user/delete-user/${user._id}`
      );

      setUsers((previousUsers) =>
        previousUsers.filter((item) => item._id !== user._id)
      );

      toast.success(response.data.message || "User deleted.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalAdmins = users.filter(
    (user) => user.role === "Admin"
  ).length;

  const totalVerified = users.filter(
    (user) => user.isVerified
  ).length;

  return (
    <div className="min-h-screen bg-[#FFF8F0] p-4 text-gray-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <FaUsers className="text-[#E63946]" />
              Users Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage registered users, roles and verification status.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium transition hover:bg-gray-50 disabled:opacity-50"
          >
            <FaRotateRight className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="mt-2 text-3xl font-bold">{users.length}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Administrators</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <FaUserShield className="text-[#E63946]" />
              {totalAdmins}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Verified Users</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <FaCircleCheck className="text-green-600" />
              {totalVerified}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-3">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-[#E63946]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:border-[#E63946]"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:border-[#E63946]"
          >
            <option value="All">All Verification Status</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold">Registered Users</h2>
            <span className="text-sm text-gray-500">
              {filteredUsers.length} results
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <FaUsers className="mx-auto mb-3 text-4xl text-gray-300" />
              <p className="font-medium">No users found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Verification</th>
                    <th className="px-5 py-4">Change Role</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="transition hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{user.name}</p>
                        <p className="mt-1 text-gray-500">{user.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            user.role === "Admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-2 font-medium text-green-700">
                            <FaCircleCheck />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 font-medium text-red-600">
                            <FaCircleXmark />
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={user.role}
                          disabled={
                            updatingId === user._id ||
                            deletingId === user._id
                          }
                          onChange={(event) =>
                            updateRole(user._id, event.target.value)
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-[#E63946] disabled:opacity-50"
                          aria-label={`Change role for ${user.name}`}
                        >
                          <option value="User">User</option>
                          <option value="Admin">Admin</option>
                        </select>

                        {updatingId === user._id && (
                          <p className="mt-1 text-xs text-gray-500">
                            Updating...
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => deleteUser(user)}
                          disabled={
                            deletingId === user._id ||
                            updatingId === user._id
                          }
                          title="Delete user"
                          aria-label={`Delete ${user.name}`}
                          className="rounded-lg p-2.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId === user._id ? (
                            <FaRotateRight className="animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
