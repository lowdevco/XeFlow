import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { fetchWithAuth } from "../../js/api";
import { API_ROUTES } from "../../../Routing/apiroutes";
import { formatMoney, formatDate } from "../../info/formatter";
import CustomSelect from "../../components/CustomSelect";
import {
  FiCalendar,
  FiSearch,
  FiChevronDown,
  FiEye,
  FiDownload,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { generateStatementPDF } from "../../js/Statement_PDF";

const combineDateWithCurrentTime = (dateStr) => {
  if (!dateStr) return new Date().toISOString();
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date();
    dateObj.setFullYear(year, month - 1, day);
    return dateObj.toISOString();
  } catch (e) {
    return new Date(dateStr).toISOString();
  }
};

const Statement = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("fy");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatementItem, setSelectedStatementItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc",
  });
  const itemsPerPage = 10;

  const periodOptions = useMemo(
    () => [
      { value: "all", label: "All Time" },
      { value: "fy", label: "This Financial Year" },
      { value: "last_fy", label: "Last Financial Year" },
      { value: "month", label: "This Month" },
      { value: "last_month", label: "Last Month" },
      { value: "custom", label: "Custom Range" },
    ],
    [],
  );

  useEffect(() => {
    const fetchStatementData = async () => {
      try {
        const [invRes, payRes] = await Promise.all([
          fetchWithAuth(API_ROUTES.INVOICES, { method: "GET" }),
          fetchWithAuth(API_ROUTES.PAYMENTS, { method: "GET" }),
        ]);

        if (!invRes.ok) throw new Error("Failed to fetch invoices.");
        if (!payRes.ok) throw new Error("Failed to fetch payments.");

        setInvoices(await invRes.json());
        setPayments(await payRes.json());
      } catch (err) {
        console.error("Error loading statement data:", err);
        toast.error("Failed to load statement records.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatementData();
  }, []);

  const activeRange = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    let start = new Date();
    let end = new Date();
    let label = "";

    switch (filterType) {
      case "all":
        start = new Date(1970, 0, 1);
        end = new Date(2100, 11, 31);
        label = "All Time";
        break;

      case "month":
        start = new Date(currentYear, currentMonth, 1);
        end = new Date(currentYear, currentMonth + 1, 0);
        label = today.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        });
        break;

      case "last_month":
        start = new Date(currentYear, currentMonth - 1, 1);
        end = new Date(currentYear, currentMonth, 0);
        label = start.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        });
        break;

      case "fy": {
        const isFYStart = currentMonth >= 3;
        const fyStartYear = isFYStart ? currentYear : currentYear - 1;
        start = new Date(fyStartYear, 3, 1);
        end = new Date(fyStartYear + 1, 2, 31);
        label = `FY ${fyStartYear}-${(fyStartYear + 1).toString().substring(2)}`;
        break;
      }

      case "last_fy": {
        const isFYStart = currentMonth >= 3;
        const fyStartYear = (isFYStart ? currentYear : currentYear - 1) - 1;
        start = new Date(fyStartYear, 3, 1);
        end = new Date(fyStartYear + 1, 2, 31);
        label = `FY ${fyStartYear}-${(fyStartYear + 1).toString().substring(2)}`;
        break;
      }

      case "custom":
        if (customStart && customEnd) {
          const [sYear, sMonth, sDay] = customStart.split("-").map(Number);
          start = new Date(sYear, sMonth - 1, sDay);
          const [eYear, eMonth, eDay] = customEnd.split("-").map(Number);
          end = new Date(eYear, eMonth - 1, eDay);
          const opt = { day: "numeric", month: "short", year: "numeric" };
          label = `${start.toLocaleDateString("en-IN", opt)} - ${end.toLocaleDateString("en-IN", opt)}`;
        } else {
          start = new Date(currentYear, currentMonth, 1);
          end = new Date(currentYear, currentMonth + 1, 0);
          label = "Select Range";
        }
        break;

      default:
        break;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end, label };
  }, [filterType, customStart, customEnd]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, customStart, customEnd, searchTerm]);

  const statementRows = useMemo(() => {
    let list = [];

    invoices.forEach((inv) => {
      if (inv.status === "Draft") return;

      const issueDate = inv.issue_date || inv.created_at.split("T")[0];
      const [iYear, iMonth, iDay] = issueDate.split("-").map(Number);
      const issue = new Date(iYear, iMonth - 1, iDay);

      if (filterType !== "all") {
        if (issue < activeRange.start || issue > activeRange.end) return;
      }

      const desc =
        inv.items && inv.items.length > 0
          ? inv.items
              .map((item) => item.description || item.service?.name)
              .join(", ")
          : "INVOICE INITIATED";

      list.push({
        id: `inv-${inv.id}`,
        date: issueDate,
        time: "",
        timestamp: new Date(issueDate).getTime(),
        refNo: inv.invoice_number,
        type: "Invoice Initiated",
        client: inv.customer?.company_name || "—",
        description: desc.toUpperCase(),
        transactionId: "—",
        debit: parseFloat(inv.total_amount) || 0,
        credit: 0,
        invoiceId: inv.id,
        invoiceNumber: inv.invoice_number,
      });
    });

    payments.forEach((pay) => {
      const pDate = new Date(pay.payment_date);

      if (filterType !== "all") {
        if (pDate < activeRange.start || pDate > activeRange.end) return;
      }

      const inv = invoices.find((i) => i.id === pay.invoice);
      const payDate = pay.payment_date.split("T")[0];
      const timeStr = new Date(pay.payment_date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      list.push({
        id: `pay-${pay.id}`,
        date: payDate,
        time: timeStr,
        timestamp: new Date(pay.payment_date).getTime(),
        refNo: `REC-${inv?.invoice_number?.substring(4) || "PAY"}`,
        type: "Cash Received",
        client: inv?.customer?.company_name || "—",
        description: (pay.description || "Cash Received").toUpperCase(),
        transactionId: pay.transaction_id || "—",
        debit: 0,
        credit: parseFloat(pay.amount) || 0,
        invoiceId: inv?.id || null,
        invoiceNumber: inv?.invoice_number || "—",
      });
    });

    list.sort((a, b) => a.timestamp - b.timestamp);

    let running = 0;
    const listWithRunningBalance = list.map((item) => {
      running += item.debit - item.credit;
      return {
        ...item,
        balance: running,
      };
    });

    let filteredList = listWithRunningBalance;
    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      filteredList = listWithRunningBalance.filter(
        (item) =>
          item.description.toLowerCase().includes(lower) ||
          item.refNo.toLowerCase().includes(lower) ||
          item.client.toLowerCase().includes(lower) ||
          item.type.toLowerCase().includes(lower) ||
          (item.transactionId &&
            item.transactionId.toLowerCase().includes(lower)),
      );
    }

    if (sortConfig) {
      filteredList.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "date") {
          aVal = a.timestamp;
          bVal = b.timestamp;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredList;
  }, [invoices, payments, filterType, activeRange, searchTerm, sortConfig]);

  const stats = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    statementRows.forEach((row) => {
      totalDebit += row.debit;
      totalCredit += row.credit;
    });
    return {
      debit: totalDebit,
      credit: totalCredit,
      balance: totalDebit - totalCredit,
    };
  }, [statementRows]);

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

  const handlePrint = () => {
    generateStatementPDF(statementRows, filterType, activeRange, toast);
  };

  const totalPages = Math.ceil(statementRows.length / itemsPerPage);
  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return statementRows.slice(startIdx, startIdx + itemsPerPage);
  }, [statementRows, currentPage]);

  const formatTableDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Skeleton
                width={200}
                height={28}
                className="rounded-xl animate-pulse"
              />
              <Skeleton
                width={320}
                height={16}
                className="rounded-lg mt-2 animate-pulse"
              />
            </div>
            <Skeleton
              width={140}
              height={40}
              className="rounded-xl animate-pulse"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm space-y-3"
              >
                <Skeleton width={120} height={12} className="rounded" />
                <Skeleton width={180} height={28} className="rounded-lg" />
              </div>
            ))}
          </div>

          <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-spacing-0 min-w-[800px] text-sm">
                <thead>
                  <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Date &amp; Time</th>
                    <th className="px-6 py-4 text-left">Ref No</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Client</th>
                    <th className="px-6 py-4 text-right">Debit (+)</th>
                    <th className="px-6 py-4 text-right">Credit (-)</th>
                    <th className="px-6 py-4 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-xeflow-border/50">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-xeflow-border/50">
                      <td className="px-6 py-4">
                        <Skeleton
                          width={120}
                          height={14}
                          className="rounded animate-pulse"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton
                          width={80}
                          height={14}
                          className="rounded animate-pulse"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton
                          width={100}
                          height={14}
                          className="rounded animate-pulse"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton
                          width={150}
                          height={14}
                          className="rounded animate-pulse"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton
                          width={80}
                          height={14}
                          className="rounded animate-pulse"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton
                          width={80}
                          height={14}
                          className="rounded animate-pulse"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton
                          width={90}
                          height={14}
                          className="rounded animate-pulse"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 print:bg-white print:p-0 print:pb-0">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <p className="text-xs font-semibold text-xeflow-muted uppercase tracking-widest mb-1">
              Bank &amp; Cash
            </p>
            <h1 className="text-2xl font-bold text-xeflow-text tracking-tight">
              Statements
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Initiated invoices and recorded payments log
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CustomSelect
              value={filterType}
              onChange={setFilterType}
              options={periodOptions}
              placeholder="Select Period"
              dropdownHeader="Select Period"
              align="right"
              prefixIcon={
                <FiCalendar className="text-xeflow-brand text-sm shrink-0" />
              }
              triggerLabel={activeRange.label}
              buttonClassName="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-xeflow-surface border border-xeflow-border text-xeflow-text shadow-sm hover:shadow-md hover:border-xeflow-brand transition-all cursor-pointer min-w-[210px] text-left"
              dropdownClassName="w-60 right-0 bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl p-2.5"
              optionClassName="py-2.5 rounded-xl text-xs font-bold px-3.5"
            />
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <FiDownload size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* Custom date range panel */}

        {filterType === "custom" && (
          <div className="p-5 bg-xeflow-surface border border-xeflow-border/80 rounded-2xl shadow-inner flex flex-wrap items-center gap-5 animate-in slide-in-from-top-4 duration-300 print:hidden">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-xeflow-muted tracking-wider">
                From Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                onClick={(e) => {
                  try {
                    e.target.showPicker();
                  } catch (err) {}
                }}
                className="px-4 py-2.5 border border-xeflow-border rounded-xl text-sm text-xeflow-text bg-xeflow-bg outline-none focus:border-xeflow-brand transition-colors cursor-pointer font-semibold shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-xeflow-muted tracking-wider">
                To Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                onClick={(e) => {
                  try {
                    e.target.showPicker();
                  } catch (err) {}
                }}
                className="px-4 py-2.5 border border-xeflow-border rounded-xl text-sm text-xeflow-text bg-xeflow-bg outline-none focus:border-xeflow-brand transition-colors cursor-pointer font-semibold shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Print Only Header */}

        <div className="hidden print:block border-b-2 border-xeflow-border pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase">
                XeFlow Financial Statement
              </h1>
              <p className="text-sm text-xeflow-muted mt-1">
                Period: {activeRange.label}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold">Nexora Technologies Pvt Ltd</h2>
              <p className="text-xs text-xeflow-muted mt-1">
                Generated: {new Date().toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* KPI Stats Widgets */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-500/80" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] text-xeflow-muted font-bold uppercase tracking-wider">
                Total Invoices (Dr)
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <FiArrowUpRight size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-xeflow-text tracking-tight">
                {formatMoney(stats.debit)}
              </h3>
              <p className="text-xs text-xeflow-muted mt-1">
                Sum of all initiated billing
              </p>
            </div>
          </div>

          <div className="relative bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-green-500/80" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] text-xeflow-muted font-bold uppercase tracking-wider">
                Cash Received (Cr)
              </span>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                <FiArrowDownLeft size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-xeflow-text tracking-tight">
                {formatMoney(stats.credit)}
              </h3>
              <p className="text-xs text-xeflow-muted mt-1">
                Sum of all payments collected
              </p>
            </div>
          </div>

          <div className="relative bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-xeflow-brand/80" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] text-xeflow-muted font-bold uppercase tracking-wider">
                Net Outstanding Balance
              </span>
              <div className="w-10 h-10 rounded-xl bg-xeflow-brand/10 text-xeflow-brand flex items-center justify-center">
                <span className="text-xs font-black tracking-wider">INR</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-xeflow-text tracking-tight">
                {formatMoney(stats.balance)}
              </h3>
              <p className="text-xs text-xeflow-muted mt-1">
                Outstanding billing balance
              </p>
            </div>
          </div>
        </div>

        {/* Filter bar / search input */}

        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-xeflow-surface p-4 rounded-2xl border border-xeflow-border shadow-sm print:hidden">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted text-base" />
            <input
              type="text"
              placeholder="Search by client, invoice number, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm outline-none focus:border-xeflow-brand text-xeflow-text transition-all font-semibold"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-bold text-red-500 hover:underline px-2 py-1 print:hidden"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Ledger Transactions Table (Excel Sheet Style) */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors duration-300 print:border-0 print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[950px] text-sm text-xeflow-text">
              <thead>
                <tr className="bg-xeflow-bg/80 text-xs font-bold text-xeflow-muted uppercase tracking-wider select-none print:bg-gray-100">
                  <th
                    className="px-4 py-2.5 text-left border border-xeflow-border/60 cursor-pointer group hover:bg-xeflow-bg transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    Date &amp; Time
                  </th>
                  <th
                    className="px-4 py-2.5 text-left border border-xeflow-border/60 cursor-pointer group hover:bg-xeflow-bg transition-colors"
                    onClick={() => handleSort("refNo")}
                  >
                    Ref No
                  </th>
                  <th
                    className="px-4 py-2.5 text-left border border-xeflow-border/60 cursor-pointer group hover:bg-xeflow-bg transition-colors"
                    onClick={() => handleSort("type")}
                  >
                    Type
                  </th>
                  <th
                    className="px-4 py-2.5 text-left border border-xeflow-border/60 cursor-pointer group hover:bg-xeflow-bg transition-colors"
                    onClick={() => handleSort("client")}
                  >
                    Client
                  </th>
                  <th className="px-4 py-2.5 text-right border border-xeflow-border/60 w-36">
                    Debit (+)
                  </th>
                  <th className="px-4 py-2.5 text-right border border-xeflow-border/60 w-36">
                    Credit (-)
                  </th>
                  <th className="px-4 py-2.5 text-right border border-xeflow-border/60 w-40">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => {
                    const isInvoice = row.type === "Invoice Initiated";

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedStatementItem(row)}
                        className="hover:bg-xeflow-brand/5 even:bg-xeflow-bg/5 odd:bg-xeflow-surface transition-colors cursor-pointer group print:hover:bg-transparent"
                      >
                        <td className="px-4 py-2.5 whitespace-nowrap border border-xeflow-border/30 text-xs font-semibold">
                          <span>{formatTableDate(row.date)}</span>
                          {row.time && (
                            <span className="text-[10px] text-xeflow-muted font-bold ml-1.5">
                              ({row.time})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap border border-xeflow-border/30 font-bold text-xs">
                          {row.invoiceId ? (
                            <Link
                              to={`/invoice/view`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xeflow-brand hover:underline"
                            >
                              {row.refNo}
                            </Link>
                          ) : (
                            row.refNo
                          )}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap border border-xeflow-border/30">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border tracking-wider ${
                              isInvoice
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold border border-xeflow-border/30 text-xs truncate max-w-[180px]">
                          {row.client}
                        </td>
                        <td className="px-4 py-2.5 text-right font-black border border-xeflow-border/30 text-xs text-xeflow-text">
                          {row.debit > 0
                            ? `₹${row.debit.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-black border border-xeflow-border/30 text-xs text-green-600">
                          {row.credit > 0
                            ? `₹${row.credit.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-black border border-xeflow-border/30 text-xs text-xeflow-brand">
                          ₹{row.balance.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-xs font-semibold text-xeflow-muted border border-xeflow-border/30"
                    >
                      No matching statement records found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-xeflow-border flex items-center justify-between print:hidden">
              <span className="text-xs font-bold text-xeflow-muted">
                Page {currentPage} of {totalPages} ({statementRows.length} total
                rows)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-xeflow-border bg-xeflow-surface hover:bg-xeflow-bg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-xeflow-border bg-xeflow-surface hover:bg-xeflow-bg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal Popup */}

      {selectedStatementItem && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-xeflow-bg/80 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 text-xeflow-text">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-xeflow-border bg-xeflow-bg/50">
              <h3 className="text-lg font-bold">Transaction Details</h3>
              <button
                onClick={() => setSelectedStatementItem(null)}
                className="p-1.5 hover:text-red-500 transition-colors bg-xeflow-bg rounded-full border border-xeflow-border cursor-pointer flex items-center justify-center"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Modal Body */}

            <div className="p-6 space-y-4 text-sm">
              <div className="bg-xeflow-bg/50 border border-xeflow-border p-4 rounded-xl space-y-3">
                <div className="flex justify-between border-b border-xeflow-border/40 pb-2">
                  <span className="text-xeflow-muted font-semibold">
                    Reference Number
                  </span>
                  <span className="font-bold">
                    {selectedStatementItem.refNo}
                  </span>
                </div>
                <div className="flex justify-between border-b border-xeflow-border/40 pb-2">
                  <span className="text-xeflow-muted font-semibold">Type</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border tracking-wider ${
                      selectedStatementItem.type === "Invoice Initiated"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : "bg-green-500/10 text-green-500 border-green-500/20"
                    }`}
                  >
                    {selectedStatementItem.type}
                  </span>
                </div>
                <div className="flex justify-between border-b border-xeflow-border/40 pb-2">
                  <span className="text-xeflow-muted font-semibold">
                    Client
                  </span>
                  <span className="font-bold">
                    {selectedStatementItem.client}
                  </span>
                </div>
                <div className="flex justify-between border-b border-xeflow-border/40 pb-2">
                  <span className="text-xeflow-muted font-semibold">
                    Date &amp; Time
                  </span>
                  <span className="font-bold">
                    {formatTableDate(selectedStatementItem.date)}
                    {selectedStatementItem.time &&
                      ` (${selectedStatementItem.time})`}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-xeflow-muted font-semibold">
                    Transaction ID
                  </span>
                  <span className="font-mono font-bold">
                    {selectedStatementItem.transactionId}
                  </span>
                </div>
              </div>

              {/* Financial values */}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-xeflow-bg/30 p-3 rounded-xl border border-xeflow-border text-center">
                  <p className="text-[10px] font-bold text-xeflow-muted uppercase tracking-wider">
                    Debit (+)
                  </p>
                  <p className="text-lg font-black text-xeflow-text mt-1">
                    {selectedStatementItem.debit > 0
                      ? formatMoney(selectedStatementItem.debit)
                      : "—"}
                  </p>
                </div>
                <div className="bg-xeflow-bg/30 p-3 rounded-xl border border-xeflow-border text-center">
                  <p className="text-[10px] font-bold text-xeflow-muted uppercase tracking-wider">
                    Credit (-)
                  </p>
                  <p className="text-lg font-black text-green-600 mt-1">
                    {selectedStatementItem.credit > 0
                      ? formatMoney(selectedStatementItem.credit)
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Description box */}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">
                  Description / Notes
                </label>
                <div className="bg-xeflow-bg/50 border border-xeflow-border p-4 rounded-xl text-xeflow-text leading-relaxed min-h-[80px]">
                  {selectedStatementItem.description ? (
                    <div className="space-y-2.5">
                      {selectedStatementItem.description
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 text-[13px]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-xeflow-brand mt-1.5 shrink-0" />
                            <span className="font-bold text-xeflow-text leading-snug">
                              {item}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <span className="text-xeflow-muted text-[13px] italic">
                      No description provided.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statement;
