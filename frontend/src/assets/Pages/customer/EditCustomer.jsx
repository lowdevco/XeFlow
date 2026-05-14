import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiX,
  FiAlertTriangle,
  FiUpload,
  FiCheck,
  FiUser,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";

const EditCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Data Table States
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Change this to 10 if you want longer tables!

  // Modal States
  const [deletingId, setDeletingId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editForm, setEditForm] = useState({
    company_name: "",
    rep_name: "",
    phone: "",
    email: "",
    newLogo: null,
  });

  // ─── FETCH CUSTOMERS ────────────────────────────────────────────────────
  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/customers/");
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ─── DATA TABLE LOGIC: SEARCH -> SORT -> PAGINATE ───────────────────────

  // 1. Search
  const filteredCustomers = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.company_name.toLowerCase().includes(lower) ||
        c.rep_name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower) ||
        c.id.toString().includes(lower) ||
        `cst-${c.id.toString().padStart(4, "0")}`.includes(lower),
    );
  }, [customers, searchTerm]);

  // 2. Sort
  const sortedCustomers = useMemo(() => {
    let sortable = [...filteredCustomers];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredCustomers, sortConfig]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCustomers.slice(start, start + itemsPerPage);
  }, [sortedCustomers, currentPage]);

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

  // ─── API ACTIONS (DELETE & EDIT) ────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch(
        `http://127.0.0.1:8000/api/customers/${deletingId}/`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setCustomers(customers.filter((c) => c.id !== deletingId));
        setDeletingId(null);
        // Go back a page if we delete the last item on the current page
        if (paginatedCustomers.length === 1 && currentPage > 1)
          setCurrentPage((p) => p - 1);
      }
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      company_name: customer.company_name,
      rep_name: customer.rep_name,
      phone: customer.phone,
      email: customer.email,
      newLogo: null,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("company_name", editForm.company_name);
    submitData.append("rep_name", editForm.rep_name);
    submitData.append("phone", editForm.phone);
    submitData.append("email", editForm.email);
    if (editForm.newLogo) submitData.append("logo", editForm.newLogo);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/customers/${editingCustomer.id}/`,
        { method: "PATCH", body: submitData },
      );
      if (res.ok) {
        fetchCustomers();
        setEditingCustomer(null);
      }
    } catch (err) {
      console.error("Error updating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-xeflow-text">
            Manage Customers
          </h1>
          <p className="text-sm text-xeflow-muted mt-1">
            Edit or remove existing customer profiles.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-xeflow-surface p-4 rounded-xl border border-xeflow-border shadow-sm transition-colors duration-300">
          <div className="relative w-full sm:w-96">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xeflow-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by ID, company, name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }} // Reset page on search
              className="w-full pl-10 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all duration-200"
            />
          </div>
        </div>

        {/* ── DATA TABLE ── */}
        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("company_name")}
                  >
                    <div className="flex items-center">
                      Company <SortIcon columnKey="company_name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("rep_name")}
                  >
                    <div className="flex items-center">
                      Representative <SortIcon columnKey="rep_name" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Joined Date <SortIcon columnKey="created_at" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text transition-colors duration-300">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-xeflow-muted"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-xeflow-brand/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-xeflow-bg border border-xeflow-border flex items-center justify-center overflow-hidden shrink-0">
                            {customer.logo ? (
                              <img
                                src={
                                  customer.logo.startsWith("http")
                                    ? customer.logo
                                    : `http://127.0.0.1:8000${customer.logo.startsWith("/") ? "" : "/"}${customer.logo}`
                                }
                                alt="logo"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <FiBriefcase
                                className="text-xeflow-muted"
                                size={18}
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-xeflow-text">
                              {customer.company_name}
                            </p>
                            <p className="text-xs text-xeflow-muted mt-0.5">
                              ID: CST-{customer.id.toString().padStart(4, "0")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-xeflow-text">
                        {customer.rep_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <FiMail className="text-xeflow-muted" size={14} />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FiPhone className="text-xeflow-muted" size={14} />
                          <span>{customer.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xeflow-muted font-medium">
                        {formatDate(customer.created_at)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-xeflow-brand hover:text-xeflow-brand rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingId(customer.id)}
                            className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-red-500 hover:text-red-500 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-xeflow-muted"
                    >
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION FOOTER ── */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg transition-colors duration-300">
              <span className="text-xs text-xeflow-muted font-medium">
                Showing{" "}
                {sortedCustomers.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to{" "}
                {Math.min(currentPage * itemsPerPage, sortedCustomers.length)}{" "}
                of {sortedCustomers.length} entries
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${currentPage === i + 1 ? "bg-xeflow-brand text-white shadow-sm shadow-xeflow-brand/20" : "border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/10"}`}
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

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* DELETE MODAL (Kept the perfectly centered fixes) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {deletingId && (
        <div className="absolute inset-0 z-40 bg-xeflow-bg/40 backdrop-blur-[2px] rounded-tl-2xl">
          <div className="sticky top-0 w-full h-[calc(100vh-100px)] flex items-center justify-center p-4 pb-32">
            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-xeflow-text mb-2">
                Delete Customer?
              </h3>
              <p className="text-sm text-xeflow-muted mb-6">
                This action cannot be undone. All data associated with this
                customer will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  disabled={isSubmitting}
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 rounded-xl border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/5 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                >
                  {isSubmitting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* EDIT MODAL (Kept the perfectly centered fixes) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {editingCustomer && (
        <div className="absolute inset-0 z-40 bg-xeflow-bg/40 backdrop-blur-[2px] rounded-tl-2xl">
          <div className="sticky top-0 w-full h-[calc(100vh-100px)] flex items-center justify-center p-4 pb-32">
            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="sticky top-0 bg-xeflow-surface/90 backdrop-blur-md border-b border-xeflow-border p-6 flex justify-between items-center z-10 shrink-0">
                <h2 className="text-xl font-bold text-xeflow-text">
                  Edit Customer Details
                </h2>
                <button
                  onClick={() => setEditingCustomer(null)}
                  className="p-2 text-xeflow-muted hover:text-xeflow-text rounded-full hover:bg-xeflow-brand/10 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-3">
                    Update Logo
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-xeflow-border bg-xeflow-bg flex items-center justify-center text-xeflow-muted relative overflow-hidden">
                      {editForm.newLogo ? (
                        <img
                          src={URL.createObjectURL(editForm.newLogo)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : editingCustomer.logo ? (
                        <img
                          src={
                            editingCustomer.logo.startsWith("http")
                              ? editingCustomer.logo
                              : `http://127.0.0.1:8000${editingCustomer.logo.startsWith("/") ? "" : "/"}${editingCustomer.logo}`
                          }
                          alt="old logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUpload size={20} />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            newLogo: e.target.files[0],
                          })
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="text-sm text-xeflow-muted">
                      <p className="font-medium text-xeflow-text">
                        Click icon to replace logo
                      </p>
                      <p className="text-xs mt-1">
                        Leave blank to keep current logo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-xeflow-muted uppercase mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" />
                      <input
                        required
                        type="text"
                        value={editForm.company_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            company_name: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-xeflow-muted uppercase mb-2">
                      Representative
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" />
                      <input
                        required
                        type="text"
                        value={editForm.rep_name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, rep_name: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-xeflow-muted uppercase mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" />
                      <input
                        required
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-xeflow-muted uppercase mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" />
                      <input
                        required
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-xeflow-border flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-6 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-xeflow-brand text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-xeflow-brand/20 transition-all disabled:opacity-50"
                  >
                    <FiCheck /> {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCustomer;
