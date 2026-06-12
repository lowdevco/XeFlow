import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import html2pdf from "html2pdf.js";

const fmt = (num) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num || 0);
};

const formatTableDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

// Helper function to format range label on the side
const getRangeLabel = (filterType, activeRange) => {
  if (!activeRange) return "ALL TIME";
  
  if (filterType === "fy" || filterType === "last_fy") {
    const startYear = activeRange.start.getFullYear();
    const endYear = activeRange.end.getFullYear();
    return `${startYear} - ${endYear}`;
  }
  
  if (filterType === "month" || filterType === "last_month") {
    return activeRange.label.toUpperCase(); // e.g. "JUNE 2026"
  }
  
  if (filterType === "custom") {
    const fmtDate = (d) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      return `${dd}/${mm}/${d.getFullYear()}`;
    };
    return `${fmtDate(activeRange.start)} - ${fmtDate(activeRange.end)}`;
  }
  
  return activeRange.label.toUpperCase();
};

// Component that renders the accounting ledger PDF view exactly like the reference PDF
export const StatementPDFView = ({ rows, totalDebit, totalCredit, totalBalance, rangeLabel }) => {
  return (
    <div className="w-[1060px] bg-white p-6 font-sans text-slate-800" id="statement-pdf-content">
      {/* Title Header Block - Solid Royal Blue Bar with sharp edges */}
      <div className="bg-[#1B4FD8] text-white py-4.5 px-6 flex justify-between items-center font-bold select-none mb-0 border border-[#1B4FD8]">
        <h1 className="text-2xl font-black uppercase tracking-widest">Statement</h1>
        <span className="text-sm font-black uppercase tracking-wider">{rangeLabel}</span>
      </div>

      {/* Ledger Table Section with sharp edges */}
      <div className="overflow-hidden border-x border-b border-slate-300 shadow-sm">
        <table className="w-full border-collapse text-[11px] text-slate-800">
          <thead>
            <tr className="bg-[#1a365d] text-white font-bold uppercase tracking-wider text-center">
              <th className="border border-slate-300 px-3 py-3 w-[6%]">No</th>
              <th className="border border-slate-300 px-3 py-3 w-[14%]">Date</th>
              <th className="border border-slate-300 px-4 py-3 text-left w-[38%]">Description</th>
              <th className="border border-slate-300 px-3 py-3 text-right w-[14%]">Invoiced Amount</th>
              <th className="border border-slate-300 px-3 py-3 text-right w-[14%]">Payments Received</th>
              <th className="border border-slate-300 px-3 py-3 text-right w-[14%] font-black">Running Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-300 even:bg-slate-50/50 hover:bg-slate-100/10 transition-colors">
                  <td className="border border-slate-200 px-3 py-3.5 text-center font-bold text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-200 px-3 py-3.5 text-center font-semibold text-slate-600">
                    {formatTableDate(row.date)}
                  </td>
                  <td className="border border-slate-200 px-4 py-3.5 text-left leading-normal">
                    {row.credit > 0 ? (
                      <div>
                        <div className="font-bold text-slate-800">
                          PAYMENT RECEIVED - {row.client?.toUpperCase()} - {row.invoiceNumber?.toUpperCase()}
                        </div>
                        {row.description && row.description !== "CASH RECEIVED" && (
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase">
                            {row.description}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-bold text-slate-700 leading-normal">
                        {row.description}
                      </div>
                    )}
                  </td>
                  <td className="border border-slate-200 px-3 py-3.5 text-right font-bold text-slate-950 whitespace-nowrap">
                    {row.debit > 0 ? fmt(row.debit) : "—"}
                  </td>
                  <td className="border border-slate-200 px-3 py-3.5 text-right font-bold text-green-600 whitespace-nowrap">
                    {row.credit > 0 ? fmt(row.credit) : "—"}
                  </td>
                  <td className="border border-slate-200 px-3 py-3.5 text-right font-black text-[#1b4fd8] whitespace-nowrap">
                    {fmt(row.balance)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border border-slate-300 px-4 py-8 text-center font-semibold text-slate-400 italic">
                  No accounting transaction records found for this period.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
              <td colSpan={3} className="border border-slate-300 px-4 py-3.5 text-center uppercase tracking-wider text-[#1b4fd8] font-bold">
                Totals
              </td>
              <td className="border border-slate-300 px-3 py-3.5 text-right text-slate-900 font-black whitespace-nowrap">
                {fmt(totalDebit)}
              </td>
              <td className="border border-slate-300 px-3 py-3.5 text-right text-green-600 font-black whitespace-nowrap">
                {fmt(totalCredit)}
              </td>
              <td className="border border-slate-300 px-3 py-3.5 text-right text-[#1b4fd8] font-black bg-blue-50/20 whitespace-nowrap">
                {fmt(totalBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export const generateStatementPDF = async (filteredRows, filterType, activeRange, toast) => {
  const toastId = toast.loading("Generating Statement PDF...");

  try {
    // 1. Sort oldest first (chronologically ascending) for the statement ledger
    const pdfRows = [...filteredRows].sort((a, b) => a.timestamp - b.timestamp);

    // 2. Recalculate running balance and totals for the selected list
    let running = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const rows = pdfRows.map((item) => {
      running += item.debit - item.credit;
      totalDebit += item.debit;
      totalCredit += item.credit;
      return {
        ...item,
        balance: running,
      };
    });

    // 3. Format the range label
    const rangeLabel = getRangeLabel(filterType, activeRange);

    // 4. Create temporary DOM container to mount React view
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    const root = createRoot(container);
    flushSync(() => {
      root.render(
        <StatementPDFView
          rows={rows}
          totalDebit={totalDebit}
          totalCredit={totalCredit}
          totalBalance={running}
          rangeLabel={rangeLabel}
        />
      );
    });

    // 5. Generate PDF using html2pdf
    const element = container.querySelector("#statement-pdf-content") || container;
    const options = {
      margin: [8, 8, 8, 8],
      filename: "Statement.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    await html2pdf().from(element).set(options).save();

    // 6. Cleanup
    document.body.removeChild(container);
    toast.success("Statement PDF downloaded successfully!", { id: toastId });
  } catch (error) {
    console.error("Statement PDF Generation failed:", error);
    toast.error("Failed to generate Statement PDF.", { id: toastId });
  }
};
