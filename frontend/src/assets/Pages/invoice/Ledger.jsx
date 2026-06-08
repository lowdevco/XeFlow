import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { fetchWithAuth } from "../../js/api";
import { API_ROUTES } from "../../../Routing/apiroutes";
import { formatMoney } from "../../info/formatter";
import CustomSelect from "../../components/CustomSelect";
import {
  FiCalendar,
  FiSearch,
  FiPlus,
  FiArrowLeft,
  FiEye,
  FiChevronDown,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Ledger = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const itemsPerPage = 10;

  const periodOptions = useMemo(() => [
    { value: "all", label: "All Time" },
    { value: "fy", label: "This Financial Year" },
    { value: "last_fy", label: "Last Financial Year" },
    { value: "month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "custom", label: "Custom Range" },
  ], []);

  useEffect(() => {
    const fetchLedgerData = async () => {
      try {
        const [invRes, custRes] = await Promise.all([
          fetchWithAuth(API_ROUTES.INVOICES, { method: "GET" }),
          fetchWithAuth(API_ROUTES.CUSTOMERS, { method: "GET" }),
        ]);

        if (!invRes.ok) throw new Error("Failed to fetch invoices.");
        if (!custRes.ok) throw new Error("Failed to fetch customers.");

        setInvoices(await invRes.json());
        setCustomers(await custRes.json());
      } catch (err) {
        console.error("Error loading ledger:", err);
        toast.error("Failed to load ledger records.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLedgerData();
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

  const customerSummaryList = useMemo(() => {
    const list = customers.map((cust) => {
      const custInvoices = invoices.filter(
        (inv) => inv.customer?.id === cust.id && inv.status !== "Draft"
      );

      let totalInvoiced = 0;
      let totalPaid = 0;

      custInvoices.forEach((inv) => {
        totalInvoiced += parseFloat(inv.total_amount) || 0;
        totalPaid += parseFloat(inv.amount_paid) || 0;
      });

      return {
        ...cust,
        totalInvoiced,
        totalPaid,
        outstanding: totalInvoiced - totalPaid,
      };
    });

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      return list.filter((item) =>
        item.company_name.toLowerCase().includes(lower)
      );
    }

    return list;
  }, [invoices, customers, searchTerm]);

  const customerLedgerRows = useMemo(() => {
    if (!selectedCustomerFilter || selectedCustomerFilter === "all") return [];

    let list = [];

    const custInvoices = invoices.filter((inv) => {
      if (inv.status === "Draft") return false;
      if (inv.customer?.id !== selectedCustomerFilter) return false;

      if (filterType !== "all") {
        if (!inv.issue_date) return false;
        const [iYear, iMonth, iDay] = inv.issue_date.split("-").map(Number);
        const issue = new Date(iYear, iMonth - 1, iDay);
        if (issue < activeRange.start || issue > activeRange.end) return false;
      }

      return true;
    });

    custInvoices.forEach((inv) => {
      const desc =
        inv.items && inv.items.length > 0
          ? inv.items.map((item) => item.description || item.service?.name).join(", ")
          : "INVOICE GENERATED";

      const issueDate = inv.issue_date || inv.created_at.split("T")[0];

      list.push({
        date: issueDate,
        timestamp: new Date(issueDate).getTime(),
        refNo: inv.invoice_number,
        type: "Invoice",
        description: desc.toUpperCase(),
        debit: parseFloat(inv.total_amount) || 0,
        credit: 0,
      });

      const paid = parseFloat(inv.amount_paid) || 0;
      if (paid > 0) {
        const payDate = inv.updated_at
          ? inv.updated_at.split("T")[0]
          : issueDate;
        list.push({
          date: payDate,
          timestamp: new Date(payDate).getTime() + 1,
          refNo: `REC-${inv.invoice_number.substring(4)}`,
          type: "Payment",
          description: "CASH RECEIVED",
          debit: 0,
          credit: paid,
        });
      }
    });

    list.sort((a, b) => a.timestamp - b.timestamp);

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
          item.description.toLowerCase().includes(lower) ||
          item.refNo.toLowerCase().includes(lower)
      );
    }

    let running = 0;
    return list.map((item, idx) => {
      running += item.debit - item.credit;
      return {
        ...item,
        no: idx + 1,
        balance: running,
      };
    });
  }, [invoices, selectedCustomerFilter, filterType, activeRange, searchTerm]);

  const ledgerTotals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    customerLedgerRows.forEach((row) => {
      totalDebit += row.debit;
      totalCredit += row.credit;
    });
    return {
      debit: totalDebit,
      credit: totalCredit,
      balance: totalDebit - totalCredit,
    };
  }, [customerLedgerRows]);

  const customerOptions = useMemo(() => {
    const list = customers.map((c) => ({
      value: c.id,
      label: c.company_name,
    }));
    return [{ value: "all", label: "All Clients Summary" }, ...list];
  }, [customers]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [selectedCustomerFilter, filterType, customStart, customEnd]);

  const activeRows = selectedCustomerFilter && selectedCustomerFilter !== "all" ? customerLedgerRows : customerSummaryList;
  const totalPages = Math.ceil(activeRows.length / itemsPerPage);
  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return activeRows.slice(startIdx, startIdx + itemsPerPage);
  }, [activeRows, currentPage]);

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
              <Skeleton width={200} height={28} className="rounded-xl animate-pulse" />
              <Skeleton width={320} height={16} className="rounded-lg mt-2 animate-pulse" />
            </div>
            <Skeleton width={140} height={40} className="rounded-xl animate-pulse" />
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-xeflow-surface p-4 rounded-xl border border-xeflow-border shadow-sm">
            <Skeleton width={280} height={38} className="rounded-xl animate-pulse" />
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton width={180} height={38} className="rounded-xl animate-pulse" />
            </div>
          </div>

          <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-spacing-0 min-w-[800px] text-sm">
                <thead>
                  <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                    <th className="px-6 py-4 text-left">Client Name</th>
                    <th className="px-6 py-4 text-right w-52">Total Invoiced (Dr)</th>
                    <th className="px-6 py-4 text-right w-52">Total Paid (Cr)</th>
                    <th className="px-6 py-4 text-right w-52">Net Outstanding</th>
                    <th className="px-6 py-4 text-center w-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-xeflow-border/50">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-xeflow-border/50">
                      <td className="px-6 py-4 text-left">
                        <Skeleton width={180} height={14} className="rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton width={110} height={14} className="rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton width={110} height={14} className="rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton width={110} height={14} className="rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Skeleton width={100} height={28} className="rounded-lg inline-block animate-pulse" />
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

  const activeCustomerObj = customers.find((c) => c.id === selectedCustomerFilter);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              {selectedCustomerFilter && selectedCustomerFilter !== "all" && (
                <button
                  onClick={() => setSelectedCustomerFilter("all")}
                  className="p-2 rounded-lg border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:border-xeflow-brand transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-sm"
                  title="Back to Summary"
                >
                  <FiArrowLeft size={18} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-xeflow-text">
                  {selectedCustomerFilter && selectedCustomerFilter !== "all"
                    ? `Ledger Statement`
                    : "Accounting Ledgers"}
                </h1>
                <p className="text-sm text-xeflow-muted mt-1">
                  {selectedCustomerFilter && selectedCustomerFilter !== "all"
                    ? `${activeCustomerObj?.company_name} — Attn: ${activeCustomerObj?.rep_name} (${activeCustomerObj?.email})`
                    : "Overview of customer outstanding balances and payment summaries."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
              placeholder={
                selectedCustomerFilter && selectedCustomerFilter !== "all"
                  ? "Search transaction or ref #..."
                  : "Search client name..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder-xeflow-muted outline-none focus:border-xeflow-brand transition-colors font-medium shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold shadow-sm hover:shadow-md hover:border-xeflow-brand transition-all cursor-pointer whitespace-nowrap min-w-[180px] text-left ${selectedCustomerFilter && selectedCustomerFilter !== "all" ? "bg-xeflow-brand/10 border-xeflow-brand text-xeflow-brand" : "bg-xeflow-surface border-xeflow-border text-xeflow-text"}`}
              >
                <span className="truncate">
                  {selectedCustomerFilter && selectedCustomerFilter !== "all"
                    ? activeCustomerObj?.company_name
                    : "All Clients Summary"}
                </span>
                <FiChevronDown
                  size={14}
                  className={`transition-transform duration-200 shrink-0 ${isFilterDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-xeflow-surface border border-xeflow-border shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-3 duration-250 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <p className="text-[10px] font-black uppercase text-xeflow-muted tracking-wider px-3.5 py-1.5 border-b border-xeflow-border/40 mb-1 select-none">
                    Select Client
                  </p>
                  <div
                    onClick={() => {
                      setSelectedCustomerFilter("all");
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`text-left text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${selectedCustomerFilter === "all" ? "bg-xeflow-brand/10 text-xeflow-brand" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                  >
                    All Clients Summary
                  </div>
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomerFilter(customer.id);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`text-left text-xs font-bold px-3.5 py-2 mt-0.5 rounded-lg transition-colors cursor-pointer truncate ${selectedCustomerFilter === customer.id ? "bg-xeflow-brand/10 text-xeflow-brand" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                      title={customer.company_name}
                    >
                      {customer.company_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomerFilter && selectedCustomerFilter !== "all" && (
              <CustomSelect
                value={filterType}
                onChange={setFilterType}
                options={periodOptions}
                placeholder="Select Period"
                dropdownHeader="Select Period"
                align="right"
                prefixIcon={<FiCalendar className="text-xeflow-brand text-sm shrink-0" />}
                triggerLabel={activeRange.label}
                buttonClassName="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-xeflow-surface border border-xeflow-border text-xeflow-text shadow-sm hover:shadow-md hover:border-xeflow-brand transition-all cursor-pointer min-w-[180px] text-left"
                dropdownClassName="w-60 right-0 bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-2xl p-2.5"
                optionClassName="py-2.5 rounded-xl text-xs font-bold px-3.5"
              />
            )}
          </div>
        </div>

        {selectedCustomerFilter && selectedCustomerFilter !== "all" && filterType === "custom" && (
          <div className="p-5 bg-xeflow-surface border border-xeflow-border/80 rounded-2xl shadow-inner flex flex-wrap items-center gap-5 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-xeflow-muted tracking-wider">
                From Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
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
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                className="px-4 py-2.5 border border-xeflow-border rounded-xl text-sm text-xeflow-text bg-xeflow-bg outline-none focus:border-xeflow-brand transition-colors cursor-pointer font-semibold shadow-sm"
              />
            </div>
          </div>
        )}

        {selectedCustomerFilter && selectedCustomerFilter !== "all" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-wider mb-2">
                Total Invoiced (Dr)
              </p>
              <h3 className="text-xl md:text-2xl font-black text-xeflow-text leading-none tracking-tight">
                {formatMoney(ledgerTotals.debit)}
              </h3>
            </div>
            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-wider mb-2">
                Total Paid (Cr)
              </p>
              <h3 className="text-xl md:text-2xl font-black text-xeflow-brand leading-none tracking-tight">
                {formatMoney(ledgerTotals.credit)}
              </h3>
            </div>
            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-wider mb-2">
                Net Outstanding
              </p>
              <h3 className={`text-xl md:text-2xl font-black leading-none tracking-tight ${ledgerTotals.balance > 0 ? "text-red-500" : "text-green-500"}`}>
                {formatMoney(ledgerTotals.balance)}
              </h3>
            </div>
          </div>
        )}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
          <div className="overflow-x-auto w-full">
            {selectedCustomerFilter === "all" || !selectedCustomerFilter ? (
              <table className="w-full border-collapse border-spacing-0 min-w-[800px] text-sm text-xeflow-text">
                <thead>
                  <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                    <th className="px-6 py-4 text-left">Client Name</th>
                    <th className="px-6 py-4 text-right w-52">Total Invoiced (Dr)</th>
                    <th className="px-6 py-4 text-right w-52">Total Paid (Cr)</th>
                    <th className="px-6 py-4 text-right w-52">Net Outstanding</th>
                    <th className="px-6 py-4 text-center w-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-xeflow-border/50 font-medium">
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-xeflow-brand/5 border-b border-xeflow-border/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-left font-bold text-xeflow-text">
                          {row.company_name}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-xeflow-text">
                          {formatMoney(row.totalInvoiced)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-xeflow-brand">
                          {formatMoney(row.totalPaid)}
                        </td>
                        <td className={`px-6 py-4 text-right font-black ${row.outstanding > 0 ? "text-red-500" : "text-green-500"}`}>
                          {formatMoney(row.outstanding)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedCustomerFilter(row.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-xeflow-brand bg-xeflow-brand/10 border border-transparent hover:border-xeflow-brand rounded-lg transition-all cursor-pointer active:scale-95"
                          >
                            <FiEye size={14} /> View Ledger
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-16 text-center text-xeflow-muted font-semibold"
                      >
                        No customer accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full border-collapse border-spacing-0 min-w-[800px] text-sm text-xeflow-text">
                <thead>
                  <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300 select-none">
                    <th className="px-6 py-4 text-center w-16">NO</th>
                    <th className="px-6 py-4 text-center w-36">DATE</th>
                    <th className="px-6 py-4 text-left w-36">REF #</th>
                    <th className="px-6 py-4 text-left w-28">TYPE</th>
                    <th className="px-6 py-4 text-left">DESCRIPTION</th>
                    <th className="px-6 py-4 text-right w-44">DEBIT (Dr)</th>
                    <th className="px-6 py-4 text-right w-44">CREDIT (Cr)</th>
                    <th className="px-6 py-4 text-right w-48">RUNNING BALANCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-xeflow-border/50 font-medium">
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row) => (
                      <tr
                        key={`${row.refNo}-${row.no}`}
                        className="hover:bg-xeflow-brand/5 border-b border-xeflow-border/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-xeflow-muted font-bold">
                          {row.no}
                        </td>
                        <td className="px-6 py-4 text-center text-xeflow-muted font-bold">
                          {formatTableDate(row.date)}
                        </td>
                        <td className="px-6 py-4 text-left text-xeflow-muted font-bold">
                          {row.refNo}
                        </td>
                        <td className="px-6 py-4 text-left font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${row.type === "Invoice" ? "bg-red-500/10 text-red-500 border-red-500/10" : "bg-green-500/10 text-green-500 border-green-500/10"}`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left font-bold text-xeflow-text">
                          {row.description}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-xeflow-text">
                          {row.debit > 0 ? formatMoney(row.debit) : ""}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-xeflow-brand">
                          {row.credit > 0 ? formatMoney(row.credit) : ""}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-xeflow-text">
                          {formatMoney(row.balance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-16 text-center text-xeflow-muted font-semibold"
                      >
                        No ledger transactions found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
                {customerLedgerRows.length > 0 && (
                  <tfoot>
                    <tr className="bg-xeflow-bg/30 text-sm font-black border-t border-b border-xeflow-border">
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-left uppercase tracking-wider text-xeflow-text"
                      >
                        TOTALS
                      </td>
                      <td className="px-6 py-4 text-right text-xeflow-text font-black">
                        {formatMoney(ledgerTotals.debit)}
                      </td>
                      <td className="px-6 py-4 text-right text-xeflow-brand font-black">
                        {formatMoney(ledgerTotals.credit)}
                      </td>
                      <td className="px-6 py-4 text-right text-xeflow-text font-black bg-xeflow-brand/5">
                        {formatMoney(ledgerTotals.balance)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg transition-colors duration-300">
              <span className="text-xs text-xeflow-muted font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, activeRows.length)} of{" "}
                {activeRows.length} entries
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

export default Ledger;
