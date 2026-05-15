import { useState, useEffect, useMemo } from "react";
import { LuIndianRupee } from "react-icons/lu";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiTag,
  FiAlignLeft,
  FiX,
  FiAlertTriangle,
  FiCheck,
  FiChevronUp,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";

// ─── IMPORT YOUR API WRAPPER ───
import { fetchWithAuth } from "../../js/api";


const EditService = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Data Table States
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // ─── MODAL STATES ───
  const [deletingId, setDeletingId] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  // ─── FETCH SERVICES ───
  const fetchServices = async () => {
    try {
      const response = await fetchWithAuth("/services/", { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch services.");

      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ─── DATA TABLE LOGIC ───
  const filteredServices = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.description?.toLowerCase().includes(lower) ||
        `srv-${s.id.toString().padStart(4, "0")}`.includes(lower),
    );
  }, [services, searchTerm]);

  const sortedServices = useMemo(() => {
    let sortable = [...filteredServices];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredServices, sortConfig]);

  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedServices.slice(start, start + itemsPerPage);
  }, [sortedServices, currentPage]);

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

  // ─── API ACTIONS (DELETE & EDIT) ───
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetchWithAuth(`/services/${deletingId}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        setServices(services.filter((s) => s.id !== deletingId));
        setDeletingId(null);
        if (paginatedServices.length === 1 && currentPage > 1)
          setCurrentPage((p) => p - 1);
      }
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setEditForm({
      name: service.name,
      description: service.description || "",
      price: service.price,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth(`/services/${editingService.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
        }),
      });

      if (res.ok) {
        fetchServices();
        setEditingService(null);
      }
    } catch (err) {
      console.error("Error updating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── FORMATTERS ───
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* ── HEADER ── */}
        <div>
          <h1 className="text-2xl font-bold text-xeflow-text">
            Manage Services
          </h1>
          <p className="text-sm text-xeflow-muted mt-1">
            Edit or remove existing services from your catalog.
          </p>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-xeflow-surface p-4 rounded-xl border border-xeflow-border shadow-sm transition-colors duration-300">
          <div className="relative w-full sm:w-96">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by ID, name, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all"
            />
          </div>
        </div>

        {/* ── ERROR ALERT ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
            <FiAlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ── DATA TABLE ── */}
        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg/50 border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider select-none">
                  <th
                    className="px-6 py-4 cursor-pointer group whitespace-nowrap"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID <SortIcon columnKey="id" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Service Name <SortIcon columnKey="name" />
                    </div>
                  </th>
                  <th className="px-6 py-4 w-1/3">Description</th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price <SortIcon columnKey="price" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <div className="w-8 h-8 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin mb-4"></div>
                        <p>Loading catalog...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedServices.length > 0 ? (
                  paginatedServices.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-xeflow-brand/5 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-xeflow-muted whitespace-nowrap">
                        SRV-{service.id.toString().padStart(4, "0")}
                      </td>

                      <td className="px-6 py-4 font-bold text-xeflow-text">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-xeflow-brand/10 text-xeflow-brand flex items-center justify-center shrink-0">
                            <FiTag size={14} />
                          </div>
                          {service.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xeflow-muted line-clamp-2 max-w-xs md:max-w-sm my-4 border-none">
                        {service.description || (
                          <span className="italic opacity-50">
                            No description provided
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-xeflow-text">
                        {formatCurrency(service.price)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-xeflow-brand hover:text-xeflow-brand rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingId(service.id)}
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
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <FiTag size={40} className="mb-4 opacity-20" />
                        <p className="font-bold text-lg text-xeflow-text">
                          No services found
                        </p>
                        <p className="text-sm mt-1 mb-6 max-w-md">
                          {searchTerm
                            ? `Your search for "${searchTerm}" didn't match any records.`
                            : "You haven't added any services yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION FOOTER ── */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg gap-4 transition-colors">
              <span className="text-xs text-xeflow-muted font-medium">
                Showing{" "}
                {sortedServices.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, sortedServices.length)}{" "}
                of {sortedServices.length} entries
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

      {/* ── DELETE MODAL ── */}
      {deletingId && (
        <div className="absolute inset-0 z-50 bg-xeflow-bg/40 backdrop-blur-[2px] rounded-tl-2xl">
          <div className="sticky top-0 w-full h-[calc(100vh-100px)] flex items-center justify-center p-4 pb-32">
            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-xeflow-text mb-2">
                Delete Service?
              </h3>
              <p className="text-sm text-xeflow-muted mb-6">
                This action cannot be undone. It will be permanently removed
                from your catalog.
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

      {/* ── EDIT MODAL ── */}
      {editingService && (
        <div className="absolute inset-0 z-50 bg-xeflow-bg/40 backdrop-blur-[2px] rounded-tl-2xl">
          <div className="sticky top-0 w-full h-[calc(100vh-100px)] flex items-center justify-center p-4 pb-32">
            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="sticky top-0 bg-xeflow-surface/90 backdrop-blur-md border-b border-xeflow-border p-6 flex justify-between items-center z-10 shrink-0">
                <h2 className="text-xl font-bold text-xeflow-text">
                  Edit Service Details
                </h2>
                <button
                  onClick={() => setEditingService(null)}
                  className="p-2 text-xeflow-muted hover:text-xeflow-text rounded-full hover:bg-xeflow-brand/10 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                      Service Name
                    </label>
                    <div className="relative">
                      <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" />
                      <input
                        required
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                      Base Price
                    </label>
                    <div className="relative">
                      <LuIndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" />
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <FiAlignLeft className="absolute left-4 top-4 text-xeflow-muted" />
                      <textarea
                        required
                        rows="4"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand resize-y"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-xeflow-border flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
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

export default EditService;
