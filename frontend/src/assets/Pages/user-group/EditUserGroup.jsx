import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiEdit2,
  FiShield,
  FiTrash2,
  FiPlus,
  FiX,
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiSave,
  FiCheckSquare,
  FiSquare,
  FiChevronRight,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../js/api";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm">
      <div
        className={`bg-xeflow-surface w-full ${maxWidth} rounded-3xl shadow-2xl border border-xeflow-border p-6 flex flex-col max-h-[90vh]`}
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-black text-xeflow-text">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-xeflow-bg rounded-full transition-colors text-xeflow-muted hover:text-xeflow-text"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
};

const EditUserGroup = () => {
  const [groups, setGroups] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Pagination & Sorting

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  
  const [activeModal, setActiveModal] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Edit Name State

  const [editNameValue, setEditNameValue] = useState("");
  const [isSubmittingName, setIsSubmittingName] = useState(false);

  // Edit Permissions State

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permSearchTerm, setPermSearchTerm] = useState("");
  const [isSubmittingPerms, setIsSubmittingPerms] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupsRes, permsRes] = await Promise.all([
        fetchWithAuth("/groups/"),
        fetchWithAuth("/permissions/"),
      ]);

      if (!groupsRes.ok || !permsRes.ok) throw new Error("Failed to load data");

      const [groupsData, permsData] = await Promise.all([
        groupsRes.json(),
        permsRes.json(),
      ]);
      setGroups(groupsData);
      setAvailablePermissions(permsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load user roles.");
      toast.error("Failed to load user roles.");
    } finally {
      setIsLoading(false);
    }
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
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
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



  const groupedPermissions = useMemo(() => {
    const groups = {};
    availablePermissions
      .filter((p) =>
        p.name.toLowerCase().includes(permSearchTerm.toLowerCase()),
      )
      .forEach((p) => {
        const category = p.codename.split("_")[1] || "General";
        if (!groups[category]) groups[category] = [];
        groups[category].push(p);
      });
    return groups;
  }, [availablePermissions, permSearchTerm]);

  const allIds = availablePermissions.map((p) => p.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedPermissions.includes(id));

  const toggleSelectAll = () => {
    setSelectedPermissions(allSelected ? [] : allIds);
  };

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };


  const toggleCategory = (perms) => {
    const ids = perms.map((p) => p.id);
    const allCatSelected = ids.every((id) => selectedPermissions.includes(id));
    setSelectedPermissions((prev) =>
      allCatSelected
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])],
    );
  };


  const openEditName = (group) => {
    setSelectedGroup(group);
    setEditNameValue(group.name);
    setActiveModal("editName");
  };

  const openEditPermissions = (group) => {
    setSelectedGroup(group);
    setSelectedPermissions(group.permissions || []);
    setPermSearchTerm("");
    setActiveModal("editPermissions");
  };

  const openDelete = (group) => {
    setSelectedGroup(group);
    setActiveModal("delete");
  };

  const handleUpdateName = async () => {
    if (!editNameValue.trim()) return toast.error("Group name is required");
    setIsSubmittingName(true);
    const toastId = toast.loading("Updating name...");
    try {
      const res = await fetchWithAuth(`/groups/${selectedGroup.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ name: editNameValue }),
      });
      if (res.ok) {
        toast.success("Name updated successfully", { id: toastId });
        setActiveModal(null);
        fetchData();
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      toast.error("Error updating name", { id: toastId });
    } finally {
      setIsSubmittingName(false);
    }
  };

  const handleUpdatePermissions = async () => {
    setIsSubmittingPerms(true);
    const toastId = toast.loading("Updating permissions...");
    try {
      const res = await fetchWithAuth(`/groups/${selectedGroup.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ permissions: selectedPermissions }),
      });
      if (res.ok) {
        toast.success("Permissions updated successfully", { id: toastId });
        setActiveModal(null);
        fetchData();
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      toast.error("Error updating permissions", { id: toastId });
    } finally {
      setIsSubmittingPerms(false);
    }
  };

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting group...");
    try {
      const res = await fetchWithAuth(`/groups/${selectedGroup.id}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Group deleted successfully", { id: toastId });
        setActiveModal(null);
        fetchData();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting group", { id: toastId });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text flex items-center gap-2">
              <FiUsers className="text-xeflow-brand" /> User Roles & Groups
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Manage permission sets and user roles across the platform.
            </p>
          </div>
          <Link to="/user-group/add">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-xeflow-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-colors shadow-sm">
              <FiPlus size={16} /> Add New Group
            </button>
          </Link>
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
                    onClick={() => handleSort("permissions")}
                  >
                    <div className="flex items-center">
                      Assigned Permissions <SortIcon columnKey="permissions" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text transition-colors duration-300">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <div className="w-8 h-8 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin mb-4"></div>
                        <p>Loading user groups...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-red-500 font-medium"
                    >
                      {error}
                    </td>
                  </tr>
                ) : paginatedGroups.length > 0 ? (
                  paginatedGroups.map((group) => (
                    <tr
                      key={group.id}
                      className="hover:bg-xeflow-brand/5 transition-colors group/row"
                    >
                      <td className="px-6 py-4 font-bold text-xeflow-text">
                        {group.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-xeflow-brand/10 text-xeflow-brand text-xs font-bold border border-xeflow-brand/20">
                          {group.permissions?.length || 0} Permissions
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditName(group)}
                            className="p-2 bg-xeflow-bg hover:bg-blue-100 text-blue-600 border border-xeflow-border hover:border-blue-200 rounded-lg transition-colors tooltip-trigger"
                            title="Edit Name"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => openEditPermissions(group)}
                            className="p-2 bg-xeflow-bg hover:bg-purple-100 text-purple-600 border border-xeflow-border hover:border-purple-200 rounded-lg transition-colors tooltip-trigger"
                            title="Manage Permissions"
                          >
                            <FiShield size={16} />
                          </button>
                          <button
                            onClick={() => openDelete(group)}
                            className="p-2 bg-xeflow-bg hover:bg-red-100 text-red-600 border border-xeflow-border hover:border-red-200 rounded-lg transition-colors tooltip-trigger"
                            title="Delete Group"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <FiUsers size={32} className="mb-3 opacity-50" />
                        <p className="font-medium text-xeflow-text">
                          No user groups found.
                        </p>
                        <p className="text-sm mt-1 mb-4">
                          Your search didn't match any records.
                        </p>
                        <Link to="/users/groups/create">
                          <button className="text-sm font-bold text-xeflow-brand hover:underline">
                            Create a new group
                          </button>
                        </Link>
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
                to {Math.min(currentPage * itemsPerPage, sortedGroups.length)}{" "}
                of {sortedGroups.length} entries
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

      {/* ── Modals  */}

      {/* Edit Name Modal*/}

      <Modal
        isOpen={activeModal === "editName"}
        onClose={() => setActiveModal(null)}
        title="Rename User Group"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-xeflow-muted">
            Enter a new name for the{" "}
            <span className="font-bold text-xeflow-text">
              {selectedGroup?.name}
            </span>{" "}
            group.
          </p>
          <div>
            <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
              Group Name
            </label>
            <input
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              placeholder="e.g. Finance Managers"
              className="w-full p-3.5 bg-xeflow-bg border border-xeflow-border rounded-xl outline-none focus:border-xeflow-brand text-sm font-semibold text-xeflow-text placeholder:text-xeflow-muted/60 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setActiveModal(null)}
              className="px-5 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text font-semibold text-sm hover:bg-xeflow-bg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateName}
              disabled={
                isSubmittingName ||
                !editNameValue.trim() ||
                editNameValue === selectedGroup?.name
              }
              className="px-6 py-2.5 rounded-xl bg-xeflow-brand text-white font-bold text-sm hover:bg-xeflow-brand-alt transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <FiSave /> {isSubmittingName ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/*  Edit Permissions Modal */}
      <Modal
        isOpen={activeModal === "editPermissions"}
        onClose={() => setActiveModal(null)}
        title={`Edit Permissions: ${selectedGroup?.name}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5">
          <p className="text-sm text-xeflow-muted">
            Configure access controls for users in this group.
          </p>

          {/* Toolbar */}

          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xeflow-muted"
                size={15}
              />
              <input
                placeholder="Search permissions..."
                onChange={(e) => setPermSearchTerm(e.target.value)}
                value={permSearchTerm}
                className="w-full pl-10 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl outline-none focus:border-xeflow-brand text-sm font-medium text-xeflow-text placeholder:text-xeflow-muted/60 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-xeflow-muted font-medium shrink-0">
              <span>
                <span className="font-bold text-xeflow-brand">
                  {selectedPermissions.length}
                </span>
                {" / "}
                {availablePermissions.length} selected
              </span>
            </div>
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={availablePermissions.length === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shrink-0 ${
                allSelected
                  ? "bg-xeflow-brand/10 border-xeflow-brand/30 text-xeflow-brand"
                  : "bg-xeflow-bg border-xeflow-border text-xeflow-text hover:border-xeflow-brand/40"
              }`}
            >
              {allSelected ? (
                <FiCheckSquare size={15} />
              ) : (
                <FiSquare size={15} />
              )}
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="border-t border-xeflow-border" />

          {/* Permissions Grid */}

          <div className="space-y-7 pb-4">
            {Object.keys(groupedPermissions).length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xeflow-muted text-sm">
                  No permissions match your search.
                </p>
              </div>
            ) : (
              Object.entries(groupedPermissions).map(([category, perms]) => {
                const allCatSelected = perms.every((p) =>
                  selectedPermissions.includes(p.id),
                );
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-xeflow-brand uppercase tracking-widest">
                        {category}
                        <FiChevronRight
                          size={12}
                          className="text-xeflow-muted"
                        />
                      </h4>
                      <button
                        type="button"
                        onClick={() => toggleCategory(perms)}
                        className="text-xs font-semibold text-xeflow-muted hover:text-xeflow-brand transition-colors"
                      >
                        {allCatSelected ? "Deselect all" : "Select all"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {perms.map((p) => {
                        const enabled = selectedPermissions.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePermission(p.id)}
                            className={`flex items-center justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                              enabled
                                ? "bg-xeflow-brand/8 border-xeflow-brand/30 shadow-sm"
                                : "bg-xeflow-bg border-xeflow-border hover:border-xeflow-brand/30"
                            }`}
                          >
                            <span
                              className={`text-xs font-semibold leading-snug ${enabled ? "text-xeflow-brand" : "text-xeflow-text"}`}
                            >
                              {p.name}
                            </span>
                            <div
                              className={`flex-shrink-0 ml-3 w-9 h-[18px] rounded-full p-0.5 flex items-center transition-all ${enabled ? "bg-xeflow-brand justify-end" : "bg-xeflow-border justify-start"}`}
                            >
                              <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-xeflow-border pt-4 flex justify-end gap-3 mt-4 sticky bottom-0 bg-xeflow-surface py-2">
            <button
              onClick={() => setActiveModal(null)}
              className="px-5 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text font-semibold text-sm hover:bg-xeflow-bg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePermissions}
              disabled={isSubmittingPerms}
              className="px-6 py-2.5 rounded-xl bg-xeflow-brand text-white font-bold text-sm hover:bg-xeflow-brand-alt transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <FiSave /> {isSubmittingPerms ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Delete Modal */}
      <Modal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex gap-3">
            <FiTrash2 className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">
              Are you sure you want to delete the{" "}
              <span className="font-bold">{selectedGroup?.name}</span> group?
              This action cannot be undone and may affect users assigned to this
              role.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setActiveModal(null)}
              className="px-5 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text font-semibold text-sm hover:bg-xeflow-bg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm"
            >
              Delete Group
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditUserGroup;
