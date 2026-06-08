import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiX,
  FiAlertTriangle,
  FiPlus,
  FiSave,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../js/api";
import CustomSelect from "../../components/CustomSelect";
import { COMPANY } from "../../info/company";
import Skeleton from "react-loading-skeleton";

const EditInvoice = () => {
  // Table State
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState("All");
  const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = React.useRef(null);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [dbCustomers, setDbCustomers] = useState([]);
  const [dbServices, setDbServices] = useState([]);
    
    const [deletingId, setDeletingId] = useState(null);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

  // Paymt Accordian 
  
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
        const response = await fetchWithAuth(`/invoices/${paymentInvoice.id}/payment/`, {
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

  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    notes: "",
    terms: "",
    status: "Draft",
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [taxType, setTaxType] = useState("GST");
  const [igstRate, setIgstRate] = useState("18");
  const [cgstRate, setCgstRate] = useState("9");
  const [sgstRate, setSgstRate] = useState("9");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [amountPaid, setAmountPaid] = useState("");

  const customerOptions = useMemo(() => {
    return [
      { value: "", label: "Select a Customer" },
      ...dbCustomers.map((cust) => ({
        value: cust.id.toString(),
        label: `${cust.company_name} (${cust.rep_name})`,
      })),
    ];
  }, [dbCustomers]);

  const serviceOptions = useMemo(() => {
    return [
      { value: "", label: "-- Custom Item --" },
      ...dbServices.map((srv) => ({
        value: srv.id.toString(),
        label: srv.name,
      })),
    ];
  }, [dbServices]);

  const taxTypeOptions = useMemo(() => {
    return [
      { value: "GST", label: "GST (CGST/SGST)" },
      { value: "IGST", label: "IGST" },
      { value: "No GST", label: "No GST" },
    ];
  }, []);

  const statusEditOptions = useMemo(() => {
    return [
      { value: "Draft", label: "Draft" },
      { value: "Sent", label: "Sent" },
      { value: "Paid", label: "Paid" },
      { value: "Overdue", label: "Overdue" },
    ];
  }, []);



  const loadInitialData = async () => {
    try {
      const [invRes, custRes, servRes] = await Promise.all([
        fetchWithAuth("/invoices/", { method: "GET" }),
        fetchWithAuth("/customers/", { method: "GET" }),
        fetchWithAuth("/services/", { method: "GET" }),
      ]);

      if (invRes.ok) setInvoices(await invRes.json());
      if (custRes.ok) setDbCustomers(await custRes.json());
      if (servRes.ok) setDbServices(await servRes.json());
    } catch (error) {
      console.error("Failed to load DB data:", error);
      toast.error("Failed to load table data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
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
        if (sortConfig.key === "customer") {
          aVal = a.customer?.company_name || "";
          bVal = b.customer?.company_name || "";
        }
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

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

    // API Delete Action 
    
  const handleDelete = async () => {
    const loadingToast = toast.loading("Deleting invoice...");
    try {
      setIsSubmitting(true);
      const res = await fetchWithAuth(`/invoices/${deletingId}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInvoices(invoices.filter((inv) => inv.id !== deletingId));
        setDeletingId(null);
        if (paginatedInvoices.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        }
        toast.success("Invoice deleted successfully.", { id: loadingToast });
      } else {
        toast.error("Failed to delete invoice.", { id: loadingToast });
      }
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Network error while deleting.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  //  EDIT MODAL LOGIC 
  const openEditModal = (invoice) => {
    setEditingInvoice(invoice);
    setInvoiceMeta({
      invoiceNumber: invoice.invoice_number,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      notes: invoice.notes || "",
      terms: invoice.terms || "",
      status: invoice.status || "Draft",
    });

    if (invoice.customer) {
      setSelectedCustomer(
        dbCustomers.find((c) => c.id === invoice.customer.id) ||
          invoice.customer,
      );
    } else {
      setSelectedCustomer(null);
    }

    if (invoice.items && invoice.items.length > 0) {
      const mappedItems = invoice.items.map((item, index) => ({
        id: Date.now() + index,
        service_id: item.service ? item.service.toString() : "",
        description: item.description,
        quantity: item.quantity.toString(),
        rate: item.rate.toString(),
        amount: parseFloat(item.amount) || 0,
      }));
      setLineItems(mappedItems);
    } else {
      setLineItems([
        {
          id: Date.now(),
          service_id: "",
          description: "",
          quantity: "1",
          rate: "",
          amount: 0,
        },
      ]);
    }

    setTaxType(invoice.tax_type || "GST");
    setIgstRate(invoice.igst_rate?.toString() || "0");
    setCgstRate(invoice.cgst_rate?.toString() || "0");
    setSgstRate(invoice.sgst_rate?.toString() || "0");
    if (invoice.discount_percentage && parseFloat(invoice.discount_percentage) > 0) {
      setDiscountType("percent");
      setDiscount(invoice.discount_percentage.toString());
    } else {
      setDiscountType("amount");
      setDiscount(invoice.discount_amount?.toString() || "0");
    }
    setAmountPaid(invoice.amount_paid?.toString() || "0");
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now(),
        service_id: "",
        description: "",
        quantity: "1",
        rate: "",
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (idToRemove) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== idToRemove));
    }
  };

  const handleLineItemChange = (id, field, value) => {
    const updatedItems = lineItems.map((item) => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };
        if (field === "service_id") {
          const selectedService = dbServices.find(
            (s) => s.id.toString() === value,
          );
          if (selectedService) {
            updatedItem.description = selectedService.name;
            updatedItem.rate = selectedService.price;
          }
        }
        const safeQty = parseFloat(updatedItem.quantity) || 0;
        const safeRate = parseFloat(updatedItem.rate) || 0;
        updatedItem.amount = safeQty * safeRate;
        return updatedItem;
      }
      return item;
    });
    setLineItems(updatedItems);
  };

  const {
    subtotal,
    discountAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    total,
    balanceDue,
  } = useMemo(() => {
    const calcSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const safeDiscount = parseFloat(discount) || 0;
    const safeCgstRate = parseFloat(cgstRate) || 0;
    const safeSgstRate = parseFloat(sgstRate) || 0;
    const safeIgstRate = parseFloat(igstRate) || 0;
    const safeAmountPaid = parseFloat(amountPaid) || 0;

    let calcDiscount =
      discountType === "percent"
        ? calcSubtotal * (safeDiscount / 100)
        : safeDiscount;
    const taxableAmount = calcSubtotal - calcDiscount;
    
    let calcCgst = 0;
    let calcSgst = 0;
    let calcIgst = 0;
    
    if (taxType === "GST") {
      calcCgst = taxableAmount * (safeCgstRate / 100);
      calcSgst = taxableAmount * (safeSgstRate / 100);
    } else if (taxType === "IGST") {
      calcIgst = taxableAmount * (safeIgstRate / 100);
    }

    const calcTotal = taxableAmount + calcCgst + calcSgst + calcIgst;
    const calcBalance = calcTotal - safeAmountPaid;

    return {
      subtotal: calcSubtotal,
      discountAmount: calcDiscount,
      cgstAmount: calcCgst,
      sgstAmount: calcSgst,
      igstAmount: calcIgst,
      total: calcTotal,
      balanceDue: calcBalance,
    };
  }, [lineItems, taxType, cgstRate, sgstRate, igstRate, discount, discountType, amountPaid]);

  const handleUpdateInvoice = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer.");
      return;
    }
    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving changes...");

    const payload = {
      customer: selectedCustomer.id,
      invoice_number: invoiceMeta.invoiceNumber,
      issue_date: invoiceMeta.issueDate,
      due_date: invoiceMeta.dueDate,
      status: invoiceMeta.status,
      notes: invoiceMeta.notes,
      terms: invoiceMeta.terms,
      tax_type: taxType,
      discount_percentage: discountType === "percent" ? (parseFloat(discount) || 0) : 0,
      discount_amount: discountType === "amount" ? (parseFloat(discount) || 0) : 0,
      cgst_rate: taxType === "GST" ? (parseFloat(cgstRate) || 0) : 0,
      sgst_rate: taxType === "GST" ? (parseFloat(sgstRate) || 0) : 0,
      igst_rate: taxType === "IGST" ? (parseFloat(igstRate) || 0) : 0,
      amount_paid: parseFloat(amountPaid) || 0,
      items: lineItems.map((item) => ({
        service: item.service_id ? parseInt(item.service_id) : null,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
      })),
    };

    try {
      const response = await fetchWithAuth(`/invoices/${editingInvoice.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Invoice updated successfully!", { id: loadingToast });
        setEditingInvoice(null);
        loadInitialData();
      } else {
        toast.error("Failed to update invoice.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error while updating.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Header */}
              
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text">
              Edit & Manage Invoices
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Select an invoice to modify its contents or delete it permanently.
            </p>
          </div>
        </div>

              {/* Toolbar */}
              
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
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
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
                  {dbCustomers.map((customer) => (
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

              {/*  Data Table  */}
              
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
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center">
                      Client <SortIcon columnKey="customer" />
                    </div>
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
                                onClick={() => openEditModal(invoice)}
                                className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-green-500 hover:text-green-500 rounded-lg transition-colors"
                                title="Edit Invoice"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => setDeletingId(invoice.id)}
                                className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-red-500 hover:text-red-500 rounded-lg transition-colors"
                                title="Delete Invoice"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-xeflow-bg/30">
                            <td colSpan="6" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-inner animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col bg-xeflow-bg/40 p-3 rounded-lg border border-xeflow-border">
                                  <span className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">Total Amount</span>
                                  <span className="text-base font-black text-xeflow-text mt-1">{formatMoney(invoice.total_amount)}</span>
                                </div>
                                <div className="flex flex-col bg-xeflow-bg/40 p-3 rounded-lg border border-xeflow-border">
                                  <span className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">Amount Paid</span>
                                  <span className="text-base font-black text-green-500 mt-1">{formatMoney(invoice.amount_paid)}</span>
                                </div>
                                <div className="flex flex-col bg-xeflow-bg/40 p-3 rounded-lg border border-xeflow-border">
                                  <span className="text-xs font-bold text-xeflow-muted uppercase tracking-wider">Outstanding Amount</span>
                                  <span className="text-base font-black text-xeflow-brand mt-1">{formatMoney(invoice.balance_due)}</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-end">
                                  {parseFloat(invoice.balance_due) > 0 ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentInvoice(invoice);
                                        setPaymentAmount("");
                                      }}
                                      className="w-full md:w-auto px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                                    >
                                      Add Payment
                                    </button>
                                  ) : (
                                    <span className="px-4 py-2.5 text-xs font-bold text-green-500 bg-green-500/10 rounded-xl border border-green-500/20 text-center w-full md:w-auto">
                                      Fully Paid
                                    </span>
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

          {/*  Delete Confirmation Modal  */}
          
      {deletingId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-xeflow-bg/40 backdrop-blur-[2px]">
          <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-xeflow-text mb-2">
              Delete Invoice?
            </h3>
            <p className="text-sm text-xeflow-muted mb-6">
              This action cannot be undone. This invoice and all its line items
              will be permanently removed.
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
      )}

      {/* Invoice Edit Modal  */}
      {editingInvoice && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-xeflow-bg/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-xeflow-surface rounded-2xl shadow-2xl border border-xeflow-border overflow-hidden animate-in zoom-in-95 duration-200">
                      
                      {/* Modal Header */}
                      
            <div className="flex items-center justify-between px-6 py-4 border-b border-xeflow-border bg-xeflow-bg/50 shrink-0">
              <h2 className="text-xl font-bold text-xeflow-text">
                Edit Invoice: {editingInvoice.invoice_number}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpdateInvoice}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-xeflow-brand text-white hover:opacity-90 font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  <FiSave size={16} />{" "}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingInvoice(null)}
                  className="p-2 text-xeflow-muted hover:text-red-500 transition-colors bg-xeflow-bg rounded-full border border-xeflow-border"
                  title="Close"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

                      {/* Modal Body (Scrollable Form) */}
                      
            <div className="overflow-y-auto p-6 md:p-10 custom-scrollbar text-xeflow-text bg-xeflow-surface">
              <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-xeflow-border pb-8 mb-8">
                <div className="w-full md:w-1/2 space-y-4">
                  <img
                    src={COMPANY.logo}
                    alt={COMPANY.name}
                    className="w-auto h-20 md:h-24 scale-500 ml-29"
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
                  <h1 className="text-3xl md:text-4xl font-black text-xeflow-border uppercase tracking-widest">
                    Invoice
                  </h1>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm font-semibold text-xeflow-muted uppercase">
                        Status
                      </span>
                      <CustomSelect
                        value={invoiceMeta.status}
                        onChange={(val) =>
                          setInvoiceMeta({
                            ...invoiceMeta,
                            status: val,
                          })
                        }
                        options={statusEditOptions}
                        placeholder="Select Status"
                        align="right"
                        buttonClassName="text-right font-bold w-32 bg-xeflow-bg outline-none border border-xeflow-border rounded-md p-1 focus:border-xeflow-brand text-xeflow-text transition-colors text-xs text-left"
                        dropdownClassName="w-32 right-0 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-2xl p-1.5"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm font-semibold text-xeflow-muted uppercase">
                        Invoice No
                      </span>
                      <input
                        type="text"
                        value={invoiceMeta.invoiceNumber}
                        onChange={(e) =>
                          setInvoiceMeta({
                            ...invoiceMeta,
                            invoiceNumber: e.target.value,
                          })
                        }
                        className="text-right font-bold w-32 bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm font-semibold text-xeflow-muted uppercase">
                        Issue Date
                      </span>
                      <input
                        type="date"
                        value={invoiceMeta.issueDate}
                        onChange={(e) =>
                          setInvoiceMeta({
                            ...invoiceMeta,
                            issueDate: e.target.value,
                          })
                        }
                        onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                        className="text-right text-sm text-xeflow-text bg-transparent outline-none cursor-pointer border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm font-semibold text-xeflow-muted uppercase">
                        Due Date
                      </span>
                      <input
                        type="date"
                        value={invoiceMeta.dueDate}
                        onChange={(e) =>
                          setInvoiceMeta({
                            ...invoiceMeta,
                            dueDate: e.target.value,
                          })
                        }
                        onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                        className="text-right text-sm text-xeflow-text bg-transparent outline-none cursor-pointer border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-3 border-b border-xeflow-border pb-2 inline-block">
                  Billed To
                </h3>
                <div className="max-w-md space-y-3">
                  <CustomSelect
                    value={selectedCustomer?.id?.toString() || ""}
                    onChange={(val) => {
                      const customer = dbCustomers.find(
                        (c) => c.id.toString() === val,
                      );
                      setSelectedCustomer(customer || null);
                    }}
                    options={customerOptions}
                    placeholder="Select a Customer"
                    fullWidth={true}
                    align="left"
                    buttonClassName="w-full text-base font-bold bg-xeflow-bg border border-xeflow-border rounded-lg p-2.5 outline-none focus:border-xeflow-brand text-xeflow-text text-left"
                    dropdownClassName="w-full left-0 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-2xl p-1.5"
                  />

                  {selectedCustomer && (
                    <div className="p-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-muted space-y-1 shadow-sm">
                      <p>
                        <span className="font-bold text-xeflow-text">
                          Attn:
                        </span>{" "}
                        {selectedCustomer.rep_name}
                      </p>
                      <p>
                        <span className="font-bold text-xeflow-text">
                          Email:
                        </span>{" "}
                        {selectedCustomer.email}
                      </p>
                      <p>
                        <span className="font-bold text-xeflow-text">
                          Phone:
                        </span>{" "}
                        {selectedCustomer.phone}
                      </p>
                      {selectedCustomer.address && (
                        <p>
                          <span className="font-bold text-xeflow-text">
                            Address:
                          </span>{" "}
                          {selectedCustomer.address}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-10">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b-2 border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                  <div className="col-span-6">Service / Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>

                <div className="space-y-3 pt-3">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col md:grid md:grid-cols-12 gap-4 items-stretch md:items-center group bg-xeflow-bg/30 p-4 md:p-2 rounded-xl md:rounded-lg border border-xeflow-border md:border-transparent hover:border-xeflow-border transition-colors"
                    >
                      <div className="col-span-12 md:col-span-6 flex flex-col gap-1.5">
                        <CustomSelect
                          value={item.service_id?.toString() || ""}
                          onChange={(val) =>
                            handleLineItemChange(
                              item.id,
                              "service_id",
                              val,
                            )
                          }
                          options={serviceOptions}
                          placeholder="-- Custom Item --"
                          fullWidth={true}
                          align="left"
                          buttonClassName="w-full text-sm font-bold bg-transparent border-b border-xeflow-border outline-none focus:border-xeflow-brand pb-1 text-xeflow-text text-left"
                          dropdownClassName="w-full left-0 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-2xl p-1.5"
                        />
                        <input
                          type="text"
                          placeholder="Additional details..."
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              "description",
                              e.target.value,
                            )
                          }
                          className="w-full text-xs text-xeflow-text bg-transparent outline-none pb-1 placeholder:text-xeflow-muted"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3 col-span-12 md:col-span-6 md:contents">
                        <div className="flex flex-col gap-1 md:col-span-2">
                          <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">Qty</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleLineItemChange(
                                item.id,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-full text-left md:text-right text-sm bg-xeflow-bg border border-xeflow-border rounded p-2 outline-none focus:border-xeflow-brand text-xeflow-text transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                          <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">Rate</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.rate}
                            onChange={(e) =>
                              handleLineItemChange(
                                item.id,
                                "rate",
                                e.target.value,
                              )
                            }
                            className="w-full text-left md:text-right text-sm bg-xeflow-bg border border-xeflow-border rounded p-2 outline-none focus:border-xeflow-brand text-xeflow-text transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2 text-right relative justify-end">
                          <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">Amount</span>
                          <div className="text-sm font-bold text-xeflow-text flex items-center justify-end gap-2 h-[38px] md:h-auto">
                            {formatMoney(item.amount)}
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="text-xeflow-muted hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                              title="Remove Item"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addLineItem}
                  className="flex items-center gap-2 text-sm font-bold text-xeflow-brand hover:opacity-80 mt-3 transition-colors p-2 hover:bg-xeflow-brand/10 rounded-lg"
                >
                  <FiPlus size={16} /> Add Line Item
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-1">
                      Notes
                    </h3>
                    <textarea
                      value={invoiceMeta.notes}
                      onChange={(e) =>
                        setInvoiceMeta({
                          ...invoiceMeta,
                          notes: e.target.value,
                        })
                      }
                      className="w-full flex-1 bg-xeflow-bg border border-xeflow-border rounded-xl p-3 text-sm text-xeflow-text outline-none focus:border-xeflow-brand resize-none transition-colors custom-scrollbar min-h-[100px]"
                    ></textarea>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-1">
                      Terms & Conditions
                    </h3>
                    <textarea
                      value={invoiceMeta.terms}
                      onChange={(e) =>
                        setInvoiceMeta({
                          ...invoiceMeta,
                          terms: e.target.value,
                        })
                      }
                      className="w-full flex-1 bg-xeflow-bg border border-xeflow-border rounded-xl p-3 text-sm text-xeflow-text outline-none focus:border-xeflow-brand resize-none transition-colors custom-scrollbar min-h-[100px]"
                    ></textarea>
                  </div>
                </div>

                <div className="w-full space-y-3 bg-xeflow-bg p-6 rounded-2xl border border-xeflow-border flex flex-col justify-center">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                      Subtotal
                    </span>
                    <span className="font-bold text-xeflow-text">
                      {formatMoney(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xeflow-muted font-bold uppercase tracking-wide flex items-center gap-2">
                      Discount
                      <button
                        type="button"
                        onClick={() =>
                          setDiscountType(
                            discountType === "percent" ? "amount" : "percent",
                          )
                        }
                        className="text-[10px] font-bold uppercase bg-xeflow-brand/10 text-xeflow-brand px-1.5 py-0.5 rounded-md hover:bg-xeflow-brand/20 transition-colors"
                      >
                        {discountType === "percent" ? "%" : "₹"}
                      </button>
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-24 bg-xeflow-surface text-right border border-xeflow-border rounded-md p-1.5 outline-none font-bold focus:border-xeflow-brand transition-colors text-xeflow-text"
                    />
                  </div>

                  {parseFloat(discount) > 0 && (
                    <div className="flex justify-between items-center text-sm text-xeflow-brand">
                      <span className="font-bold uppercase tracking-wide">
                        Discount Applied
                      </span>
                      <span className="font-bold">
                        -{formatMoney(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm pt-1">
                    <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                      Tax Type
                    </span>
                    <CustomSelect
                      value={taxType}
                      onChange={setTaxType}
                      options={taxTypeOptions}
                      placeholder="Select Tax Type"
                      align="right"
                      buttonClassName="w-32 bg-xeflow-surface border border-xeflow-border rounded-md p-1.5 outline-none font-bold focus:border-xeflow-brand text-xeflow-text text-xs text-left"
                      dropdownClassName="w-48 right-0 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-2xl p-1.5"
                    />
                  </div>

                  {taxType === "GST" && (
                    <>
                      <div className="flex justify-between items-center text-sm pt-1">
                        <span className="text-xeflow-muted font-bold uppercase tracking-wide flex items-center gap-2">
                          CGST (%)
                          <input
                            type="number"
                            min="0"
                            value={cgstRate}
                            onChange={(e) => setCgstRate(e.target.value)}
                            className="w-14 bg-xeflow-surface border border-xeflow-border rounded-md p-1 text-center outline-none focus:border-xeflow-brand transition-colors text-xeflow-text font-bold"
                          />
                        </span>
                        <span className="font-bold text-xeflow-text">
                          {formatMoney(cgstAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm pb-2 border-b border-xeflow-border">
                        <span className="text-xeflow-muted font-bold uppercase tracking-wide flex items-center gap-2">
                          SGST (%)
                          <input
                            type="number"
                            min="0"
                            value={sgstRate}
                            onChange={(e) => setSgstRate(e.target.value)}
                            className="w-14 bg-xeflow-surface border border-xeflow-border rounded-md p-1 text-center outline-none focus:border-xeflow-brand transition-colors text-xeflow-text font-bold"
                          />
                        </span>
                        <span className="font-bold text-xeflow-text">
                          {formatMoney(sgstAmount)}
                        </span>
                      </div>
                    </>
                  )}

                  {taxType === "IGST" && (
                    <div className="flex justify-between items-center text-sm pb-2 border-b border-xeflow-border">
                      <span className="text-xeflow-muted font-bold uppercase tracking-wide flex items-center gap-2">
                        IGST (%)
                        <input
                          type="number"
                          min="0"
                          value={igstRate}
                          onChange={(e) => setIgstRate(e.target.value)}
                          className="w-14 bg-xeflow-surface border border-xeflow-border rounded-md p-1 text-center outline-none focus:border-xeflow-brand transition-colors text-xeflow-text font-bold"
                        />
                      </span>
                      <span className="font-bold text-xeflow-text">
                        {formatMoney(igstAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-lg font-black text-xeflow-text uppercase tracking-wide">
                      Total
                    </span>
                    <span className="text-lg font-black text-xeflow-text">
                      {formatMoney(total)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2 border-b border-xeflow-border pb-3">
                    <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                      Amount Paid
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-24 bg-xeflow-surface text-right border border-xeflow-border rounded-md p-1.5 outline-none text-green-500 font-bold focus:border-xeflow-brand transition-colors"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold text-xeflow-text uppercase tracking-wide">
                      Balance Due
                    </span>
                    <span className="text-xl font-black text-xeflow-brand">
                      {formatMoney(balanceDue)}
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
    </div>
  );
};

export default EditInvoice;
