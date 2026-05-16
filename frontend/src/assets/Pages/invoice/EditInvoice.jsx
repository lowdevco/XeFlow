import  { useState, useEffect, useMemo } from "react";
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
import Xeventure_Logo from "../../image/Xeventure.png";

const GSTIN = "32ABCDE1234F1Z5";

const EditInvoice = () => {
  // Table State
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [cgstRate, setCgstRate] = useState("9");
  const [sgstRate, setSgstRate] = useState("9");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [amountPaid, setAmountPaid] = useState("");

  //  Initial Fetch 

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

    // Table Logic 
    
  const filteredInvoices = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number?.toLowerCase().includes(lower) ||
        inv.customer?.company_name?.toLowerCase().includes(lower) ||
        inv.status?.toLowerCase().includes(lower),
    );
  }, [invoices, searchTerm]);

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

  // ─── EDIT MODAL LOGIC ───
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

    setCgstRate(invoice.cgst_rate?.toString() || "0");
    setSgstRate(invoice.sgst_rate?.toString() || "0");
    setDiscount(invoice.discount_amount?.toString() || "0");
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
    total,
    balanceDue,
  } = useMemo(() => {
    const calcSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const safeDiscount = parseFloat(discount) || 0;
    const safeCgstRate = parseFloat(cgstRate) || 0;
    const safeSgstRate = parseFloat(sgstRate) || 0;
    const safeAmountPaid = parseFloat(amountPaid) || 0;

    let calcDiscount =
      discountType === "percent"
        ? calcSubtotal * (safeDiscount / 100)
        : safeDiscount;
    const taxableAmount = calcSubtotal - calcDiscount;
    const calcCgst = taxableAmount * (safeCgstRate / 100);
    const calcSgst = taxableAmount * (safeSgstRate / 100);
    const calcTotal = taxableAmount + calcCgst + calcSgst;
    const calcBalance = calcTotal - safeAmountPaid;

    return {
      subtotal: calcSubtotal,
      discountAmount: calcDiscount,
      cgstAmount: calcCgst,
      sgstAmount: calcSgst,
      total: calcTotal,
      balanceDue: calcBalance,
    };
  }, [lineItems, cgstRate, sgstRate, discount, discountType, amountPaid]);

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
      subtotal: subtotal,
      discount_amount: discountAmount,
      cgst_rate: parseFloat(cgstRate) || 0,
      sgst_rate: parseFloat(sgstRate) || 0,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      total_amount: total,
      amount_paid: parseFloat(amountPaid) || 0,
      balance_due: balanceDue,
      items: lineItems.map((item) => ({
        service: item.service_id ? parseInt(item.service_id) : null,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        amount: item.amount,
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
              
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-xeflow-surface p-4 rounded-xl border border-xeflow-border shadow-sm transition-colors duration-300">
          <div className="relative w-full sm:w-96">
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
        </div>

              {/*  Data Table  */}
              
        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg/50 border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider select-none">
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
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-xeflow-muted">
                        <div className="w-8 h-8 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin mb-4"></div>
                        <p>Loading invoices...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-xeflow-brand/5 transition-colors group"
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
                          className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
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
                  ))
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg">
              <span className="text-xs text-xeflow-muted font-medium">
                Showing{" "}
                {sortedInvoices.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, sortedInvoices.length)}{" "}
                of {sortedInvoices.length}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold hover:bg-xeflow-brand/10 disabled:opacity-50 text-xeflow-text"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold hover:bg-xeflow-brand/10 disabled:opacity-50 text-xeflow-text"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-xeflow-bg/40 backdrop-blur-[2px]">
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
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-xeflow-bg/80 backdrop-blur-sm">
                  <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-xeflow-surface rounded-2xl shadow-2xl border border-xeflow-border overflow-hidden animate-in zoom-in-95 duration-200">
                      
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
                    src={Xeventure_Logo}
                    alt="Xeventure Logo"
                    className="w-auto h-20 md:h-24 scale-500 ml-29"
                  />
                  <div className="text-sm text-xeflow-muted space-y-1 mt-2">
                    <p>123 Tech Park, Cyber Hub</p>
                    <p>Kerala, India 673592</p>
                    <p>Email: billing@xeventure.com</p>
                    <p>Phone: +91 98765 43210</p>
                    <p className="font-bold text-xeflow-text pt-2">
                      GSTIN: {GSTIN}
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
                      <select
                        value={invoiceMeta.status}
                        onChange={(e) =>
                          setInvoiceMeta({
                            ...invoiceMeta,
                            status: e.target.value,
                          })
                        }
                        className="text-right font-bold w-32 bg-xeflow-bg outline-none border border-xeflow-border rounded-md p-1 focus:border-xeflow-brand text-xeflow-text transition-colors cursor-pointer"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
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
                  <select
                    className="w-full text-base font-bold bg-xeflow-bg border border-xeflow-border rounded-lg p-2.5 outline-none focus:border-xeflow-brand transition-colors cursor-pointer text-xeflow-text"
                    onChange={(e) => {
                      const customer = dbCustomers.find(
                        (c) => c.id.toString() === e.target.value,
                      );
                      setSelectedCustomer(customer || null);
                    }}
                    value={selectedCustomer?.id || ""}
                  >
                    <option value=""> Select a Customer </option>
                    {dbCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.company_name} ({cust.rep_name})
                      </option>
                    ))}
                  </select>

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
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-10">
                <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                  <div className="col-span-6">Service / Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>

                <div className="space-y-2 pt-3">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-center group bg-xeflow-bg/30 p-2 rounded-lg border border-transparent hover:border-xeflow-border transition-colors"
                    >
                      <div className="col-span-6 flex flex-col gap-1.5">
                        <select
                          value={item.service_id}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              "service_id",
                              e.target.value,
                            )
                          }
                          className="w-full text-sm font-bold bg-transparent border-b border-xeflow-border outline-none focus:border-xeflow-brand pb-1 text-xeflow-text cursor-pointer"
                        >
                          <option value="">-- Custom Item --</option>
                          {dbServices.map((srv) => (
                            <option key={srv.id} value={srv.id}>
                              {srv.name}
                            </option>
                          ))}
                        </select>
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

                      <div className="col-span-2">
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
                          className="w-full text-right text-sm bg-xeflow-bg border border-xeflow-border rounded p-2 outline-none focus:border-xeflow-brand text-xeflow-text transition-colors"
                        />
                      </div>

                      <div className="col-span-2">
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
                          className="w-full text-right text-sm bg-xeflow-bg border border-xeflow-border rounded p-2 outline-none focus:border-xeflow-brand text-xeflow-text transition-colors"
                        />
                      </div>

                      <div className="col-span-2 text-right text-sm font-bold relative flex items-center justify-end gap-3">
                        {formatMoney(item.amount)}
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="text-xeflow-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Item"
                        >
                          <FiTrash2 size={16} />
                        </button>
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
    </div>
  );
};

export default EditInvoice;
