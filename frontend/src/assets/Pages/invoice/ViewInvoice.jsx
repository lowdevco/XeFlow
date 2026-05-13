import { useState, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiPlus,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { Link } from "react-router-dom";

/* ── Dummy Data ──────────────────────────────────────────────────────────── */
const INVOICES = [
  {
    id: "INV-2024-001",
    client: "Acme Corporation",
    email: "billing@acme.com",
    date: "2024-03-01",
    amount: 2500.0,
    status: "Paid",
  },
  {
    id: "INV-2024-002",
    client: "Globex Inc.",
    email: "accounts@globex.com",
    date: "2024-03-05",
    amount: 3200.5,
    status: "Pending",
  },
  {
    id: "INV-2024-003",
    client: "Initech",
    email: "finance@initech.com",
    date: "2024-02-15",
    amount: 1500.0,
    status: "Overdue",
  },
  {
    id: "INV-2024-004",
    client: "Soylent Corp",
    email: "hello@soylent.com",
    date: "2024-03-10",
    amount: 850.0,
    status: "Draft",
  },
  {
    id: "INV-2024-005",
    client: "Umbrella Corp",
    email: "admin@umbrella.com",
    date: "2024-03-12",
    amount: 4100.0,
    status: "Pending",
  },
  {
    id: "INV-2024-006",
    client: "Massive Dynamic",
    email: "pay@massive.com",
    date: "2024-03-14",
    amount: 920.0,
    status: "Paid",
  },
  {
    id: "INV-2024-007",
    client: "Stark Industries",
    email: "billing@stark.com",
    date: "2024-03-18",
    amount: 12500.0,
    status: "Paid",
  },
  {
    id: "INV-2024-008",
    client: "Wayne Enterprises",
    email: "accounts@wayne.com",
    date: "2024-03-20",
    amount: 8400.0,
    status: "Pending",
  },
  {
    id: "INV-2024-009",
    client: "Cyberdyne",
    email: "finance@cyberdyne.com",
    date: "2024-01-10",
    amount: 450.0,
    status: "Overdue",
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const getStatusBadge = (status) => {
  const styles = {
    Paid: "bg-green-500/10 text-green-500 border-green-500/20",
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Overdue: "bg-red-500/10 text-red-500 border-red-500/20",
    Draft: "bg-xeflow-muted/10 text-xeflow-text border-xeflow-border",
  };
  return styles[status] || styles.Draft;
};

/* ── Component ───────────────────────────────────────────────────────────── */
const ViewInvoice = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Search Filter
  const filteredData = useMemo(() => {
    return INVOICES.filter(
      (inv) =>
        inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  // 2. Sort Logic
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

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
      return <FiChevronDown className="opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <FiChevronUp className="text-xeflow-brand" />
    ) : (
      <FiChevronDown className="text-xeflow-brand" />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text">Invoices</h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Manage and track your generated invoices.
            </p>
          </div>
          <Link to="/invoices/new">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-xeflow-brand text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors shadow-sm">
              <FiPlus size={16} /> New Invoice
            </button>
          </Link>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-xeflow-surface p-4 rounded-xl border border-xeflow-border shadow-sm transition-colors duration-300">
          <div className="relative w-full sm:w-96">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xeflow-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by client or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-xeflow-bg border border-xeflow-border rounded-lg text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all duration-200"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-xeflow-border text-xeflow-text text-sm font-semibold rounded-lg hover:bg-xeflow-brand/5 transition-colors w-full sm:w-auto justify-center">
            <FiFilter size={16} /> Filters
          </button>
        </div>

        {/* ── Data Table ── */}
        <div className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-xeflow-bg border-b border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider transition-colors duration-300">
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center gap-1">
                      Invoice ID <SortIcon columnKey="id" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("client")}
                  >
                    <div className="flex items-center gap-1">
                      Client <SortIcon columnKey="client" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date <SortIcon columnKey="date" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer group"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Amount <SortIcon columnKey="amount" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-center cursor-pointer group"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Status <SortIcon columnKey="status" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-xeflow-border text-sm text-xeflow-text transition-colors duration-300">
                {paginatedData.length > 0 ? (
                  paginatedData.map((invoice, index) => (
                    <tr
                      key={index}
                      className="hover:bg-xeflow-brand/5 transition-colors group"
                    >
                      <td className="px-6 py-4 font-semibold text-xeflow-text">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-xeflow-text">
                          {invoice.client}
                        </p>
                        <p className="text-xs text-xeflow-muted mt-0.5">
                          {invoice.email}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xeflow-muted font-medium">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-xeflow-text">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold border rounded-full ${getStatusBadge(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3 text-xeflow-muted opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="hover:text-xeflow-brand transition-colors">
                            <FiDownload size={16} />
                          </button>
                          <button className="hover:text-xeflow-brand transition-colors">
                            <FiEdit size={16} />
                          </button>
                          <button className="hover:text-red-500 transition-colors">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        <button className="md:hidden text-xeflow-muted hover:text-xeflow-text">
                          <FiMoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-xeflow-muted font-medium"
                    >
                      No invoices found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-xeflow-border bg-xeflow-bg transition-colors duration-300">
            <span className="text-xs text-xeflow-muted font-medium">
              Showing{" "}
              {sortedData.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{" "}
              to {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
              {sortedData.length} entries
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border border-xeflow-border rounded-md text-xs font-semibold text-xeflow-muted hover:bg-xeflow-brand/10 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${currentPage === i + 1 ? "bg-xeflow-brand text-white shadow-sm shadow-xeflow-brand/20" : "border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/10"}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border border-xeflow-border rounded-md text-xs font-semibold text-xeflow-text hover:bg-xeflow-brand/10 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;
