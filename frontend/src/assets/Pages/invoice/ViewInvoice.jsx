import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiEye,
  FiDownload,
  FiMail,
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiPrinter,
  FiFilter,
  FiFileText,
  FiCreditCard,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth, API_BASE_URL } from "../../js/api";
import { generateInvoicePDF } from "../../js/PDF_template";
import SendEmailModal from "../../components/SendEmailModal";
import CustomSelect from "../../components/CustomSelect";
import Skeleton from "react-loading-skeleton";


// Const Values 


import { COMPANY } from "../../info/company";
import { formatMoney, formatDate } from "../../info/formatter";
import { API_ROUTES } from "../../../Routing/apiroutes";

const ViewInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState("All");
  const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [emailInvoice, setEmailInvoice] = useState(null);

  // Accoradian
  
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentInvoice) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    if (amt > parseFloat(paymentInvoice.balance_due)) {
      toast.error(`Payment cannot exceed outstanding balance of ${formatMoney(paymentInvoice.balance_due)}`);
      return;
    }

    const toastId = toast.loading("Recording payment...");
    setIsRecordingPayment(true);

    try {
      const response = await fetchWithAuth(API_ROUTES.INVOICE_PAYMENT(paymentInvoice.id), {
        method: "POST",
        body: JSON.stringify({ amount: amt }),
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        

        setInvoices((prevInvoices) =>
          prevInvoices.map((inv) =>
            inv.id === updatedInvoice.id ? updatedInvoice : inv
          )
        );

        toast.success("Payment recorded successfully!", { id: toastId });
        setPaymentInvoice(null);
        setPaymentAmount("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to record payment.", { id: toastId });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Network error while recording payment.", { id: toastId });
    } finally {
      setIsRecordingPayment(false);
    }
  };

  useEffect(() => {
    const fetchInvoicesAndCustomers = async () => {
      try {
        const [invRes, custRes] = await Promise.all([
          fetchWithAuth(API_ROUTES.INVOICES, { method: "GET" }),
          fetchWithAuth(API_ROUTES.CUSTOMERS, { method: "GET" }),
        ]);

        if (!invRes.ok) throw new Error("Failed to fetch invoices.");
        if (!custRes.ok) throw new Error("Failed to fetch customers.");

        const invData = await invRes.json();
        const custData = await custRes.json();
        setInvoices(invData);
        setCustomers(custData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        toast.error("Failed to load invoices."); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoicesAndCustomers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableYears = useMemo(() => {
    const years = invoices.map((inv) => new Date(inv.issue_date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [invoices]);

  const statusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "Paid", label: "Paid" },
    { value: "Sent", label: "Sent" },
    { value: "Draft", label: "Draft" },
    { value: "Overdue", label: "Overdue" },
    { value: "Partially Paid", label: "Partially Paid" },
  ];

  const monthOptions = [
    { value: "All", label: "All Months" },
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  const yearOptions = useMemo(() => {
    return [
      { value: "All", label: "All Years" },
      ...availableYears.map((y) => ({ value: y.toString(), label: y.toString() })),
    ];
  }, [availableYears]);

  const filteredInvoices = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoice_number?.toLowerCase().includes(lower) ||
        inv.customer?.company_name?.toLowerCase().includes(lower) ||
        inv.status?.toLowerCase().includes(lower);

      const matchesCustomer =
        !selectedCustomerFilter ||
        inv.customer?.id === selectedCustomerFilter.id;

      const matchesStatus =
        selectedStatusFilter === "All" ||
        inv.status?.toLowerCase() === selectedStatusFilter.toLowerCase();

      const invDate = new Date(inv.issue_date);
      const matchesMonth =
        selectedMonthFilter === "All" ||
        invDate.getMonth() === parseInt(selectedMonthFilter);

      const matchesYear =
        selectedYearFilter === "All" ||
        invDate.getFullYear() === parseInt(selectedYearFilter);

      return matchesSearch && matchesCustomer && matchesStatus && matchesMonth && matchesYear;
    });
  }, [invoices, searchTerm, selectedCustomerFilter, selectedStatusFilter, selectedMonthFilter, selectedYearFilter]);

  const sortedInvoices = useMemo(() => {
    let sortable = [...filteredInvoices];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredInvoices, sortConfig]);

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedInvoices.slice(start, start + itemsPerPage);
  }, [sortedInvoices, currentPage]);

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
      case "Partially Paid":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-xeflow-border/50 text-xeflow-muted border-xeflow-border";
    }
  };



  const handleDownload = (invoice) => {
    generateInvoicePDF(invoice, formatDate, formatMoney, toast);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text">
              All Invoices
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Manage, view, and send your invoices to clients.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/invoice/ledger">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-xeflow-surface border border-xeflow-border text-xeflow-text text-sm font-semibold rounded-xl hover:border-xeflow-brand transition-all shadow-sm cursor-pointer">
                <FiFileText size={18} className="text-xeflow-brand" /> View Ledger
              </button>
            </Link>
            <Link to="/invoice/new">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-xeflow-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-md shadow-xeflow-brand/20 cursor-pointer">
                <FiPlus size={18} /> Create Invoice
              </button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-xeflow-surface p-4 rounded-xl border border-xeflow-border shadow-sm transition-colors duration-300">
          <div className="relative w-full lg:w-80 shrink-0">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by invoice # or client..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold shadow-sm hover:shadow-md hover:border-xeflow-brand transition-all cursor-pointer whitespace-nowrap ${selectedCustomerFilter ? "bg-xeflow-brand/10 border-xeflow-brand text-xeflow-brand" : "bg-xeflow-surface border-xeflow-border text-xeflow-text"}`}
                title="Filter by Customer"
              >
                <FiFilter size={16} />
                <span>
                  {selectedCustomerFilter ? selectedCustomerFilter.company_name : "All Clients"}
                </span>
                <FiChevronDown size={14} className={`transition-transform duration-200 ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-xeflow-surface border border-xeflow-border shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-3 duration-250 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <p className="text-[10px] font-black uppercase text-xeflow-muted tracking-wider px-3.5 py-1.5 border-b border-xeflow-border/40 mb-1">
                    Select Customer
                  </p>
                  <div
                    onClick={() => {
                      setSelectedCustomerFilter(null);
                      setIsFilterDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`text-left text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${!selectedCustomerFilter ? "bg-xeflow-brand/10 text-xeflow-brand" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                  >
                    All Clients (View All)
                  </div>
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomerFilter(customer);
                        setIsFilterDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`text-left text-xs font-bold px-3.5 py-2 mt-0.5 rounded-lg transition-colors cursor-pointer truncate ${selectedCustomerFilter && selectedCustomerFilter.id === customer.id ? "bg-xeflow-brand/10 text-xeflow-brand" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                      title={customer.company_name}
                    >
                      {customer.company_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <CustomSelect
              value={selectedStatusFilter}
              onChange={(val) => {
                setSelectedStatusFilter(val);
                setCurrentPage(1);
              }}
              options={statusOptions}
              placeholder="All Statuses"
            />

            <CustomSelect
              value={selectedMonthFilter}
              onChange={(val) => {
                setSelectedMonthFilter(val);
                setCurrentPage(1);
              }}
              options={monthOptions}
              placeholder="All Months"
            />

            <CustomSelect
              value={selectedYearFilter}
              onChange={(val) => {
                setSelectedYearFilter(val);
                setCurrentPage(1);
              }}
              options={yearOptions}
              placeholder="All Years"
            />
          </div>
        </div>

        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("invoice_number")}
                  >
                    <div className="flex items-center">
                      Invoice # <SortIcon columnKey="invoice_number" />
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    Client
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("issue_date")}
                  >
                    <div className="flex items-center">
                      Issue Date <SortIcon columnKey="issue_date" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("total_amount")}
                  >
                    <div className="flex items-center">
                      Total <SortIcon columnKey="total_amount" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status <SortIcon columnKey="status" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-4"><Skeleton width={80} height={14} className="rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><Skeleton width={120} height={14} className="rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><Skeleton width={90} height={14} className="rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><Skeleton width={90} height={14} className="rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><Skeleton width={70} height={20} className="rounded animate-pulse" /></td>
                    <td className="px-6 py-4 text-center"><Skeleton width={100} height={28} className="rounded-lg inline-block animate-pulse" /></td>
                  </tr>
                ) : paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => {
                    const isExpanded = expandedInvoiceId === invoice.id;
                    return (
                      <React.Fragment key={invoice.id}>
                        <tr
                          className="hover:bg-xeflow-brand/5 cursor-pointer transition-colors group"
                          onClick={() => setExpandedInvoiceId(isExpanded ? null : invoice.id)}
                        >
                          <td className="px-6 py-4 font-bold text-xeflow-text">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold">
                              {invoice.customer?.company_name || "Unknown Client"}
                            </p>
                            <p className="text-xs text-xeflow-muted">
                              {invoice.customer?.email}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-xeflow-muted font-medium">
                            {formatDate(invoice.issue_date)}
                          </td>
                          <td className="px-6 py-4 font-bold text-xeflow-text">
                            {formatMoney(invoice.total_amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-md text-xs font-bold border whitespace-nowrap inline-block ${getStatusColor(invoice.status)}`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-xeflow-brand hover:text-xeflow-brand rounded-lg transition-colors"
                                title="View Invoice"
                              >
                                <FiEye size={16} />
                              </button>
                              <button
                                onClick={() => setEmailInvoice(invoice)}
                                className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-blue-500 hover:text-blue-500 rounded-lg transition-colors"
                                title="Send via Email"
                              >
                                <FiMail size={16} />
                              </button>
                              <button
                                onClick={() => handleDownload(invoice)}
                                className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-green-500 hover:text-green-500 rounded-lg transition-colors"
                                title="Download PDF"
                              >
                                <FiFileText size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-xeflow-bg/30">
                            <td colSpan="6" className="p-0 border-b border-xeflow-border">
                              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center animate-in slide-in-from-top duration-200">
                                <div className="p-3 bg-xeflow-surface border border-xeflow-border rounded-xl">
                                  <p className="text-[10px] font-black uppercase text-xeflow-muted tracking-wider">Total Amount</p>
                                  <p className="text-sm font-black text-xeflow-text mt-1">{formatMoney(invoice.total_amount)}</p>
                                </div>
                                <div className="p-3 bg-xeflow-surface border border-xeflow-border rounded-xl">
                                  <p className="text-[10px] font-black uppercase text-xeflow-muted tracking-wider">Amount Paid</p>
                                  <p className="text-sm font-black text-green-500 mt-1">{formatMoney(invoice.amount_paid)}</p>
                                </div>
                                <div className="p-3 bg-xeflow-surface border border-xeflow-border rounded-xl flex items-center justify-between">
                                  <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-xeflow-muted tracking-wider">Outstanding</p>
                                    <p className="text-sm font-black text-xeflow-brand mt-1">{formatMoney(invoice.balance_due)}</p>
                                  </div>
                                  {parseFloat(invoice.balance_due) > 0 && (
                                    <button
                                      onClick={() => setPaymentInvoice(invoice)}
                                      className="px-3 py-1.5 bg-xeflow-brand text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                                    >
                                      <FiCreditCard size={12} /> Pay
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center text-xeflow-muted"
                    >
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg transition-colors duration-300">
              <span className="text-xs text-xeflow-muted font-medium">
                Showing{" "}
                {sortedInvoices.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, sortedInvoices.length)}{" "}
                of {sortedInvoices.length} entries
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${currentPage === i + 1 ? "bg-xeflow-brand text-white shadow-sm shadow-xeflow-brand/20" : "border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/10 transition-colors"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold text-xeflow-muted hover:bg-xeflow-brand/10 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-xeflow-bg/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-xeflow-surface rounded-2xl shadow-2xl border border-xeflow-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-xeflow-border bg-xeflow-bg/50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-xeflow-text">
                  Invoice {selectedInvoice.invoice_number}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap inline-block ${getStatusColor(selectedInvoice.status)}`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(selectedInvoice)}
                  className="p-2 text-xeflow-muted hover:text-green-500 transition-colors"
                  title="Download PDF"
                >
                  <FiDownload size={18} />
                </button>
                <button
                  onClick={() => setEmailInvoice(selectedInvoice)}
                  className="p-2 text-xeflow-muted hover:text-blue-500 transition-colors"
                  title="Send via Email"
                >
                  <FiMail size={18} />
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-xeflow-muted hover:text-red-500 transition-colors bg-xeflow-bg rounded-full border border-xeflow-border"
                  title="Close"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 md:p-12 custom-scrollbar bg-white dark:bg-xeflow-surface text-xeflow-text">
              <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-xeflow-border pb-8 mb-8">
                <div className="w-full md:w-1/2 space-y-3">
                  <img
                    src={COMPANY.logo}
                    alt={COMPANY.name}
                    className="w-auto h-20 md:h-28 object-contain"
                  />
                  <div className="text-sm text-xeflow-muted space-y-1 mt-2">
                    <p>{COMPANY.address}</p>
                    <p>Email: {COMPANY.email}</p>
                    <p>Phone: {COMPANY.phone}</p>
                    <p className="font-bold text-xeflow-text pt-2">
                      GSTIN: {COMPANY.gstin}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-1/3 text-left md:text-right space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-xeflow-border uppercase tracking-widest">
                    Invoice
                  </h1>
                  <div className="space-y-2 pt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-xeflow-muted uppercase">
                        Invoice #
                      </span>
                      <span className="font-bold text-xeflow-text">
                        {selectedInvoice.invoice_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-xeflow-muted uppercase">
                        Issue Date
                      </span>
                      <span className="font-bold text-xeflow-text">
                        {formatDate(selectedInvoice.issue_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-xeflow-muted uppercase">
                        Due Date
                      </span>
                      <span className="font-bold text-xeflow-text">
                        {formatDate(selectedInvoice.due_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-3 border-b border-xeflow-border pb-2 inline-block">
                  Billed To
                </h3>
                {selectedInvoice.customer ? (
                  <div className="text-sm space-y-1">
                    <p className="text-lg font-black text-xeflow-text">
                      {selectedInvoice.customer.company_name}
                    </p>
                    <p className="text-xeflow-muted font-medium">
                      Attn: {selectedInvoice.customer.rep_name}
                    </p>
                    <p className="text-xeflow-muted">
                      {selectedInvoice.customer.email}
                    </p>
                    <p className="text-xeflow-muted">
                      {selectedInvoice.customer.phone}
                    </p>
                    {selectedInvoice.customer.address && (
                      <p className="text-xeflow-muted">
                        <span className="font-bold text-xeflow-text">Address:</span>{" "}
                        {selectedInvoice.customer.address}
                      </p>
                    )}
                    {selectedInvoice.customer.website && (
                      <p className="text-xeflow-muted">
                        <span className="font-bold text-xeflow-text">Website:</span>{" "}
                        <a href={selectedInvoice.customer.website.startsWith('http') ? selectedInvoice.customer.website : `https://${selectedInvoice.customer.website}`} target="_blank" rel="noopener noreferrer" className="text-xeflow-brand hover:underline">
                          {selectedInvoice.customer.website}
                        </a>
                      </p>
                    )}
                    {selectedInvoice.customer.gtin && (
                      <p className="text-xeflow-muted">
                        <span className="font-bold text-xeflow-text">GTIN:</span>{" "}
                        {selectedInvoice.customer.gtin}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-500">
                    Customer details missing.
                  </p>
                )}
              </div>

              <div className="mb-10">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b-2 border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>

                <div className="space-y-3 pt-3">
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col md:grid md:grid-cols-12 gap-4 items-stretch md:items-center py-4 md:py-2 border-b border-xeflow-border/50 text-sm"
                      >
                        <div className="col-span-12 md:col-span-6 font-semibold text-xeflow-text">
                          {item.description}
                        </div>
                        <div className="grid grid-cols-3 gap-3 col-span-12 md:col-span-6 md:contents">
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">Qty</span>
                            <span className="text-left md:text-right text-xeflow-muted font-medium">
                              {parseFloat(item.quantity)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">Rate</span>
                            <span className="text-left md:text-right text-xeflow-muted font-medium">
                              {formatMoney(item.rate)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">Amount</span>
                            <span className="text-left md:text-right font-bold text-xeflow-text">
                              {formatMoney(item.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-xeflow-muted py-2">
                      No line items recorded.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
                <div className="flex flex-col gap-6">
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-2">
                      Notes
                    </h3>
                    <div className="w-full flex-1 bg-xeflow-bg/50 border border-xeflow-border rounded-xl p-4 text-sm text-xeflow-text">
                      {selectedInvoice.notes || "No notes provided."}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-2">
                      Terms & Conditions
                    </h3>
                    <div className="w-full flex-1 bg-xeflow-bg/50 border border-xeflow-border rounded-xl p-4 text-sm text-xeflow-text">
                      {selectedInvoice.terms || "No terms provided."}
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-4 bg-xeflow-bg/50 p-6 md:p-8 rounded-2xl border border-xeflow-border flex flex-col justify-center">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                      Subtotal
                    </span>
                    <span className="font-bold text-xeflow-text">
                      {formatMoney(selectedInvoice.subtotal)}
                    </span>
                  </div>

                  {parseFloat(selectedInvoice.discount_amount) > 0 && (
                    <div className="flex justify-between items-center text-sm text-xeflow-brand">
                      <span className="font-bold uppercase tracking-wide">
                        Discount Applied
                      </span>
                      <span className="font-bold">
                        -{formatMoney(selectedInvoice.discount_amount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                      CGST ({parseFloat(selectedInvoice.cgst_rate)}%)
                    </span>
                    <span className="font-bold text-xeflow-text">
                      {formatMoney(selectedInvoice.cgst_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm pb-3 border-b border-xeflow-border">
                    <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                      SGST ({parseFloat(selectedInvoice.sgst_rate)}%)
                    </span>
                    <span className="font-bold text-xeflow-text">
                      {formatMoney(selectedInvoice.sgst_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-black text-xeflow-text uppercase tracking-wide">
                      Total
                    </span>
                    <span className="text-lg font-black text-xeflow-text">
                      {formatMoney(selectedInvoice.total_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-4 border-b border-xeflow-border pb-5">
                    <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                      Amount Paid
                    </span>
                    <span className="text-green-500 font-bold">
                      {formatMoney(selectedInvoice.amount_paid)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-xeflow-text uppercase tracking-wide">
                      Balance Due
                    </span>
                    <span className="text-xl font-black text-xeflow-brand">
                      {formatMoney(selectedInvoice.balance_due)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentInvoice && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-xeflow-bg/80 backdrop-blur-sm">
          <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 text-xeflow-text">
            <div className="flex items-center justify-between px-6 py-4 border-b border-xeflow-border bg-xeflow-bg/50">
              <h3 className="text-lg font-bold">
                Record Payment
              </h3>
              <button
                onClick={() => setPaymentInvoice(null)}
                className="p-1.5 hover:text-red-500 transition-colors bg-xeflow-bg rounded-full border border-xeflow-border"
              >
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="bg-xeflow-bg/50 border border-xeflow-border p-4 rounded-xl space-y-2">
                <p className="text-xs text-xeflow-muted uppercase font-bold tracking-wide">Invoice details</p>
                <div className="flex justify-between text-sm">
                  <span>Invoice Number:</span>
                  <span className="font-bold">{paymentInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Client:</span>
                  <span className="font-bold">{paymentInvoice.customer?.company_name || "Unknown"}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-xeflow-border/50 mt-2">
                  <span>Outstanding Balance:</span>
                  <span className="font-bold text-xeflow-brand">{formatMoney(paymentInvoice.balance_due)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">Payment Amount (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={paymentInvoice.balance_due}
                  placeholder={`Max: ${parseFloat(paymentInvoice.balance_due)}`}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm outline-none focus:border-xeflow-brand font-bold text-xeflow-text transition-all"
                  required
                />
                <span className="text-[10px] text-xeflow-muted block">
                  * Dynamic limit matches the current outstanding balance.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentInvoice(null)}
                  className="flex-1 py-3 rounded-xl border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-md disabled:opacity-50"
                >
                  {isRecordingPayment ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SendEmailModal
        isOpen={!!emailInvoice}
        onClose={() => setEmailInvoice(null)}
        invoice={emailInvoice}
        formatDate={formatDate}
        formatMoney={formatMoney}
      />
    </div>
  );
};

export default ViewInvoice;
