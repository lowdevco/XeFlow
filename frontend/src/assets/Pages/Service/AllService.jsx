import  { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiChevronUp,
  FiChevronDown,
  FiAlertCircle,
  FiTag
} from "react-icons/fi";

// ─── IMPORT YOUR API WRAPPER ───
import { fetchWithAuth } from "../../js/api";

const AllService = () => {
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
  const itemsPerPage = 7; // Show 7 services per page

  // ─── FETCH SERVICES ───
  useEffect(() => {
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
        // Handle numeric sorting for price/id, string sorting for others
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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text">
              All Services
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              View your catalog of billable services and products.
            </p>
          </div>
          <Link to="/service/add">
            {" "}
            {/* <-- Make sure this route exists in App.jsx! */}
            <button className="flex items-center gap-2 px-5 py-2.5 bg-xeflow-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-md shadow-xeflow-brand/20">
              <FiPlus size={18} /> Add Service
            </button>
          </Link>
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
          <div className="text-sm font-semibold text-xeflow-muted bg-xeflow-bg px-4 py-2 rounded-lg border border-xeflow-border">
            Total Services:{" "}
            <span className="text-xeflow-text">{filteredServices.length}</span>
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
                      Service ID <SortIcon columnKey="id" />
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
                      Base Price <SortIcon columnKey="price" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group whitespace-nowrap"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Date Added <SortIcon columnKey="created_at" />
                    </div>
                  </th>
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
                      className="hover:bg-xeflow-brand/5 transition-colors"
                    >
                      {/* ID Field */}
                      <td className="px-6 py-4 font-bold text-xeflow-muted whitespace-nowrap">
                        SRV-{service.id.toString().padStart(4, "0")}
                      </td>

                      {/* Name Field */}
                      <td className="px-6 py-4 font-bold text-xeflow-text">
                        <div className="flex items-center gap-3">
                          {service.name}
                        </div>
                      </td>

                      {/* Description Field (Truncated if long) */}
                      <td className="px-6 py-4 text-xeflow-muted line-clamp-2 max-w-xs md:max-w-md my-4 border-none">
                        {service.description || (
                          <span className="italic opacity-50">
                            No description provided
                          </span>
                        )}
                      </td>

                      {/* Price Field */}
                      <td className="px-6 py-4 font-bold text-xeflow-text">
                        {formatCurrency(service.price)}
                      </td>

                      {/* Date Added Field */}
                      <td className="px-6 py-4 text-xeflow-muted text-xs font-medium whitespace-nowrap">
                        {formatDate(service.created_at)}
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
                            : "You haven't added any services to your catalog yet."}
                        </p>
                        {!searchTerm && (
                          <Link to="/service/add">
                            <button className="px-6 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-xeflow-text hover:text-xeflow-brand hover:border-xeflow-brand/50 font-semibold transition-all">
                              Add your first service
                            </button>
                          </Link>
                        )}
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
    </div>
  );
};

export default AllService;
