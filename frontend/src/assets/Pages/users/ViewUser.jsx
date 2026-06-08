import { useState, useEffect, useMemo } from "react";
import { API_BASE_URL, fetchWithAuth } from "../../js/api";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiUser,
  FiChevronsRight,
} from "react-icons/fi";
import { RiVipCrownFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchWithAuth("/users/", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter and Sort users

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const fullName =
        `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      return (
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        fullName.includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery]);

  // Pagination logic

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getAvatarUrl = (profilePicture) => {
    if (!profilePicture) return null;
    return profilePicture.startsWith("http")
      ? profilePicture
      : `${ API_BASE_URL }${profilePicture}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-xeflow-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text">Users</h1>
            <p className="text-sm text-xeflow-muted mt-1">
              View and manage all registered users across the platform.
            </p>
          </div>
          <Link
            to="/user/add"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-xeflow-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
          >
            <FiUser size={16} /> Add New User
          </Link>
        </div>

        {/* Data Table Card */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
          
          {/* Toolbar */}

          <div className="p-4 md:px-6 border-b border-xeflow-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-xeflow-bg/30">
            <div className="relative w-full sm:w-80">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xeflow-muted"
                size={16}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand focus:ring-1 focus:ring-xeflow-brand transition-all"
              />
            </div>
            <div className="text-sm font-medium text-xeflow-muted whitespace-nowrap">
              {filteredUsers.length} user{filteredUsers.length !== 1 && "s"}{" "}
              found
            </div>
          </div>

          {/* Table Container */}

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-xeflow-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Skeleton circle width={40} height={40} />
                          <div className="space-y-2">
                            <Skeleton width={120} height={14} className="rounded animate-pulse" />
                            <Skeleton width={80} height={12} className="rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton width={180} height={14} className="rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><Skeleton width={90} height={20} className="rounded animate-pulse" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : paginatedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-xeflow-muted">
                <FiUser size={48} className="opacity-20 mb-4" />
                <p className="font-medium text-lg text-xeflow-text">
                  No users found
                </p>
                <p className="text-sm">
                  Adjust your search query or add a new user.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-xeflow-border">
                  {paginatedUsers.map((u) => {
                    const avatarUrl = getAvatarUrl(u.profile?.profile_picture);
                    const fallbackInitial = u.first_name
                      ? u.first_name[0].toUpperCase()
                      : u.username[0].toUpperCase();

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-xeflow-brand/5 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full shrink-0 bg-gradient-to-br from-xeflow-brand to-xeflow-electric flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent group-hover:ring-xeflow-brand/20 transition-all overflow-hidden shadow-sm">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={u.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                fallbackInitial
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xeflow-text text-sm truncate flex items-center gap-1.5">
                                {u.first_name || u.last_name
                                  ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                  : u.username}

                                {u.is_superuser ? (
                                  <RiVipCrownFill
                                    className="text-amber-500"
                                    size={16}
                                  />
                                ) : u.is_staff ? (
                                  <FiShield
                                    className="text-blue-500"
                                    size={15}
                                  />
                                ) : null}
                              </p>
                              <p className="text-xs text-xeflow-muted truncate">
                                @{u.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-xeflow-text truncate">
                            {u.email}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-xeflow-brand/10 border border-xeflow-brand/20 text-xeflow-brand text-xs font-bold uppercase tracking-wide">
                            <FiShield size={12} />
                            {u.role}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredUsers.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg transition-colors duration-300">
              <span className="text-xs text-xeflow-muted font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
                {filteredUsers.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold text-xeflow-muted hover:bg-xeflow-brand/10 disabled:opacity-50 transition-colors"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === i + 1
                        ? "bg-xeflow-brand text-white shadow-sm shadow-xeflow-brand/20"
                        : "border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/10 transition-colors"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold text-xeflow-muted hover:bg-xeflow-brand/10 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
