import { useState, useEffect, useMemo } from "react";

import {
  FiSearch,
  FiPlus,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../js/api";



const ViewCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetchWithAuth("/customers/", {
          method: "GET",
        });

        if (!response.ok) throw new Error("Failed to fetch customers");

        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.message);
        toast.error("Failed to load customers."); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

    // Data Table Logic
    
  const filteredCustomers = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return customers.filter((customer) => {
      const formattedId = `cst-${customer.id.toString().padStart(4, "0")}`;
      return (
        customer.company_name.toLowerCase().includes(lowerCaseSearch) ||
        customer.rep_name.toLowerCase().includes(lowerCaseSearch) ||
        customer.email.toLowerCase().includes(lowerCaseSearch) ||
        customer.id.toString().includes(lowerCaseSearch) ||
        formattedId.includes(lowerCaseSearch)
      );
    });
  }, [customers, searchTerm]);

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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text">Customers</h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Manage your client database and contact information.
            </p>
          </div>
          <Link to="/customer/add">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-xeflow-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-colors shadow-sm">
              <FiPlus size={16} /> Add Customer
            </button>
          </Link>
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
              placeholder="Search by ID, company, name, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all duration-200"
            />
          </div>
          <div className="text-sm font-semibold text-xeflow-muted">
            Total Customers:{" "}
            <span className="text-xeflow-text">{filteredCustomers.length}</span>
          </div>
        </div>

        {/* Data Table */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID <SortIcon columnKey="id" />
                    </div>
                  </th>
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
                </tr>
              </thead>

              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text transition-colors duration-300">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <div className="w-8 h-8 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin mb-4"></div>
                        <p>Loading customers...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-red-500 font-medium"
                    >
                      {error}
                    </td>
                  </tr>
                ) : paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-xeflow-brand/5 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-xeflow-text whitespace-nowrap">
                        CST-{customer.id.toString().padStart(4, "0")}
                      </td>

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
                                alt={customer.company_name}
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
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-xeflow-text">
                        {customer.rep_name}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <FiMail
                            className="text-xeflow-muted shrink-0"
                            size={14}
                          />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xeflow-text text-xs">
                          <FiPhone
                            className="text-xeflow-muted shrink-0"
                            size={14}
                          />
                          <span>{customer.phone}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xeflow-muted font-medium">
                        {formatDate(customer.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <FiBriefcase size={32} className="mb-3 opacity-50" />
                        <p className="font-medium text-xeflow-text">
                          No customers found.
                        </p>
                        <p className="text-sm mt-1 mb-4">
                          Your search for "{searchTerm}" didn't match any
                          records.
                        </p>
                        <Link to="/customer/add">
                          <button className="text-sm font-bold text-xeflow-brand hover:underline">
                            Add a new customer
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}

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
    </div>
  );
};

export default ViewCustomers;
