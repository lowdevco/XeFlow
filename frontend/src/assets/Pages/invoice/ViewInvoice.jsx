import  { useState, useEffect, useMemo } from "react";
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
} from "react-icons/fi";
import toast from "react-hot-toast";

import { fetchWithAuth } from "../../js/api";
import Xeventure_Logo from "../../image/Xeventure.png";
const GSTIN = "32ABCDE1234F1Z5";

const ViewInvoice = () => {
  const [invoices, setInvoices] = useState([]);
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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetchWithAuth("/invoices/", { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch invoices.");

        const data = await response.json();
        setInvoices(data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError(err.message);
        toast.error("Failed to load invoices."); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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

  const handleMail = (invoice) => {
    const email = invoice.customer?.email || "";
    const subject = encodeURIComponent(
      `Invoice ${invoice.invoice_number} from Xeventure Technologies`,
    );
    const body = encodeURIComponent(
      `Hi ${invoice.customer?.rep_name || "there"},\n\n` +
        `Please find attached the invoice ${invoice.invoice_number} for the recent services.\n\n` +
        `Thank you for your business!\n\n` +
        `Best regards,\n` +
        `Xeventure Technologies`,
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleDownload = (invoiceId) => {
    toast.success(`Triggering PDF download for Invoice ID: ${invoiceId}`); 
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
          <Link to="/invoice/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-xeflow-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-md shadow-xeflow-brand/20">
              <FiPlus size={18} /> Create Invoice
            </button>
          </Link>
        </div>

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
                            onClick={() => setSelectedInvoice(invoice)}
                            className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-xeflow-brand hover:text-xeflow-brand rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => handleMail(invoice)}
                            className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-blue-500 hover:text-blue-500 rounded-lg transition-colors"
                            title="Send via Email"
                          >
                            <FiMail size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(invoice.id)}
                            className="p-2 bg-xeflow-bg border border-xeflow-border hover:border-green-500 hover:text-green-500 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <FiDownload size={16} />
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
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold hover:bg-xeflow-brand/10 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border border-xeflow-border rounded-lg text-xs font-semibold hover:bg-xeflow-brand/10 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-xeflow-bg/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-xeflow-surface rounded-2xl shadow-2xl border border-xeflow-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-xeflow-border bg-xeflow-bg/50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-xeflow-text">
                  Invoice {selectedInvoice.invoice_number}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(selectedInvoice.status)}`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-xeflow-muted hover:text-xeflow-brand transition-colors"
                  title="Print"
                >
                  <FiPrinter size={18} />
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
                    src={Xeventure_Logo}
                    alt="Xeventure Logo"
                    className="w-auto h-20 md:h-28 object-contain"
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
                  </div>
                ) : (
                  <p className="text-sm text-red-500">
                    Customer details missing.
                  </p>
                )}
              </div>

              <div className="mb-10">
                <div className="grid grid-cols-12 gap-4 pb-3 border-b-2 border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider">
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
                        className="grid grid-cols-12 gap-4 items-center py-2 border-b border-xeflow-border/50 text-sm"
                      >
                        <div className="col-span-6 font-semibold text-xeflow-text">
                          {item.description}
                        </div>
                        <div className="col-span-2 text-right text-xeflow-muted">
                          {parseFloat(item.quantity)}
                        </div>
                        <div className="col-span-2 text-right text-xeflow-muted">
                          {formatMoney(item.rate)}
                        </div>
                        <div className="col-span-2 text-right font-bold text-xeflow-text">
                          {formatMoney(item.amount)}
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
    </div>
  );
};

export default ViewInvoice;
