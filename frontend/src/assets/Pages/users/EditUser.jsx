import { useState, useEffect, useMemo } from "react";
import { fetchWithAuth } from "../../js/api";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiShield,
  FiUser,
  FiMail,
  FiLock,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiUsers,
} from "react-icons/fi";
import { RiVipCrownFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";


const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm animate-in fade-in duration-200">
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

const EditUser = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting State

  const [sortConfig, setSortConfig] = useState({
    key: "username",
    direction: "asc",
  });

  // Modal States

  const [activeModal, setActiveModal] = useState(null); 
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit Form Fields State

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    role_id: "",
    is_staff: false,
    is_superuser: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, groupsRes] = await Promise.all([
        fetchWithAuth("/users/"),
        fetchWithAuth("/groups/"),
      ]);

      if (usersRes.ok && groupsRes.ok) {
        const usersData = await usersRes.json();
        const groupsData = await groupsRes.json();
        setUsers(usersData);
        setGroups(groupsData);
      } else {
        toast.error("Failed to load user and role data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (profilePicture) => {
    if (!profilePicture) return null;
    return profilePicture.startsWith("http")
      ? profilePicture
      : `http://127.0.0.1:8000${profilePicture}`;
  };


  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      return (
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        fullName.includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery]);

  const sortedUsers = useMemo(() => {
    let sortable = [...filteredUsers];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredUsers, sortConfig]);

  // Pagination logic

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage]);

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

  // Open Modals

  const openEditModal = (u) => {
    setSelectedUser(u);
    const matchedGroup = groups.find((g) => g.name === u.role);
    setFormData({
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      username: u.username || "",
      email: u.email || "",
      password: "",
      role_id: matchedGroup ? matchedGroup.id : "",
      is_staff: u.is_staff || false,
      is_superuser: u.is_superuser || false,
    });
    setActiveModal("edit");
  };

  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setActiveModal("delete");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (field) => {

    if (field === "is_superuser" && !currentUser?.is_superuser) {
      toast.error("Only superusers can manage superuser roles.");
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) {
      return toast.error("Username and email are required fields.");
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Saving user details...");

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
        role_id: formData.role_id ? parseInt(formData.role_id, 10) : 0,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetchWithAuth(`/users/${selectedUser.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("User updated successfully", { id: toastId });
        setActiveModal(null);
        fetchData();
      } else {
        const errorData = await res.json();
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMsg = Array.isArray(errorData[firstErrorKey])
          ? errorData[firstErrorKey][0]
          : errorData.detail || "Failed to update user.";
        toast.error(errorMsg, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating user detail.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleDeleteUser = async () => {
    const toastId = toast.loading("Deleting user...");
    try {
      const res = await fetchWithAuth(`/users/${selectedUser.id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("User deleted successfully", { id: toastId });
        setActiveModal(null);
        fetchData();
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Failed to delete user.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting user.", { id: toastId });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/*Header  */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text flex items-center gap-2">
              <FiUsers className="text-xeflow-brand" /> Manage Users
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Administer registered system users, adjust roles, and enforce security flags.
            </p>
          </div>
          <Link to="/user/add">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-xeflow-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-colors shadow-sm">
              Add New User
            </button>
          </Link>
        </div>

        {/*  Search Toolbar  */}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-xeflow-surface p-4 rounded-xl border border-xeflow-border shadow-sm transition-colors duration-300">
          <div className="relative w-full sm:w-96">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xeflow-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by username, email, name, role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all duration-200"
            />
          </div>
          <div className="text-sm font-semibold text-xeflow-muted">
            Total Matches:{" "}
            <span className="text-xeflow-text">{filteredUsers.length}</span>
          </div>
        </div>

        {/* Data Table  */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("first_name")}
                  >
                    <div className="flex items-center">
                      User Profile <SortIcon columnKey="first_name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Contact <SortIcon columnKey="email" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Assigned Role <SortIcon columnKey="role" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text transition-colors duration-300">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <div className="w-8 h-8 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin mb-4"></div>
                        <p className="font-semibold text-sm">Loading systems and profiles...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => {
                    const avatarUrl = getAvatarUrl(u.profile?.profile_picture);
                    const fallbackInitial = u.first_name
                      ? u.first_name[0].toUpperCase()
                      : u.username[0].toUpperCase();
                    
                    const isTargetSuperuser = u.is_superuser;
                    const canEdit = currentUser?.is_superuser || !isTargetSuperuser;

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-xeflow-brand/5 transition-colors group/row"
                      >

                        {/* User Column */}

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
                                {u.first_name} {u.last_name}
                                {u.is_superuser ? (
                                  <RiVipCrownFill className="text-amber-500" size={16} />
                                ) : u.is_staff ? (
                                  <FiShield className="text-blue-500" size={15} />
                                ) : null}
                              </p>
                              <p className="text-xs text-xeflow-muted truncate">
                                @{u.username}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact Column */}

                        <td className="px-6 py-4 font-semibold text-xeflow-text">
                          {u.email}
                        </td>

                        {/* Role Column */}

                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-xeflow-brand/10 border border-xeflow-brand/20 text-xeflow-brand text-xs font-bold uppercase tracking-wide">
                            <FiShield size={12} />
                            {u.role}
                          </div>
                        </td>

                        {/* Actions Column */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover/row:opacity-100 transition-opacity">
                            {canEdit ? (
                              <>
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="p-2 bg-xeflow-bg hover:bg-blue-100 text-blue-600 border border-xeflow-border hover:border-blue-200 rounded-lg transition-colors"
                                  title="Edit User Details"
                                >
                                  <FiEdit2 size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(u)}
                                  className="p-2 bg-xeflow-bg hover:bg-red-100 text-red-600 border border-xeflow-border hover:border-red-200 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <div className="relative group/tooltip inline-block">
                                <button
                                  disabled
                                  className="p-2 bg-xeflow-bg opacity-40 text-xeflow-muted border border-xeflow-border rounded-lg cursor-not-allowed"
                                >
                                  <FiLock size={16} />
                                </button>
                                <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-48 p-2 bg-xeflow-surface border border-xeflow-border text-xeflow-text text-xs rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 text-center font-semibold leading-normal">
                                  Superusers can only be managed by another Superuser.
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <FiUser size={48} className="opacity-20 mb-4" />
                        <p className="font-semibold text-lg text-xeflow-text">No registered users matched</p>
                        <p className="text-sm mt-1">Try adapting your search parameter or filter keyword.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination  */}

          {!loading && totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg transition-colors duration-300">
              <span className="text-xs text-xeflow-muted font-medium">
                Showing {sortedUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} entries
              </span>
              <div className="flex gap-2 items-center">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border border-xeflow-border text-xeflow-muted hover:text-xeflow-text hover:bg-xeflow-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft size={16} />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                        currentPage === i + 1
                          ? "bg-xeflow-brand text-white border border-xeflow-brand"
                          : "text-xeflow-muted border border-transparent hover:bg-xeflow-surface hover:border-xeflow-border"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-xeflow-border text-xeflow-muted hover:text-xeflow-text hover:bg-xeflow-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/*  Modals  */}






      {/* Edit User Modal */}

      
      <Modal
        isOpen={activeModal === "edit"}
        onClose={() => setActiveModal(null)}
        title={`Edit User: @${selectedUser?.username}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateUser} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-xeflow-bg/30 rounded-2xl border border-xeflow-border shrink-0">
            <div className="w-16 h-16 rounded-full shrink-0 bg-gradient-to-br from-xeflow-brand to-xeflow-electric flex items-center justify-center text-white font-extrabold text-2xl overflow-hidden shadow-md">
              {getAvatarUrl(selectedUser?.profile?.profile_picture) ? (
                <img
                  src={getAvatarUrl(selectedUser?.profile?.profile_picture)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                selectedUser?.first_name ? selectedUser.first_name[0].toUpperCase() : selectedUser?.username[0].toUpperCase()
              )}
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base font-bold text-xeflow-text">
                {formData.first_name} {formData.last_name || `@${selectedUser?.username}`}
              </h4>
              <p className="text-xs text-xeflow-muted mt-1">
                Profile picture is managed directly by the user on their Profile settings page.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name */}

            <div className="space-y-2">
              <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleFormChange}
                placeholder="First Name"
                className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-colors"
              />
            </div>

            {/* Last Name */}

            <div className="space-y-2">
              <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleFormChange}
                placeholder="Last Name"
                className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-colors"
              />
            </div>

            {/* Username */}

            <div className="space-y-2">
              <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xeflow-muted" size={16} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  placeholder="johndoe"
                  className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email Address */}

            <div className="space-y-2">
              <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xeflow-muted" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}

            <div className="space-y-2">
              <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                Password Reset <span className="text-[10px] text-xeflow-muted lowercase">(Leave empty to keep current)</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xeflow-muted" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="New Password"
                  className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-colors"
                />
              </div>
            </div>

            {/* User Role selection */}

            <div className="space-y-2">
              <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                User Role / Group
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand transition-all cursor-pointer"
              >
                <option value="">No Role / Default (User)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-xeflow-border my-6" />

          {/* Privilege Status Toggles */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Is Staff */}

            <div
              onClick={() => handleToggleChange("is_staff")}
              className="flex items-center justify-between p-4 bg-xeflow-bg/30 border border-xeflow-border rounded-xl cursor-pointer hover:border-xeflow-brand/40 transition-colors"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-xeflow-text flex items-center gap-1.5">
                  <FiShield size={16} className="text-blue-500" /> Staff Status
                </p>
                <p className="text-xs text-xeflow-muted">
                  Enables basic administrative access rights.
                </p>
              </div>
              <div
                className={`w-9 h-[18px] rounded-full p-0.5 flex items-center transition-all ${
                  formData.is_staff ? "bg-xeflow-brand justify-end" : "bg-xeflow-border justify-start"
                }`}
              >
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
              </div>
            </div>

            {/* Is Superuser */}

            <div
              onClick={() => handleToggleChange("is_superuser")}
              className={`flex items-center justify-between p-4 bg-xeflow-bg/30 border border-xeflow-border rounded-xl transition-colors ${
                currentUser?.is_superuser
                  ? "cursor-pointer hover:border-xeflow-brand/40"
                  : "cursor-not-allowed opacity-60"
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-xeflow-text flex items-center gap-1.5">
                  <RiVipCrownFill size={16} className="text-amber-500" /> Superuser Status
                  {!currentUser?.is_superuser && <FiLock size={12} className="text-xeflow-muted ml-1" />}
                </p>
                <p className="text-xs text-xeflow-muted">
                  Enables complete, unrestricted control over the platform.
                </p>
              </div>
              <div
                className={`w-9 h-[18px] rounded-full p-0.5 flex items-center transition-all ${
                  formData.is_superuser ? "bg-xeflow-brand justify-end" : "bg-xeflow-border justify-start"
                }`}
              >
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-5 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text font-semibold text-sm hover:bg-xeflow-bg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-xeflow-brand text-white font-bold text-sm hover:bg-xeflow-brand-alt transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <FiSave /> {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/*Delete User Modal */}

      <Modal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        title="Confirm User Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl flex gap-3">
            <FiTrash2 className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium leading-normal">
              Are you sure you want to delete the user account for{" "}
              <span className="font-bold">@{selectedUser?.username}</span> (
              {selectedUser?.first_name} {selectedUser?.last_name})? This action is permanent,
              un-doable, and immediately revokes all system permissions.
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
              onClick={handleDeleteUser}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm"
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditUser;