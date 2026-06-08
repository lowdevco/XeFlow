import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import {
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiUsers,
  FiShield,
  FiMail,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../js/api";

const ViewUserGroup = () => {
  const [groups, setGroups] = useState([]);
  const [permissionsMap, setPermissionsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const [expandedGroupId, setExpandedGroupId] = useState(null);

  // Pagination & Sorting
  
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupsRes, permsRes, usersRes] = await Promise.all([
        fetchWithAuth("/groups/"),
        fetchWithAuth("/permissions/"),
        fetchWithAuth("/users/"),
      ]);

      if (!groupsRes.ok || !permsRes.ok || !usersRes.ok) throw new Error("Failed to load data");

      const [groupsData, permsData, usersData] = await Promise.all([
        groupsRes.json(),
        permsRes.json(),
        usersRes.json(),
      ]);

      // Filter users with the default User role

      const defaultUsers = usersData.filter(
        (u) => u.role === "User" || !u.role
      );

      const userGroup = {
        id: "default-user",
        name: "User",
        users: defaultUsers,
        permissions: [],
      };

      setGroups([userGroup, ...groupsData]);

      const pMap = {};
      permsData.forEach((p) => {
        pMap[p.id] = p;
      });
      setPermissionsMap(pMap);
    } catch (err) {
      console.error(err);
      setError("Failed to load user roles.");
      toast.error("Failed to load user roles.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccordion = (groupId) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };


  const filteredGroups = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(lower));
  }, [groups, searchTerm]);

  const sortedGroups = useMemo(() => {
    let sortable = [...filteredGroups];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === "permissions") {
          valA = a.permissions?.length || 0;
          valB = b.permissions?.length || 0;
        } else if (sortConfig.key === "users") {
          valA = a.users?.length || 0;
          valB = b.users?.length || 0;
        } else if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredGroups, sortConfig]);

  const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedGroups.slice(start, start + itemsPerPage);
  }, [sortedGroups, currentPage]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return (
        <FiChevronDown className="opacity-0 group-hover:opacity-50 transition-opacity ml-1" />
      );
    return sortConfig.direction === "asc" ? (
      <FiChevronUp className="text-xeflow-brand ml-1" />
    ) : (
      <FiChevronDown className="text-xeflow-brand ml-1" />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
      <div className="max-w-6xl mx-auto space-y-6">
           
        {/* ── Header  */}
              
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text flex items-center gap-2">
              <FiUsers className="text-xeflow-brand" /> View User Groups
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Browse roles, view assigned users, and inspect permissions.
            </p>
          </div>
        </div>

              {/* ── Toolbar  */}
              
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-xeflow-surface p-4 rounded-xl border border-xeflow-border shadow-sm transition-colors duration-300">
          <div className="relative w-full sm:w-96">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xeflow-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by group name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all duration-200"
            />
          </div>
          <div className="text-sm font-semibold text-xeflow-muted">
            Total Groups:{" "}
            <span className="text-xeflow-text">{filteredGroups.length}</span>
          </div>
        </div>

              {/* ── Data Table  */}
              
        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Group Name <SortIcon columnKey="name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("users")}
                  >
                    <div className="flex items-center">
                      Users <SortIcon columnKey="users" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("permissions")}
                  >
                    <div className="flex items-center">
                      Permissions <SortIcon columnKey="permissions" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text transition-colors duration-300">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton width={120} height={14} className="rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><Skeleton width={80} height={24} className="rounded-full animate-pulse" /></td>
                      <td className="px-6 py-4"><Skeleton width={120} height={24} className="rounded-full animate-pulse" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton width={32} height={20} className="rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-red-500 font-medium"
                    >
                      {error}
                    </td>
                  </tr>
                ) : paginatedGroups.length > 0 ? (
                  paginatedGroups.map((group) => {
                    const isExpanded = expandedGroupId === group.id;

                    return (
                      <Fragment key={group.id}>
                       
                        {/* Main Row */}
                        <tr
                          onClick={() => toggleAccordion(group.id)}
                          className={`hover:bg-xeflow-brand/5 transition-colors cursor-pointer group/row ${
                            isExpanded ? "bg-xeflow-brand/5" : ""
                          }`}
                        >
                          <td className="px-6 py-4 font-bold text-xeflow-text">
                            {group.name}
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                              <FiUsers className="mr-1.5" size={12} />
                              {group.users?.length || 0} Users
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-xeflow-brand/10 text-xeflow-brand text-xs font-bold border border-xeflow-brand/20">
                              <FiShield className="mr-1.5" size={12} />
                              {group.permissions?.length || 0} Permissions
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-xeflow-muted group-hover/row:text-xeflow-brand transition-colors">
                              {isExpanded ? (
                                <FiChevronUp size={20} />
                              ) : (
                                <FiChevronDown size={20} />
                              )}
                            </button>
                          </td>
                        </tr>

                            {/* Accordion Content Row */}
                            
                        {isExpanded && (
                          <tr className="bg-xeflow-bg/50 border-b-2 border-b-xeflow-brand/20">
                            <td colSpan="5" className="p-0">
                              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-200">
                                          
                                {/* Users List */}
                                            
                                <div className="space-y-4">
                                  <h4 className="text-sm font-bold text-xeflow-text uppercase tracking-wider flex items-center gap-2 border-b border-xeflow-border pb-2">
                                    <FiUsers className="text-xeflow-brand" />
                                    Assigned Users
                                  </h4>
                                  {group.users && group.users.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                      {group.users.map((u) => (
                                        <div
                                          key={u.id}
                                          className="flex items-center gap-3 p-3 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm"
                                        >
                                          <div className="w-10 h-10 rounded-full bg-xeflow-brand/10 flex items-center justify-center text-xeflow-brand font-bold text-sm shrink-0">
                                            {u.username.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-bold text-xeflow-text truncate">
                                              {u.username}
                                            </p>
                                            <p className="text-xs text-xeflow-muted truncate flex items-center gap-1">
                                              <FiMail size={10} /> {u.email}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-4 text-sm text-xeflow-muted text-center border border-dashed border-xeflow-border rounded-xl">
                                      No users assigned to this group yet.
                                    </div>
                                  )}
                                </div>

                                {/* Permissions List */}
                                
                                <div className="space-y-4">
                                  <h4 className="text-sm font-bold text-xeflow-text uppercase tracking-wider flex items-center gap-2 border-b border-xeflow-border pb-2">
                                    <FiShield className="text-xeflow-brand" />
                                    Permissions
                                  </h4>
                                  {group.permissions && group.permissions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {group.permissions.map((permId) => {
                                        const p = permissionsMap[permId];
                                        return (
                                          <div
                                            key={permId}
                                            className="px-3 py-1.5 bg-xeflow-surface border border-xeflow-border rounded-lg text-xs font-semibold text-xeflow-text flex items-center gap-1.5 shadow-sm"
                                            title={p?.codename || `Permission ID ${permId}`}
                                          >
                                            <div className="w-1.5 h-1.5 rounded-full bg-xeflow-brand" />
                                            {p ? p.name : `Unknown Permission (${permId})`}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="p-4 text-sm text-xeflow-muted text-center border border-dashed border-xeflow-border rounded-xl">
                                      This group has no specific permissions.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <FiUsers size={32} className="mb-3 opacity-50" />
                        <p className="font-medium text-xeflow-text">
                          No user groups found.
                        </p>
                        <p className="text-sm mt-1 mb-4">
                          Your search didn't match any records.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

                  {/* ── Pagination  */}
                  
          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg transition-colors duration-300">
              <span className="text-xs text-xeflow-muted font-medium">
                Showing{" "}
                {sortedGroups.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, sortedGroups.length)} of{" "}
                {sortedGroups.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold text-xeflow-muted hover:bg-xeflow-brand/10 disabled:opacity-50 transition-colors"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === i + 1
                        ? "bg-xeflow-brand text-white shadow-sm shadow-xeflow-brand/20"
                        : "border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/10"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold text-xeflow-text hover:bg-xeflow-brand/10 disabled:opacity-50 transition-colors"
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

export default ViewUserGroup;