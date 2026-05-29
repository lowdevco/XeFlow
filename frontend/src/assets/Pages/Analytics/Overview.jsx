import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../../js/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FiCalendar,
  FiFilter,
  FiChevronDown,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";

/* ──  SVG for Trend Arrows ── */


const TrendUp = () => (
  <svg
    className="w-3.5 h-3.5 shrink-0"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 10 5 5 8 8 13 2" />
    <polyline points="9 2 13 2 13 6" />
  </svg>
);

const TrendDown = () => (
  <svg
    className="w-3.5 h-3.5 shrink-0"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 4 5 9 8 6 13 12" />
    <polyline points="9 12 13 12 13 8" />
  </svg>
);
const getServiceColor = (name) => {
  const predefined = {
    "Consultation": "#3B82F6",
    "Design": "#EF4444",
    "Development": "#EAB308",
    "Marketing": "#22C55E",
    "Support": "#F97316",
    "Writing": "#A855F7",
    "SEO": "#06B6D4",
  };

  const normalized = name ? name.trim() : "Other";
  if (predefined[normalized]) {
    return predefined[normalized];
  }
  if (normalized === "Other") {
    return "#64748B";
  }

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = ["#3B82F6", "#EF4444", "#EAB308", "#22C55E", "#A855F7", "#F97316", "#06B6D4", "#EC4899"];
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
};

export default function Overview() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterType, setFilterType] = useState("fy");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleMonthRangeSelect = (year, monthNum) => {
    const start = new Date(year, monthNum, 1);
    const end = new Date(year, monthNum + 1, 0);
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
    setCustomStart(startStr);
    setCustomEnd(endStr);
    setFilterType("custom");
  };

  /* ── Click Outside Dropdown Handler ── */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Load Parallel Data ── */
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [invRes, custRes, servRes] = await Promise.all([
          fetchWithAuth("/invoices/", { method: "GET" }),
          fetchWithAuth("/customers/", { method: "GET" }),
          fetchWithAuth("/services/", { method: "GET" }),
        ]);

        if (invRes.ok) setInvoices(await invRes.json());
        if (custRes.ok) setCustomers(await custRes.json());
        if (servRes.ok) setServices(await servRes.json());
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  /*  Currency Formatting  */

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  /*  Date Ranges Solver  */

  const activeRange = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); 

    let start = new Date();
    let end = new Date();
    let label = "";

    switch (filterType) {
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
        // Indian Financial Year: April 1st to March 31st

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
          start = new Date(customStart);
          end = new Date(customEnd);
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

    // Ensure midnight limits for matching

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end, label };
  }, [filterType, customStart, customEnd]);

  /* ── Prior Period Ranges Solver ── */
  const priorRange = useMemo(() => {
    const { start, end } = activeRange;
    const durationMs = end.getTime() - start.getTime();

    const pEnd = new Date(start.getTime() - 1);
    const pStart = new Date(pEnd.getTime() - durationMs);

    return { start: pStart, end: pEnd };
  }, [activeRange]);

  /* ── Filtered Invoices Subsets ── */
  const activeInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const issue = new Date(inv.issue_date);
      return issue >= activeRange.start && issue <= activeRange.end;
    });
  }, [invoices, activeRange]);

  const priorInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const issue = new Date(inv.issue_date);
      return issue >= priorRange.start && issue <= priorRange.end;
    });
  }, [invoices, priorRange]);

  /* Calculations & Metrics Engine  */
  
  const metrics = useMemo(() => {
    const calc = (invList) => {
      let totalRev = 0;
      let collected = 0;
      let outstanding = 0;
      let nonDraftCount = 0;

      invList.forEach((inv) => {
        const total = parseFloat(inv.total_amount) || 0;
        const paid = parseFloat(inv.amount_paid) || 0;
        const bal = parseFloat(inv.balance_due) || 0;

        if (inv.status !== "Draft") {
          totalRev += total;
          outstanding += bal;
          nonDraftCount++;

          if (inv.status === "Paid") {
            collected += total;
          } else {
            collected += paid;
          }
        }
      });


      const avgInvoiceValue = nonDraftCount > 0 ? totalRev / nonDraftCount : 0;
      const collectionRate = totalRev > 0 ? (collected / totalRev) * 100 : 0;

      return {
        totalRevenue: totalRev,
        collectedRevenue: collected,
        outstandingRevenue: outstanding,
        averageInvoice: avgInvoiceValue,
        collectionRate,
        invoicesSent: nonDraftCount,
      };
    };


    const currentMetrics = calc(activeInvoices);
    const prevMetrics = calc(priorInvoices);

    const getTrend = (curr, prev) => {
      if (prev === 0) {
        if (curr === 0) return { val: "0.0%", up: true };
        return { val: "+100%", up: true };
      }
      const diff = curr - prev;
      const percent = (diff / prev) * 100;
      const fmt = percent.toFixed(1) + "%";
      return {
        val: percent >= 0 ? `+${fmt}` : fmt,
        up: percent >= 0,
      };
    };

    const trends = {
      totalRevenue: getTrend(
        currentMetrics.totalRevenue,
        prevMetrics.totalRevenue,
      ),
      collectedRevenue: getTrend(
        currentMetrics.collectedRevenue,
        prevMetrics.collectedRevenue,
      ),
      outstandingRevenue: getTrend(
        currentMetrics.outstandingRevenue,
        prevMetrics.outstandingRevenue,
      ),
      averageInvoice: getTrend(
        currentMetrics.averageInvoice,
        prevMetrics.averageInvoice,
      ),
      collectionRate: getTrend(
        currentMetrics.collectionRate,
        prevMetrics.collectionRate,
      ),
      invoicesSent: getTrend(
        currentMetrics.invoicesSent,
        prevMetrics.invoicesSent,
      ),
    };


    return { current: currentMetrics, trends };
  }, [activeInvoices, priorInvoices]);

  const areaChartData = useMemo(() => {
    const durationMs = activeRange.end.getTime() - activeRange.start.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    if (durationDays <= 31) {
      const results = [];
      const current = new Date(activeRange.start);
      const limit = new Date(activeRange.end);


      while (current <= limit) {
        results.push({
          name: current.getDate().toString(),
          dateLabel: current.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          year: current.getFullYear(),
          monthNum: current.getMonth(),
          dayNum: current.getDate(),
          revenue: 0,
          collected: 0,
        });
        current.setDate(current.getDate() + 1);
      }


      invoices.forEach((inv) => {
        if (inv.status !== "Draft" && inv.issue_date) {
          const issue = new Date(inv.issue_date);
          const match = results.find(
            (r) =>
              r.dayNum === issue.getDate() &&
              r.monthNum === issue.getMonth() &&
              r.year === issue.getFullYear()
          );
          if (match) {
            match.revenue += parseFloat(inv.total_amount) || 0;
            if (inv.status === "Paid") {
              match.collected += parseFloat(inv.total_amount) || 0;
            } else {
              match.collected += parseFloat(inv.amount_paid) || 0;
            }
          }
        }
      });


      return results;
    }

    const monthNames = [

      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",

    ];
    const results = [];

    const start = new Date(activeRange.start);
    const end = new Date(activeRange.end);

    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const limit = new Date(end.getFullYear(), end.getMonth() + 1, 1);

    while (current < limit) {
      results.push({
        name: monthNames[current.getMonth()],
        year: current.getFullYear(),
        monthNum: current.getMonth(),
        revenue: 0,
        collected: 0,
      });
      current.setMonth(current.getMonth() + 1);
    }

    if (results.length <= 2) {
      const results6 = [];
      const baseDate = new Date(activeRange.end);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
        results6.push({
          name: monthNames[d.getMonth()],
          year: d.getFullYear(),
          monthNum: d.getMonth(),
          revenue: 0,
          collected: 0,
        });
      }
      results.length = 0;
      results.push(...results6);
    }

    invoices.forEach((inv) => {
      if (inv.status !== "Draft" && inv.issue_date) {
        const issue = new Date(inv.issue_date);
        const match = results.find(
          (r) =>
            r.monthNum === issue.getMonth() && r.year === issue.getFullYear(),
        );
        if (match) {
          match.revenue += parseFloat(inv.total_amount) || 0;
          if (inv.status === "Paid") {
            match.collected += parseFloat(inv.total_amount) || 0;
          } else {
            match.collected += parseFloat(inv.amount_paid) || 0;
          }
        }
      }
    });

    return results;
  }, [invoices, activeRange]);

  const doughnutData = useMemo(() => {
    const statusCounts = { Paid: 0, Sent: 0, Draft: 0, Overdue: 0 };

    activeInvoices.forEach((inv) => {
      const status = inv.status;
      if (status in statusCounts) {
        statusCounts[status]++;
      } else if (status === "Partially Paid") {
        statusCounts["Sent"]++;
      }
    });

    const total = activeInvoices.length;
    const colors = {
      Paid: "#10b981",
      Sent: "#3b82f6",
      Draft: "#f59e0b",
      Overdue: "#ef4444",
    };

    return Object.keys(statusCounts).map((key) => {
      const count = statusCounts[key];
      const percent = total > 0 ? (count / total) * 100 : 0;
      return {
        name: key,
        value: count,
        percentage: percent.toFixed(1),
        color: colors[key],
      };
    });
  }, [activeInvoices]);

  const doughnutTotal = useMemo(() => {
    return activeInvoices.length;
  }, [activeInvoices]);

  const topServices = useMemo(() => {
    const serviceRevenues = {};

    activeInvoices.forEach((inv) => {
      if (inv.status !== "Draft" && inv.items) {
        inv.items.forEach((item) => {
          const name =
            item.description ||
            (item.service ? item.service.name : "Custom Consultation");
          const amt = parseFloat(item.amount) || 0;
          serviceRevenues[name] = (serviceRevenues[name] || 0) + amt;
        });
      }
    });

    const sorted = Object.keys(serviceRevenues)
      .map((name) => ({ name, revenue: serviceRevenues[name] }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const maxRev = sorted.length > 0 ? sorted[0].revenue : 1;
    return sorted.map((s) => ({
      ...s,
      percentage: (s.revenue / maxRev) * 100,
      color: getServiceColor(s.name),
    }));
  }, [activeInvoices]);

  const topCustomers = useMemo(() => {
    const customerAgg = {};

    activeInvoices.forEach((inv) => {
      if (inv.status !== "Draft" && inv.customer) {
        const company = inv.customer.company_name || "Independent Client";
        const rep = inv.customer.rep_name || "Unknown Representative";
        const rev = parseFloat(inv.total_amount) || 0;
        const outstanding = parseFloat(inv.balance_due) || 0;

        if (!customerAgg[company]) {
          customerAgg[company] = {
            company_name: company,
            rep_name: rep,
            revenue: 0,
            invoices: 0,
            outstanding: 0,
          };
        }

        customerAgg[company].revenue += rev;
        customerAgg[company].outstanding += outstanding;
        customerAgg[company].invoices += 1;
      }
    });

    return Object.values(customerAgg)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [activeInvoices]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-xeflow-bg h-full min-h-[500px]">
        <div className="w-10 h-10 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 bg-xeflow-bg font-sans">
      <div className="max-w-7xl mx-auto w-full">

      {/*  Title bar and Filter Controls  */}

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-xeflow-text tracking-tight flex items-center gap-2">
            Analytics Overview
          </h1>
          <p className="text-sm font-semibold text-xeflow-muted mt-1 uppercase tracking-wide">
            Real-time Insights into your business revenue
          </p>
        </div>

        {/* Filters Group */}

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">

          {/* Dropdown Selector */}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-xeflow-surface border border-xeflow-border text-xeflow-text shadow-sm hover:shadow-md hover:border-xeflow-brand transition-all cursor-pointer min-w-[210px]"
            >
              <span className="flex items-center gap-2">
                <FiCalendar className="text-xeflow-brand text-base shrink-0" />
                {activeRange.label}
              </span>
              <FiChevronDown
                className={`text-xeflow-muted transition-transform shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-xeflow-surface border border-xeflow-border shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
                <p className="text-[10px] font-black uppercase text-xeflow-muted tracking-wider px-3.5 py-1.5 border-b border-xeflow-border/40">
                  Select Period
                </p>
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    onClick={() => {
                      setFilterType("month");
                      setIsDropdownOpen(false);
                    }}
                    className={`text-left text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${filterType === "month" ? "bg-xeflow-brand text-white" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => {
                      setFilterType("last_month");
                      setIsDropdownOpen(false);
                    }}
                    className={`text-left text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${filterType === "last_month" ? "bg-xeflow-brand text-white" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => {
                      setFilterType("fy");
                      setIsDropdownOpen(false);
                    }}
                    className={`text-left text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${filterType === "fy" ? "bg-xeflow-brand text-white" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                  >
                    This Financial Year
                  </button>
                  <button
                    onClick={() => {
                      setFilterType("last_fy");
                      setIsDropdownOpen(false);
                    }}
                    className={`text-left text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${filterType === "last_fy" ? "bg-xeflow-brand text-white" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                  >
                    Last Financial Year
                  </button>
                  <button
                    onClick={() => {
                      setFilterType("custom");
                      setIsDropdownOpen(false);
                    }}
                    className={`text-left text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${filterType === "custom" ? "bg-xeflow-brand text-white" : "text-xeflow-text hover:bg-xeflow-brand/10"}`}
                  >
                    Custom Range
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Funnel Icon */}

          <button className="flex items-center justify-center w-11 h-11 rounded-xl bg-xeflow-surface border border-xeflow-border text-xeflow-text shadow-sm hover:shadow-md hover:border-xeflow-brand transition-all cursor-pointer">
            <FiFilter className="text-lg" />
          </button>
        </div>
      </div>

      {/*  Slide down Custom Dates Picker  */}

      {filterType === "custom" && (
        <div className="mb-8 p-5 bg-xeflow-surface border border-xeflow-border/80 rounded-2xl shadow-inner flex flex-wrap items-center gap-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase text-xeflow-muted tracking-wider">
              From Date
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
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
              className="px-4 py-2.5 border border-xeflow-border rounded-xl text-sm text-xeflow-text bg-xeflow-bg outline-none focus:border-xeflow-brand transition-colors cursor-pointer font-semibold shadow-sm"
            />
          </div>

          <div className="self-end pb-0.5">
            <p className="text-xs text-xeflow-muted italic font-medium leading-loose">
              *All charts and tables will dynamically restrict data within these
              exact boundaries.
            </p>
          </div>
        </div>
      )}

      {/*  6 Widgets Grid  */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">

        {/* Widget 1: Total Revenue */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Total Revenue
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {formatMoney(metrics.current.totalRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${metrics.trends.totalRevenue.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {metrics.trends.totalRevenue.up ? <TrendUp /> : <TrendDown />}
                {metrics.trends.totalRevenue.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>

        {/* Widget 2: Collected Revenue */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Collected Revenue
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {formatMoney(metrics.current.collectedRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${metrics.trends.collectedRevenue.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {metrics.trends.collectedRevenue.up ? (
                  <TrendUp />
                ) : (
                  <TrendDown />
                )}
                {metrics.trends.collectedRevenue.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>

        {/* Widget 3: Outstanding Revenue */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Outstanding Revenue
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {formatMoney(metrics.current.outstandingRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${!metrics.trends.outstandingRevenue.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {metrics.trends.outstandingRevenue.up ? (
                  <TrendDown className="text-rose-500" />
                ) : (
                  <TrendUp className="text-emerald-500" />
                )}
                {metrics.trends.outstandingRevenue.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>

        {/* Widget 4: Average Invoice Value */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Average Invoice Value
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {formatMoney(metrics.current.averageInvoice)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${metrics.trends.averageInvoice.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {metrics.trends.averageInvoice.up ? <TrendUp /> : <TrendDown />}
                {metrics.trends.averageInvoice.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>

        {/* Widget 5: Collection Rate */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Collection Rate
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {metrics.current.collectionRate.toFixed(2)}%
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${metrics.trends.collectionRate.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {metrics.trends.collectionRate.up ? <TrendUp /> : <TrendDown />}
                {metrics.trends.collectionRate.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>

        {/* Widget 6: Invoices Sent */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Invoices Sent
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {metrics.current.invoicesSent}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${metrics.trends.invoicesSent.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {metrics.trends.invoicesSent.up ? <TrendUp /> : <TrendDown />}
                {metrics.trends.invoicesSent.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Row: 2 Charts Grid ── */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

        {/* Chart 1: Revenue Trend (AreaChart) */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm xl:col-span-2 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-xeflow-text">
              Revenue Trend
            </h3>
            <p className="text-xs font-semibold text-xeflow-muted mt-1 uppercase tracking-wider">
              Issued Revenue and Collected Collections Over Time
            </p>
          </div>

          <div className="min-h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={areaChartData}
                onClick={(nextState) => {
                  if (nextState && nextState.activePayload && nextState.activePayload.length) {
                    const payload = nextState.activePayload[0].payload;
                    handleMonthRangeSelect(payload.year, payload.monthNum);
                  }
                }}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <defs>

                  {/* Revenue Gradient */}

                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1b4fd8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1b4fd8" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Collected Gradient */}

                  <linearGradient
                    id="collectedGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-xeflow-border, #e2e8f0)"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 700,
                    fill: "var(--color-xeflow-muted, #64748b)",
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 700,
                    fill: "var(--color-xeflow-muted, #64748b)",
                  }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-xeflow-surface border border-xeflow-border p-4 rounded-xl shadow-xl animate-in fade-in duration-200">
                          <p className="text-xs font-bold text-xeflow-muted mb-2 uppercase tracking-wide">
                            {payload[0].payload.dateLabel || `${label} ${payload[0].payload.year}`}
                          </p>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-4 justify-between">
                              <span className="text-xs font-bold text-xeflow-text flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#1b4fd8]" />
                                Revenue:
                              </span>
                              <span className="text-xs font-black text-xeflow-text">
                                {formatMoney(payload[0].value)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 justify-between">
                              <span className="text-xs font-bold text-xeflow-text flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                                Collected:
                              </span>
                              <span className="text-xs font-black text-emerald-500">
                                {formatMoney(payload[1].value)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1b4fd8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                  name="Revenue"
                />

                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#collectedGrad)"
                  name="Collected"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        
        {/* Chart 2: Invoice Status Doughnut */}

        
        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm xl:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-xeflow-text">
              Invoice Status
            </h3>
            <p className="text-xs font-semibold text-xeflow-muted mt-1 uppercase tracking-wider">
              Overall status distribution
            </p>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 my-5 relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={doughnutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {doughnutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            
            {/* Total Indicator in the center */}

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-5px]">
              <span className="text-3xl font-black text-xeflow-text">
                {doughnutTotal}
              </span>
              <span className="text-[9px] font-black uppercase text-xeflow-muted tracking-wider">
                Total Invoices
              </span>
            </div>
          </div>

          
          {/* Legends Table */}

          
          <div className="flex flex-col gap-2 bg-xeflow-bg/30 border border-xeflow-border/40 rounded-xl p-3">
            {doughnutData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-xeflow-text">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-xeflow-text">{item.value}</span>
                  <span className="text-xeflow-muted font-medium text-[10px]">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
            <div className="border-t border-xeflow-border/60 pt-2 mt-1.5 flex items-center justify-between text-xs font-black">
              <span className="text-xeflow-text">Total</span>
              <span className="text-xeflow-brand">{doughnutTotal}</span>
            </div>
          </div>
        </div>
      </div> 

      {/*  Bottom Row: Top Services  Top Customers Grid  */}


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Card: Top Services by Revenue */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-xeflow-text">
              Top Services by Revenue
            </h3>
            <p className="text-xs font-semibold text-xeflow-muted mt-1 uppercase tracking-wider">
              Highest-earning business offerings
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-5">
            {topServices.length > 0 ? (
              topServices.map((service, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 group">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-xeflow-text group-hover:text-xeflow-brand transition-colors flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                      {service.name}
                    </span>
                    <span className="text-xeflow-text">
                      {formatMoney(service.revenue)}
                    </span>
                  </div>


                  {/* Styled Progress Bar Track */}


                  <div className="w-full h-2.5 bg-xeflow-bg border border-xeflow-border/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full group-hover:opacity-90 transition-all duration-500 ease-out"
                      style={{ width: `${service.percentage}%`, backgroundColor: service.color }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-xeflow-muted font-medium">
                No service revenues found in this period.
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Top Customers by Revenue */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-5 border-b border-xeflow-border">
            <h3 className="text-lg font-bold text-xeflow-text">
              Top Customers by Revenue
            </h3>
            <p className="text-xs font-semibold text-xeflow-muted mt-1 uppercase tracking-wider">
              Top spending enterprise accounts
            </p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg/50 border-b border-xeflow-border text-[10px] font-black text-xeflow-muted uppercase tracking-wider">
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5 text-right">Revenue</th>
                  <th className="px-5 py-3.5 text-center">Invoices</th>
                  <th className="px-5 py-3.5 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-xeflow-border text-xs text-xeflow-text">
                {topCustomers.length > 0 ? (
                  topCustomers.map((cust, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-xeflow-brand/5 transition-colors"
                    >
                      {/* Customer Info */}
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-xeflow-brand to-indigo-500 shadow-sm shrink-0 uppercase">
                          {cust.company_name.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-xeflow-text">
                            {cust.company_name}
                          </p>
                          <p className="text-[10px] text-xeflow-muted mt-0.5">
                            {cust.rep_name}
                          </p>
                        </div>
                      </td>

                      {/* Revenue */}

                      <td className="px-5 py-3 text-right font-black text-xeflow-text">
                        {formatMoney(cust.revenue)}
                      </td>

                      {/* Invoice Count */}

                      <td className="px-5 py-3 text-center font-bold text-xeflow-text">
                        {cust.invoices}
                      </td>

                      {/* Outstanding */}

                      <td className="px-5 py-3 text-right font-bold">
                        {cust.outstanding > 0 ? (
                          <span className="text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg text-[10px] font-black inline-block">
                            {formatMoney(cust.outstanding)}
                          </span>
                        ) : (
                          <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[10px] font-black inline-block">
                            ₹0
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-12 text-center text-xeflow-muted font-medium"
                    >
                      No customer revenue records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
