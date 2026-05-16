import  { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../js/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiPlus,
  FiBarChart2,
  FiActivity,
  FiFileText,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";

/* ── Trend arrow icons ── */

const TrendUp = () => (
  <svg
    width="12"
    height="12"
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
    width="12"
    height="12"
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

/* ── Sparkline ── */

const UP_POINTS = [0.7, 0.5, 0.65, 0.4, 0.55, 0.3, 0.2, 0.1];
const DOWN_POINTS = [0.1, 0.3, 0.15, 0.4, 0.25, 0.5, 0.35, 0.6];

function Sparkline({ trendUp, data, color }) {
  const pts = data ?? (trendUp ? UP_POINTS : DOWN_POINTS);
  const W = 68,
    H = 28,
    PAD = 2;
  const xStep = (W - PAD * 2) / (pts.length - 1);

  const points = pts
    .map((v, i) => `${PAD + i * xStep},${PAD + v * (H - PAD * 2)}`)
    .join(" ");
  const last = pts.length - 1;
  const area =
    `M ${PAD},${H} ` +
    pts
      .map((v, i) => `L ${PAD + i * xStep},${PAD + v * (H - PAD * 2)}`)
      .join(" ") +
    ` L ${PAD + last * xStep},${H} Z`;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient
          id={`sg-${trendUp ? "u" : "d"}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${trendUp ? "u" : "d"})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={PAD + last * xStep}
        cy={PAD + pts[last] * (H - PAD * 2)}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

/* ── Enlarged StatWidget ── */

function StatWidget({
  icon,
  title,
  amount,
  trend,
  trendUp = true,
  sparkData,
  showChart = false,
}) {
  const upColor = "#1b4fd8";
  const downColor = "#DC2626";
  const trendColor = trendUp ? upColor : downColor;

  return (
    <div className="relative bg-xeflow-surface border border-xeflow-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl opacity-80"
        style={{
          background: `linear-gradient(90deg, ${trendColor}, transparent)`,
        }}
      />
      <div className="p-5 pt-6 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl border border-xeflow-border/60 shadow-inner"
            style={{
              background: `color-mix(in srgb, ${trendColor} 12%, var(--color-xeflow-bg))`,
              color: trendColor,
            }}
          >
            {icon}
          </div>
          {showChart && (
            <Sparkline trendUp={trendUp} data={sparkData} color={trendColor} />
          )}
        </div>

        <div>
          <p className="text-[11px] text-xeflow-muted font-bold uppercase tracking-[0.08em] mb-1.5 truncate">
            {title}
          </p>
          <div className="flex items-end justify-between gap-2">
            <h3 className="text-2xl xl:text-3xl font-black text-xeflow-text leading-none tracking-tight truncate">
              {amount}
            </h3>
            {trend && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border border-transparent"
                style={{
                  color: trendColor,
                  background: `color-mix(in srgb, ${trendColor} 12%, transparent)`,
                }}
              >
                {trendUp ? <TrendUp /> : <TrendDown />}
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard Component ── */

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  useEffect(() => {
    const fetchDashboardData = async () => {
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
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Format Currency
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };
  const stats = useMemo(() => {
    let totalRev = 0;
    let gstCollected = 0;
    let sentCount = 0;

    invoices.forEach((inv) => {
      if (inv.status === "Paid" || inv.status === "Sent") {
        totalRev += parseFloat(inv.total_amount) || 0;
        gstCollected +=
          (parseFloat(inv.cgst_amount) || 0) +
          (parseFloat(inv.sgst_amount) || 0);
        sentCount++;
      }
    });

    return {
      revenue: totalRev,
      gst: gstCollected,
      invoicesSent: sentCount,
      customers: customers.length,
      services: services.length,
    };
  }, [invoices, customers, services]);

  // Dynamic Data Engine Years

  const chartData = useMemo(() => {
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

    let monthlyData = monthNames.map((month) => ({ name: month, revenue: 0 }));

    invoices.forEach((inv) => {
      if (inv.status !== "Draft" && inv.issue_date) {
        const date = new Date(inv.issue_date);
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].revenue += parseFloat(inv.total_amount) || 0;
      }
    });

    return monthlyData;
  }, [invoices]);



  const sortedInvoices = useMemo(() => {
    let sortable = [...invoices];
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
  }, [invoices, sortConfig]);

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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-xeflow-bg h-full">
        <div className="w-8 h-8 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg">
      {/* ── Page header ── */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold text-xeflow-muted uppercase tracking-widest mb-1">
            Overview
          </p>
          <h1 className="text-2xl font-bold text-xeflow-text tracking-tight">
            Dashboard
          </h1>
        </div>
        <Link to="/invoice/new">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-xeflow-brand text-white shadow-md shadow-xeflow-brand/20 hover:opacity-90 transition-all duration-200">
            <FiPlus size={18} /> New Invoice
          </button>
        </Link>
      </div>

      {/* ── Dynamic Stat Widgets Grid ── */}
  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        <StatWidget
          icon={<FiBarChart2 />}
          title="Total Revenue"
          amount={formatMoney(stats.revenue)}
          trend="Up"
          trendUp={true}
          showChart={true}
        />
        <StatWidget
          icon={<FiActivity />}
          title="GST Collected"
          amount={formatMoney(stats.gst)}
          trend="Tax"
          trendUp={true}
          showChart={true}
        />
        <StatWidget
          icon={<FiFileText />}
          title="Invoices Sent"
          amount={stats.invoicesSent.toString()}
          showChart={false}
        />
        <StatWidget
          icon={<FiUsers />}
          title="Customers"
          amount={stats.customers.toString()}
          showChart={false}
        />
        <StatWidget
          icon={<FiBriefcase />}
          title="Services"
          amount={stats.services.toString()}
          showChart={false}
        />
      </div>

      {/* ── Main grid ── */}
  
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recharts Panel */}
  
        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl p-6 shadow-sm xl:col-span-1 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-xeflow-text">
                Revenue Overview
              </h3>
              <p className="text-sm text-xeflow-muted mt-1">
                Financial Year Activity
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-xeflow-brand, #06b6d4)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-xeflow-brand, #06b6d4)"
                      stopOpacity={0}
                    />
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
                    fontSize: 13,
                    fill: "var(--color-xeflow-muted, #64748b)",
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 13,
                    fill: "var(--color-xeflow-muted, #64748b)",
                  }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-xeflow-surface, #ffffff)",
                    borderColor: "var(--color-xeflow-border, #e2e8f0)",
                    borderRadius: "10px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{
                    color: "var(--color-xeflow-text, #0f172a)",
                    fontWeight: "bold",
                  }}
                  formatter={(value) => formatMoney(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-xeflow-brand, #06b6d4)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Custom DataTable Panel */}
        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm xl:col-span-2 overflow-hidden flex flex-col">
          <div className="px-6 pt-6 pb-5 border-b border-xeflow-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-xeflow-text">
                Recent Invoices
              </h3>
              <p className="text-sm text-xeflow-muted mt-1">
                Latest generated records
              </p>
            </div>
            <Link to="/invoice/view">
              <button className="text-sm font-semibold text-xeflow-brand px-4 py-2 rounded-lg border border-xeflow-brand/30 hover:bg-xeflow-brand hover:text-white transition-all">
                View All
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-xeflow-bg/50 border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider select-none">
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("invoice_number")}
                  >
                    Invoice #
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("customer")}
                  >
                    Client
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("issue_date")}
                  >
                    Date
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("total_amount")}
                  >
                    Total
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text">
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-xeflow-brand/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-xeflow-text">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold">
                          {invoice.customer?.company_name || "Unknown Client"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xeflow-muted font-medium">
                        {new Date(invoice.issue_date).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-xeflow-text">
                        {formatMoney(invoice.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-md text-xs uppercase font-bold border ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-xeflow-muted"
                    >
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination */}
  
          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-5 border-t border-xeflow-border bg-xeflow-bg">
              <span className="text-sm text-xeflow-muted font-medium">
                Showing{" "}
                {sortedInvoices.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, sortedInvoices.length)}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 border border-xeflow-border rounded-lg text-sm font-semibold hover:bg-xeflow-brand/10 disabled:opacity-50 text-xeflow-text transition-colors"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 border border-xeflow-border rounded-lg text-sm font-semibold hover:bg-xeflow-brand/10 disabled:opacity-50 text-xeflow-text transition-colors"
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
}