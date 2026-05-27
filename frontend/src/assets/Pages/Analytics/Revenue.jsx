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
  FiActivity,
  FiDollarSign,
  FiAward,
  FiRepeat,
  FiArrowRight,
} from "react-icons/fi";

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
    Consultation: "#3B82F6",
    Design: "#EF4444",
    Development: "#EAB308",
    Marketing: "#22C55E",
    Support: "#F97316",
    Writing: "#A855F7",
    SEO: "#06B6D4",
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

  const colors = [
    "#3B82F6",
    "#EF4444",
    "#EAB308",
    "#22C55E",
    "#A855F7",
    "#F97316",
    "#06B6D4",
    "#EC4899",
  ];
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
};

export default function Revenue() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterType, setFilterType] = useState("fy");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleMonthRangeSelect = (year, monthNum) => {
    const start = new Date(year, monthNum, 1);
    const end = new Date(year, monthNum + 1, 0);
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
    setCustomStart(startStr);
    setCustomEnd(endStr);
    setFilterType("custom");
  };

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

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end, label };
  }, [filterType, customStart, customEnd]);

  const priorRange = useMemo(() => {
    const { start, end } = activeRange;
    const durationMs = end.getTime() - start.getTime();
    const pEnd = new Date(start.getTime() - 1);
    const pStart = new Date(pEnd.getTime() - durationMs);
    return { start: pStart, end: pEnd };
  }, [activeRange]);

  const customerFirstInvoiceDate = useMemo(() => {
    const dates = {};
    invoices.forEach((inv) => {
      if (inv.status !== "Draft" && inv.customer) {
        const cId = inv.customer.id;
        const issue = new Date(inv.issue_date);
        if (!dates[cId] || issue < dates[cId]) {
          dates[cId] = issue;
        }
      }
    });
    return dates;
  }, [invoices]);

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

  const revenueMetrics = useMemo(() => {
    const calc = (invList, isPrior = false) => {
      let totalRev = 0;
      let collected = 0;
      let newBiz = 0;
      let repeatBiz = 0;
      let outstanding = 0;

      const boundaryDate = isPrior ? priorRange.start : activeRange.start;

      invList.forEach((inv) => {
        if (inv.status !== "Draft") {
          const total = parseFloat(inv.total_amount) || 0;
          const paid = parseFloat(inv.amount_paid) || 0;
          const bal = parseFloat(inv.balance_due) || 0;

          totalRev += total;
          outstanding += bal;

          if (inv.status === "Paid") {
            collected += total;
          } else {
            collected += paid;
          }

          if (inv.customer) {
            const firstDate = customerFirstInvoiceDate[inv.customer.id];
            if (firstDate && firstDate >= boundaryDate) {
              newBiz += total;
            } else {
              repeatBiz += total;
            }
          } else {
            repeatBiz += total;
          }
        }
      });

      return { totalRev, collected, newBiz, repeatBiz, outstanding };
    };

    const curr = calc(activeInvoices, false);
    const prev = calc(priorInvoices, true);

    const getTrend = (cVal, pVal) => {
      if (pVal === 0) {
        return cVal === 0
          ? { val: "0.0%", up: true }
          : { val: "+100%", up: true };
      }
      const diff = cVal - pVal;
      const percent = (diff / pVal) * 100;
      const fmt = Math.abs(percent).toFixed(1) + "%";
      return {
        val: percent >= 0 ? `+${fmt}` : `-${fmt}`,
        up: percent >= 0,
      };
    };

    return {
      current: curr,
      trends: {
        totalRev: getTrend(curr.totalRev, prev.totalRev),
        collected: getTrend(curr.collected, prev.collected),
        newBiz: getTrend(curr.newBiz, prev.newBiz),
        repeatBiz: getTrend(curr.repeatBiz, prev.repeatBiz),
        outstanding: getTrend(curr.outstanding, prev.outstanding),
      },
    };
  }, [
    activeInvoices,
    priorInvoices,
    customerFirstInvoiceDate,
    activeRange,
    priorRange,
  ]);

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
          dateLabel: current.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          year: current.getFullYear(),
          monthNum: current.getMonth(),
          dayNum: current.getDate(),
          revenue: 0,
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
              r.year === issue.getFullYear(),
          );
          if (match) {
            match.revenue += parseFloat(inv.total_amount) || 0;
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
        }
      }
    });

    return results;
  }, [invoices, activeRange]);

  const donutChartData = useMemo(() => {
    const serviceRevenues = {};
    let totalAmt = 0;

    activeInvoices.forEach((inv) => {
      if (inv.status !== "Draft" && inv.items) {
        inv.items.forEach((item) => {
          const name =
            item.description ||
            (item.service ? item.service.name : "Consultation");
          const amt = parseFloat(item.amount) || 0;
          serviceRevenues[name] = (serviceRevenues[name] || 0) + amt;
          totalAmt += amt;
        });
      }
    });

    const sorted = Object.keys(serviceRevenues)
      .map((name) => ({ name, revenue: serviceRevenues[name] }))
      .sort((a, b) => b.revenue - a.revenue);

    if (sorted.length > 5) {
      const top5 = sorted.slice(0, 5);
      const otherAmt = sorted.slice(5).reduce((sum, s) => sum + s.revenue, 0);
      top5.push({ name: "Other", revenue: otherAmt });
      return top5.map((s) => ({
        ...s,
        percentage:
          totalAmt > 0 ? ((s.revenue / totalAmt) * 100).toFixed(1) : "0.0",
        color: getServiceColor(s.name),
      }));
    }

    return sorted.map((s) => ({
      ...s,
      percentage:
        totalAmt > 0 ? ((s.revenue / totalAmt) * 100).toFixed(1) : "0.0",
      color: getServiceColor(s.name),
    }));
  }, [activeInvoices]);

  const monthlyComparisonData = useMemo(() => {
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

    const durationMs = activeRange.end.getTime() - activeRange.start.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    if (durationDays > 31) {
      const start = new Date(activeRange.start);
      const end = new Date(activeRange.end);
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const limit = new Date(end.getFullYear(), end.getMonth() + 1, 1);

      while (current < limit) {
        results.push({
          name: current.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          }),
          monthName: current.toLocaleDateString("en-IN", { month: "short" }),
          year: current.getFullYear(),
          monthNum: current.getMonth(),
          revenue: 0,
          collected: 0,
          outstanding: 0,
          growth: "0.0%",
          growthUp: true,
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      const baseDate = new Date(activeRange.end);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
        results.push({
          name: d.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          }),
          monthName: d.toLocaleDateString("en-IN", { month: "short" }),
          year: d.getFullYear(),
          monthNum: d.getMonth(),
          revenue: 0,
          collected: 0,
          outstanding: 0,
          growth: "0.0%",
          growthUp: true,
        });
      }
    }

    invoices.forEach((inv) => {
      if (inv.status !== "Draft" && inv.issue_date) {
        const issue = new Date(inv.issue_date);
        const match = results.find(
          (r) =>
            r.monthNum === issue.getMonth() && r.year === issue.getFullYear(),
        );
        if (match) {
          const total = parseFloat(inv.total_amount) || 0;
          const paid = parseFloat(inv.amount_paid) || 0;
          const bal = parseFloat(inv.balance_due) || 0;

          match.revenue += total;
          match.outstanding += bal;
          if (inv.status === "Paid") {
            match.collected += total;
          } else {
            match.collected += paid;
          }
        }
      }
    });

    for (let i = 0; i < results.length; i++) {
      if (i > 0) {
        const prevMonth = results[i - 1];
        const currMonth = results[i];
        if (prevMonth.revenue > 0) {
          const diff = currMonth.revenue - prevMonth.revenue;
          const pct = (diff / prevMonth.revenue) * 100;
          currMonth.growth = Math.abs(pct).toFixed(1) + "%";
          currMonth.growthUp = pct >= 0;
        } else {
          currMonth.growth = currMonth.revenue > 0 ? "100%" : "0.0%";
          currMonth.growthUp = true;
        }
      } else {
        results[i].growth = "—";
        results[i].growthUp = true;
      }
    }

    return [...results].reverse();
  }, [invoices, activeRange]);

  const topService = useMemo(() => {
    return donutChartData.length > 0 ? donutChartData[0].name : "N/A";
  }, [donutChartData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-xeflow-bg h-full min-h-[500px]">
        <div className="w-10 h-10 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 bg-xeflow-bg font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-xeflow-text tracking-tight flex items-center gap-2">
            Revenue Analytics
          </h1>
          <p className="text-sm font-semibold text-xeflow-muted mt-1 uppercase tracking-wide">
            Track and analyze your revenue
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
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

          <button className="flex items-center justify-center w-11 h-11 rounded-xl bg-xeflow-surface border border-xeflow-border text-xeflow-text shadow-sm hover:shadow-md hover:border-xeflow-brand transition-all cursor-pointer">
            <FiFilter className="text-lg" />
          </button>
        </div>
      </div>

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
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Total Revenue
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {formatMoney(revenueMetrics.current.totalRev)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${revenueMetrics.trends.totalRev.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {revenueMetrics.trends.totalRev.up ? (
                  <TrendUp />
                ) : (
                  <TrendDown />
                )}
                {revenueMetrics.trends.totalRev.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Collected Revenue
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {formatMoney(revenueMetrics.current.collected)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${revenueMetrics.trends.collected.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {revenueMetrics.trends.collected.up ? (
                  <TrendUp />
                ) : (
                  <TrendDown />
                )}
                {revenueMetrics.trends.collected.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            New Business Revenue
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {formatMoney(revenueMetrics.current.newBiz)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${revenueMetrics.trends.newBiz.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {revenueMetrics.trends.newBiz.up ? <TrendUp /> : <TrendDown />}
                {revenueMetrics.trends.newBiz.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] text-xeflow-muted font-black uppercase tracking-[0.1em] mb-3">
            Repeat Business Revenue
          </p>
          <div>
            <h3 className="text-2xl font-black text-xeflow-text leading-tight">
              {formatMoney(revenueMetrics.current.repeatBiz)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${revenueMetrics.trends.repeatBiz.up ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
              >
                {revenueMetrics.trends.repeatBiz.up ? (
                  <TrendUp />
                ) : (
                  <TrendDown />
                )}
                {revenueMetrics.trends.repeatBiz.val}
              </span>
              <span className="text-[10px] text-xeflow-muted font-semibold truncate">
                vs last period
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm xl:col-span-2 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-xeflow-text">
              Revenue Over Time
            </h3>
          </div>

          <div className="min-h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={areaChartData}
                onClick={(nextState) => {
                  if (
                    nextState &&
                    nextState.activePayload &&
                    nextState.activePayload.length
                  ) {
                    const payload = nextState.activePayload[0].payload;
                    handleMonthRangeSelect(payload.year, payload.monthNum);
                  }
                }}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="revChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1b4fd8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1b4fd8" stopOpacity={0.0} />
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
                            {payload[0].payload.dateLabel ||
                              `${label} ${payload[0].payload.year}`}
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
                  fill="url(#revChartGrad)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm xl:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-xeflow-text">
              Revenue by Service
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 my-5 relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={donutChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="revenue"
                >
                  {donutChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-5px]">
              <span className="text-2xl font-black text-xeflow-text">
                Total
              </span>
              <span className="text-[10px] font-black text-xeflow-brand truncate max-w-[120px]">
                {formatMoney(revenueMetrics.current.totalRev)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-xeflow-bg/30 border border-xeflow-border/40 rounded-xl p-3">
            {donutChartData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-xeflow-text truncate max-w-[130px]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold shrink-0">
                  <span className="text-xeflow-muted font-medium text-[10px]">
                    {item.percentage}%
                  </span>
                  <span className="text-xeflow-text">
                    ({formatMoney(item.revenue)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm xl:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 pb-5 border-b border-xeflow-border">
            <h3 className="text-lg font-bold text-xeflow-text">
              Monthly Revenue Comparison
            </h3>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg/50 border-b border-xeflow-border text-[10px] font-black text-xeflow-muted uppercase tracking-wider">
                  <th className="px-5 py-3.5">Month</th>
                  <th className="px-5 py-3.5 text-right">Revenue</th>
                  <th className="px-5 py-3.5 text-right">Collected</th>
                  <th className="px-5 py-3.5 text-right">Outstanding</th>
                  <th className="px-5 py-3.5 text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-xeflow-border text-xs text-xeflow-text">
                {monthlyComparisonData.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() =>
                      handleMonthRangeSelect(item.year, item.monthNum)
                    }
                    className="hover:bg-xeflow-brand/5 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-bold text-xeflow-brand">
                      {item.name}
                    </td>
                    <td className="px-5 py-3 text-right font-black text-xeflow-text">
                      {formatMoney(item.revenue)}
                    </td>
                    <td className="px-5 py-3 text-right text-xeflow-text">
                      {formatMoney(item.collected)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {item.outstanding > 0 ? (
                        <span className="text-rose-500 font-bold">
                          {formatMoney(item.outstanding)}
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-bold">₹0</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-bold">
                      {item.growth === "—" ? (
                        <span className="text-xeflow-muted">—</span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black border ${item.growthUp ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}
                        >
                          {item.growthUp ? <TrendUp /> : <TrendDown />}
                          {item.growth}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm xl:col-span-1 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-lg font-bold text-xeflow-text mb-4">
              Revenue Insights
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 p-3 bg-emerald-500/6 border border-emerald-500/10 rounded-xl">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500 text-sm font-bold">
                  <FiTrendingUp />
                </span>
                <div>
                  <p className="text-xs font-bold text-xeflow-text leading-snug">
                    Revenue is{" "}
                    {revenueMetrics.trends.totalRev.up ? "up" : "down"} by{" "}
                    {revenueMetrics.trends.totalRev.val.replace(/[+-]/g, "")}{" "}
                    compared to last month.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-500/6 border border-blue-500/10 rounded-xl">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500 text-sm font-bold">
                  <FiAward />
                </span>
                <div>
                  <p className="text-xs font-bold text-xeflow-text leading-snug">
                    {topService} is your top revenue generating service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-500/6 border border-amber-500/10 rounded-xl">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500 text-sm font-bold">
                  <FiActivity />
                </span>
                <div>
                  <p className="text-xs font-bold text-xeflow-text leading-snug">
                    Outstanding revenue{" "}
                    {revenueMetrics.trends.outstanding.up
                      ? "increased"
                      : "decreased"}{" "}
                    by{" "}
                    {revenueMetrics.trends.outstanding.val.replace(/[+-]/g, "")}{" "}
                    this month.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-xeflow-border/40 mt-4">
            <Link
              to="/invoice/view"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black text-xeflow-brand bg-xeflow-brand/6 border border-xeflow-brand/10 hover:bg-xeflow-brand/10 hover:border-xeflow-brand/20 transition-all cursor-pointer"
            >
              View Detailed Report <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
