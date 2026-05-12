/**
 * Dashboard.jsx — Xeventure brand, DataTables edition
 *
 * ── DATATABLES SETUP ───────────────────────────────────────────────────────
 *  1. Install:
 *       npm install datatables.net-react datatables.net-dt
 *
 *  2. DO NOT import 'datatables.net-dt/css/dataTables.dataTables.css'
 *     Your index.css already contains a full custom override.
 *
 *  3. In your app entry (main.jsx / App.jsx) add:
 *       import './index.css'
 *     Make sure index.css is imported BEFORE this component renders.
 * ──────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import StatWidget from "./StatWidget";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";

// Wire DataTables core to the React wrapper — call once at module level
DataTable.use(DT);

/* ── Data ─────────────────────────────────────────────────────────────── */
const INVOICES = [
  {
    id: "INV-2024-001",
    client: "TechNova Solutions",
    amount: "₹ 45,000",
    status: "Paid",
    date: "Oct 24, 2024",
  },
  {
    id: "INV-2024-002",
    client: "Alpha Industries",
    amount: "₹ 12,500",
    status: "Pending",
    date: "Oct 22, 2024",
  },
  {
    id: "INV-2024-003",
    client: "Global Logistics",
    amount: "₹ 89,000",
    status: "Overdue",
    date: "Oct 15, 2024",
  },
  {
    id: "INV-2024-004",
    client: "Nexus Retail",
    amount: "₹ 34,200",
    status: "Paid",
    date: "Oct 10, 2024",
  },
  {
    id: "INV-2024-020",
    client: "Nexus Retail",
    amount: "₹ 34,200",
    status: "Paid",
    date: "Oct 10, 2024",
  },
  {
    id: "INV-2024-021",
    client: "Vertex Corp",
    amount: "₹ 22,800",
    status: "Pending",
    date: "Oct 08, 2024",
  },
  {
    id: "INV-2024-022",
    client: "Synapse Labs",
    amount: "₹ 67,500",
    status: "Paid",
    date: "Oct 05, 2024",
  },
  {
    id: "INV-2024-023",
    client: "Orion Dynamics",
    amount: "₹ 18,900",
    status: "Overdue",
    date: "Oct 03, 2024",
  },
  {
    id: "INV-2024-024",
    client: "Pinnacle Traders",
    amount: "₹ 55,000",
    status: "Paid",
    date: "Oct 01, 2024",
  },
];

/* ── Column definitions ───────────────────────────────────────────────── */
const COLUMNS = [
  {
    title: "Invoice ID",
    data: "id",
    render: (data) =>
      `<span style="color:var(--color-xeflow-brand);font-weight:700;font-size:0.8125rem;letter-spacing:-0.01em">${data}</span>`,
  },
  {
    title: "Client",
    data: "client",
    render: (data) =>
      `<span style="color:var(--color-xeflow-text);font-weight:500">${data}</span>`,
  },
  {
    title: "Amount",
    data: "amount",
    render: (data) =>
      `<span style="color:var(--color-xeflow-text);font-weight:700">${data}</span>`,
  },
  {
    title: "Date",
    data: "date",
    render: (data) =>
      `<span style="color:var(--color-xeflow-muted);font-size:0.8125rem">${data}</span>`,
  },
  {
    title: "Status",
    data: "status",
    render: (data) => {
      const cls = {
        Paid: "dt-badge-paid",
        Pending: "dt-badge-pending",
        Overdue: "dt-badge-overdue",
      };
      return `<span class="dt-status-badge ${cls[data]}">${data}</span>`;
    },
  },
];

/* ── DataTable options ────────────────────────────────────────────────── */
const DT_OPTIONS = {
  paging: true,
  pageLength: 5,
  lengthMenu: [5, 10, 25],
  searching: true,
  ordering: true,
  info: true,
  // Custom DOM: length control | search input | table | info | pagination
  dom: '<"dt-top-bar"lf>t<"dt-bottom-bar"ip>',
};

/* ── Component ───────────────────────────────────────────────────────── */
export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold text-xeflow-muted uppercase tracking-widest mb-1">
            Overview
          </p>
          <h1 className="text-2xl font-bold text-xeflow-text tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* Quick-action pill */}
        <button
          className="
            flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
            bg-xeflow-brand text-white
            shadow-md shadow-xeflow-brand/20
            hover:bg-xeflow-brand-alt
            active:scale-[0.97]
            transition-all duration-200
          "
        >
          <span className="text-base leading-none">＋</span>
          New Invoice
        </button>
      </div>

      {/* ── Stat Widgets ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatWidget
          icon="💰"
          title="Total Revenue"
          amount="₹ 8,45,230"
          trend="12.5%"
          trendUp={true}
        />
        <StatWidget
          icon="📑"
          title="Pending Invoices"
          amount="14"
          trend="2.1%"
          trendUp={false}
        />
        <StatWidget
          icon="📈"
          title="GST Collected"
          amount="₹ 1,52,141"
          trend="8.4%"
          trendUp={true}
        />
      </div>

      {/* ── Main grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart panel */}
        <div
          className="
            bg-xeflow-surface border border-xeflow-border
            rounded-2xl p-6 shadow-sm lg:col-span-1
            flex flex-col
          "
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-xeflow-text">
                Revenue Overview
              </h3>
              <p className="text-xs text-xeflow-muted mt-0.5">
                Oct 2024 · Monthly
              </p>
            </div>
            <span
              className="
                text-[10px] font-bold uppercase tracking-widest px-2.5 py-1
                rounded-md border
                bg-xeflow-success/10 text-xeflow-success border-xeflow-success/20
              "
            >
              +12.5%
            </span>
          </div>

          {/* Chart placeholder — swap with <AreaChart> or <Bar> from recharts */}
          <div
            className="
              flex-1 min-h-[220px] rounded-xl
              border-2 border-dashed border-xeflow-border
              bg-xeflow-surface2/60
              flex flex-col items-center justify-center gap-2
            "
          >
            <span className="text-3xl opacity-30 grayscale">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                />
              </svg>
            </span>
            <p className="text-xs text-xeflow-muted font-medium">
              Recharts / Chart.js slot
            </p>
          </div>
        </div>

        {/* DataTable panel */}
        <div
          className="
            bg-xeflow-surface border border-xeflow-border
            rounded-2xl shadow-sm lg:col-span-2
            overflow-hidden flex flex-col
          "
        >
          {/* Panel header */}
          <div className="px-6 pt-5 pb-4 border-b border-xeflow-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-xeflow-text">
                Recent Invoices
              </h3>
              <p className="text-xs text-xeflow-muted mt-0.5">
                Last 30 days activity
              </p>
            </div>
            <button
              className="
                text-sm font-semibold text-xeflow-brand
                px-4 py-1.5 rounded-lg
                border border-xeflow-brand/30
                hover:bg-xeflow-brand hover:text-white
                active:scale-95
                transition-all duration-200
              "
            >
              View All
            </button>
          </div>

          {/*
            DataTable — the CSS for search, pagination, badges etc.
            is entirely in index.css (no default DT stylesheet needed).
          */}
          <div className="overflow-x-auto p-5">
            <DataTable
              className="xeflow-datatable"
              data={INVOICES}
              columns={COLUMNS}
              options={DT_OPTIONS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
