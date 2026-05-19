import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSave, FiSearch, FiShield, FiChevronRight, FiCheckSquare, FiSquare } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../js/api";

const AddUserGroup = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetchWithAuth("/permissions/", { method: "GET" });
        if (response.ok) setAvailablePermissions(await response.json());
      } catch {
        toast.error("Failed to load permissions.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const groupedPermissions = useMemo(() => {
    const groups = {};
    availablePermissions
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .forEach((p) => {
        const category = p.codename.split("_")[1] || "General";
        if (!groups[category]) groups[category] = [];
        groups[category].push(p);
      });
    return groups;
  }, [availablePermissions, search]);

  const allIds = availablePermissions.map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedPermissions.includes(id));

  const toggleSelectAll = () => {
    setSelectedPermissions(allSelected ? [] : allIds);
  };

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleCategory = (perms) => {
    const ids = perms.map((p) => p.id);
    const allCatSelected = ids.every((id) => selectedPermissions.includes(id));
    setSelectedPermissions((prev) =>
      allCatSelected
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return toast.error("Group name is required.");

    setIsSubmitting(true);
    const toastId = toast.loading("Saving group…");
    try {
      const response = await fetchWithAuth("/groups/create/", {
        method: "POST",
        body: JSON.stringify({ name: groupName, permissions: selectedPermissions }),
      });
      if (response.ok) {
        toast.success("Group created!", { id: toastId });
        navigate("/users/groups");
      } else {
        throw new Error("Failed to save.");
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-6">

          {/* ── Header  */}
          
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-xeflow-brand/10 flex items-center justify-center shrink-0">
            <FiShield className="text-xeflow-brand" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-xeflow-text">Create User Group</h1>
            <p className="text-sm text-xeflow-muted mt-0.5">
              Define a permission set for your team.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/users/groups"
            className="px-5 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text font-semibold text-sm hover:bg-xeflow-surface transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-xeflow-brand text-white font-bold text-sm hover:bg-xeflow-brand-alt transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <FiSave size={15} />
            {isSubmitting ? "Saving…" : "Save Group"}
          </button>
        </div>
      </div>

          {/* ── Group Name  */}
          
      <div className="bg-xeflow-surface rounded-2xl border border-xeflow-border shadow-sm p-6">
        <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
          Group Name
        </label>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g. Finance Managers"
          className="w-full p-3.5 bg-xeflow-bg border border-xeflow-border rounded-xl outline-none focus:border-xeflow-brand text-sm font-semibold text-xeflow-text placeholder:text-xeflow-muted/60 transition-colors"
        />
      </div>

          {/* ── Permissions Panel  */}
          
      <div className="bg-xeflow-surface rounded-2xl border border-xeflow-border shadow-sm p-6 space-y-5">

              {/* Toolbar: search + counters + global select-all */}
              
        <div className="flex flex-wrap gap-3 items-center justify-between">
                  {/* Search */}
                  
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xeflow-muted"
              size={15}
            />
            <input
              placeholder="Search permissions…"
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl outline-none focus:border-xeflow-brand text-sm font-medium text-xeflow-text placeholder:text-xeflow-muted/60 transition-colors"
            />
          </div>

                  {/* Counter badge */}
                  
          <div className="flex items-center gap-2 text-sm text-xeflow-muted font-medium shrink-0">
            <span>
              <span className="font-bold text-xeflow-brand">{selectedPermissions.length}</span>
              {" / "}
              {availablePermissions.length} selected
            </span>
          </div>

                  {/* Global select-all button */}
                  
          <button
            type="button"
            onClick={toggleSelectAll}
            disabled={isLoading || availablePermissions.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
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

              {/* Permission groups */}
              
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-28 bg-xeflow-border rounded-lg" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="h-12 bg-xeflow-bg rounded-xl border border-xeflow-border" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xeflow-muted text-sm">No permissions match your search.</p>
          </div>
        ) : (
          <div className="space-y-7">
            {Object.entries(groupedPermissions).map(([category, perms]) => {
              const allCatSelected = perms.every((p) => selectedPermissions.includes(p.id));
              return (
                <div key={category}>
                      {/* Category header */}
                      
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-xeflow-brand uppercase tracking-widest">
                      {category}
                      <FiChevronRight size={12} className="text-xeflow-muted" />
                    </h4>
                    <button
                      type="button"
                      onClick={() => toggleCategory(perms)}
                      className="text-xs font-semibold text-xeflow-muted hover:text-xeflow-brand transition-colors"
                    >
                      {allCatSelected ? "Deselect all" : "Select all"}
                    </button>
                  </div>

                      {/* Permission cards */}
                      
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
                            className={`text-xs font-semibold leading-snug ${
                              enabled ? "text-xeflow-brand" : "text-xeflow-text"
                            }`}
                          >
                            {p.name}
                          </span>
                              {/* Toggle pill */}
                              
                          <div
                            className={`flex-shrink-0 ml-3 w-9 h-[18px] rounded-full p-0.5 flex items-center transition-all ${
                              enabled
                                ? "bg-xeflow-brand justify-end"
                                : "bg-xeflow-border justify-start"
                            }`}
                          >
                            <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUserGroup;