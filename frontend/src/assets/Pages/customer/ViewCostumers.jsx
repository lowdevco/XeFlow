import { useState, useEffect, useMemo } from "react";

import {
  FiSearch,
  FiPlus,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiChevronUp,
  FiChevronDown,
  FiMapPin,
  FiX,
  FiEye,
  FiFileText,
  FiDollarSign,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL, fetchWithAuth } from "../../js/api";



const ViewCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [invoiceFilter, setInvoiceFilter] = useState("all");
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
    const fetchCustomersAndInvoices = async () => {
      try {
        const [custRes, invRes] = await Promise.all([
          fetchWithAuth("/customers/", { method: "GET" }),
          fetchWithAuth("/invoices/", { method: "GET" }),
        ]);

        if (!custRes.ok) throw new Error("Failed to fetch customers");
        if (!invRes.ok) throw new Error("Failed to fetch invoices");

        const custData = await custRes.json();
        const invData = await invRes.json();
        setCustomers(custData);
        setInvoices(invData);
      } catch (err) {
        console.error("Error fetching customers & invoices:", err);
        setError(err.message);
        toast.error("Failed to load customers."); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomersAndInvoices();
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

  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return invoices.filter(
      (inv) => inv.customer && inv.customer.id === selectedCustomer.id
    );
  }, [invoices, selectedCustomer]);

  const filteredCustomerInvoices = useMemo(() => {
    if (invoiceFilter === "pending") {
      return customerInvoices.filter(
        (inv) => inv.status !== "Paid" && inv.status !== "Draft"
      );
    }
    return customerInvoices;
  }, [customerInvoices, invoiceFilter]);

  const customerStats = useMemo(() => {
    const stats = { total: 0, paid: 0, pending: 0, count: 0, pendingCount: 0 };
    customerInvoices.forEach((inv) => {
      const total = parseFloat(inv.total_amount) || 0;
      const paid = parseFloat(inv.amount_paid) || 0;
      const due = parseFloat(inv.balance_due) || 0;
      stats.total += total;
      stats.paid += paid;
      stats.pending += due;
      stats.count++;
      if (inv.status !== "Paid" && inv.status !== "Draft") {
        stats.pendingCount++;
      }
    });
    return stats;
  }, [customerInvoices]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Sent":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Draft":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Overdue":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-xeflow-border/50 text-xeflow-muted border-xeflow-border";
    }
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
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setInvoiceFilter("all");
                      }}
                      className="hover:bg-xeflow-brand/5 transition-colors group cursor-pointer"
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
                                    : `${API_BASE_URL}${customer.logo.startsWith("/") ? "" : "/"}${customer.logo}`
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
                        <div className="flex items-center gap-2 text-xeflow-text text-xs mb-1">
                          <FiPhone
                            className="text-xeflow-muted shrink-0"
                            size={14}
                          />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xeflow-text text-xs">
                          <FiMapPin
                            className="text-xeflow-muted shrink-0"
                            size={14}
                          />
                          <span className="truncate max-w-[200px]" title={customer.address}>{customer.address || "N/A"}</span>
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
      {selectedCustomer && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-xeflow-bg/85 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-xeflow-surface rounded-2xl shadow-2xl border border-xeflow-border overflow-hidden animate-in zoom-in-95 duration-200 text-xeflow-text" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between p-6 border-b border-xeflow-border bg-xeflow-bg/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-xeflow-bg border border-xeflow-border flex items-center justify-center overflow-hidden shrink-0">
                  {selectedCustomer.logo ? (
                    <img
                      src={
                        selectedCustomer.logo.startsWith("http")
                          ? selectedCustomer.logo
                          : `${API_BASE_URL}${selectedCustomer.logo.startsWith("/") ? "" : "/"}${selectedCustomer.logo}`
                      }
                      alt={selectedCustomer.company_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <FiBriefcase className="text-xeflow-muted" size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-xeflow-text leading-tight truncate max-w-[240px]">
                    {selectedCustomer.company_name}
                  </h3>
                  <span className="text-[10px] font-black text-xeflow-muted uppercase tracking-wider">
                    CST-{selectedCustomer.id.toString().padStart(4, "0")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-xeflow-muted hover:text-red-500 transition-colors bg-xeflow-bg rounded-full border border-xeflow-border"
                title="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="bg-xeflow-bg/30 border border-xeflow-border rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-1">
                  Contact Profile
                </h4>
                <div className="flex items-center gap-3 text-sm">
                  <FiBriefcase className="text-xeflow-muted shrink-0" size={16} />
                  <div>
                    <p className="text-xs font-semibold text-xeflow-muted">Representative</p>
                    <p className="font-bold">{selectedCustomer.rep_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm pt-2 border-t border-xeflow-border/40">
                  <FiMail className="text-xeflow-muted shrink-0" size={16} />
                  <div>
                    <p className="text-xs font-semibold text-xeflow-muted">Email Address</p>
                    <p className="font-semibold">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm pt-2 border-t border-xeflow-border/40">
                  <FiPhone className="text-xeflow-muted shrink-0" size={16} />
                  <div>
                    <p className="text-xs font-semibold text-xeflow-muted">Phone Number</p>
                    <p className="font-semibold">{selectedCustomer.phone}</p>
                  </div>
                </div>
                {selectedCustomer.address && (
                  <div className="flex items-start gap-3 text-sm pt-2 border-t border-xeflow-border/40">
                    <FiMapPin className="text-xeflow-muted shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs font-semibold text-xeflow-muted">Address</p>
                      <p className="font-semibold leading-relaxed text-xs text-xeflow-muted">{selectedCustomer.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-xeflow-bg/30 border border-xeflow-border rounded-xl p-3 text-center">
                  <p className="text-[9px] font-black uppercase text-xeflow-muted tracking-wider">Total Invoiced</p>
                  <p className="text-sm font-black text-xeflow-text mt-1">{formatMoney(customerStats.total)}</p>
                  <p className="text-[9px] font-semibold text-xeflow-muted mt-0.5">{customerStats.count} Invoices</p>
                </div>
                <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-black uppercase text-green-600 tracking-wider">Total Paid</p>
                  <p className="text-sm font-black text-green-500 mt-1">{formatMoney(customerStats.paid)}</p>
                  <p className="text-[9px] font-semibold text-green-600/70 mt-0.5">Settled</p>
                </div>
                <div className="bg-xeflow-brand/5 border border-xeflow-brand/10 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-black uppercase text-xeflow-brand tracking-wider">Outstanding</p>
                  <p className="text-sm font-black text-xeflow-brand mt-1">{formatMoney(customerStats.pending)}</p>
                  <p className="text-[9px] font-semibold text-xeflow-brand/70 mt-0.5">{customerStats.pendingCount} Pending</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                    Invoice History
                  </h4>
                  <div className="flex rounded-lg bg-xeflow-bg border border-xeflow-border p-0.5 text-xs font-bold select-none shrink-0 animate-in fade-in duration-200">
                    <button
                      onClick={() => setInvoiceFilter("all")}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${invoiceFilter === "all" ? "bg-xeflow-surface text-xeflow-brand shadow-sm" : "text-xeflow-muted hover:text-xeflow-text"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setInvoiceFilter("pending")}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${invoiceFilter === "pending" ? "bg-xeflow-surface text-xeflow-brand shadow-sm" : "text-xeflow-muted hover:text-xeflow-text"}`}
                    >
                      Pending ({customerStats.pendingCount})
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {filteredCustomerInvoices.length > 0 ? (
                    filteredCustomerInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="bg-xeflow-surface border border-xeflow-border/80 hover:border-xeflow-brand/55 rounded-xl p-4 flex items-center justify-between transition-all group"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-xeflow-text shrink-0">{inv.invoice_number}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider shrink-0 ${getStatusColor(inv.status)}`}>
                              {inv.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-xeflow-muted font-semibold">
                            <span>Issue: {new Date(inv.issue_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                            <span>Due: {new Date(inv.due_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-3">
                          <div>
                            <p className="font-black text-sm text-xeflow-text">{formatMoney(inv.total_amount)}</p>
                            {parseFloat(inv.balance_due) > 0 && (
                              <p className="text-[10px] font-bold text-xeflow-brand">Due: {formatMoney(inv.balance_due)}</p>
                            )}
                          </div>
                          <Link to="/invoice/view" className="p-1.5 bg-xeflow-bg border border-xeflow-border group-hover:border-xeflow-brand group-hover:text-xeflow-brand rounded-lg transition-colors">
                            <FiEye size={14} />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-xeflow-bg/20 border border-dashed border-xeflow-border rounded-xl">
                      <FiFileText className="mx-auto text-xeflow-muted opacity-40 mb-3" size={28} />
                      <p className="text-xs font-bold text-xeflow-text">No invoices found</p>
                      <p className="text-[10px] text-xeflow-muted mt-1 uppercase tracking-wider">
                        {invoiceFilter === "pending" ? "No pending invoices" : "No invoices linked to this client"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ViewCustomers;
