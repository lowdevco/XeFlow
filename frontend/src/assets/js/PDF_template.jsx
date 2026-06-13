import BG from "../image/invoice-template.png";
import { COMPANY } from "../info/company.js";
import { BANK } from "../info/bank.js";
import { fmtMonthName } from "../info/formatter";
import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function parseSafeDate(d) {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d === "string") {
    if (d.includes("/")) {
      const parts = d.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
    }

    if (d.includes("-")) {
      const parts = d.split("T")[0].split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function fmtDDMMYYYY(d) {
  const dt = parseSafeDate(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

function getInvoiceMonthAndYear(invoice) {
  const dateStr =
    invoice.issue_date || invoice.invoice_date || invoice.invoiceDate;
  const dateObj = parseSafeDate(dateStr);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return {
    monthName,
    year,
    monthYear: `${monthName} ${year}`,
  };
}

const _ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const _TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function _below100(n) {
  if (n < 20) return _ONES[n];
  return _TENS[Math.floor(n / 10)] + (n % 10 ? " " + _ONES[n % 10] : "");
}

function _below1000(n) {
  if (n < 100) return _below100(n);
  return (
    _ONES[Math.floor(n / 100)] +
    " Hundred" +
    (n % 100 ? " " + _below100(n % 100) : "")
  );
}

function _numWords(n) {
  if (n === 0) return "Zero";
  let w = "";
  if (n >= 10000000) {
    w += _below1000(Math.floor(n / 10000000)) + " Crore ";
    n %= 10000000;
  }
  if (n >= 100000) {
    w += _below100(Math.floor(n / 100000)) + " Lakh ";
    n %= 100000;
  }
  if (n >= 1000) {
    w += _below100(Math.floor(n / 1000)) + " Thousand ";
    n %= 1000;
  }
  if (n > 0) {
    w += _below1000(n);
  }
  return w.trim();
}

export function amountToWords(amount) {
  const num = parseFloat(amount) || 0;
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let w = "Rupees " + (rupees > 0 ? _numWords(rupees) : "Zero");
  if (paise > 0) w += " And " + _numWords(paise) + " Paise";
  return (w + " Only").toUpperCase();
}

export default function InvoicePreview({ invoice, isPrinting = false }) {
  if (!invoice) return null;

  const dateInfo = getInvoiceMonthAndYear(invoice);
  const invNum = invoice.invoice_number || invoice.invoiceNumber || "—";
  const invDate = invoice.issue_date
    ? fmtDDMMYYYY(invoice.issue_date)
    : invoice.invoiceDate || "—";
  const invMonth = dateInfo.monthName;
  const placeSupply =
    invoice.place_of_supply || invoice.placeOfSupply || "Kerala";
  const yearStr = dateInfo.year.toString();

  const cust = invoice.customer || {};
  const custName = cust.company_name || cust.name || "—";
  const custGstin = cust.gstin || cust.gst_number || "—";
  const custAddress = cust.address || "—";
  const custPhone = cust.phone || "—";
  const custWebsite = cust.website || "—";
  const custEmail = cust.email || "—";

  const HSN_SAC_CODE = "998314";
  const taxType = (invoice.tax_type || "GST")
    .toUpperCase()
    .replace(/[\s_-]/g, "");
  const isGST = taxType === "GST";
  const isIGST = taxType === "IGST";
  const isNoGST = taxType === "NOGST" || taxType === "NONE" || taxType === "";

  const cgstRate =
    invoice.cgst_rate !== undefined && invoice.cgst_rate !== null
      ? Number(invoice.cgst_rate)
      : 9;
  const sgstRate =
    invoice.sgst_rate !== undefined && invoice.sgst_rate !== null
      ? Number(invoice.sgst_rate)
      : 9;
  const igstRate =
    invoice.igst_rate !== undefined && invoice.igst_rate !== null
      ? Number(invoice.igst_rate)
      : 18;
  const items = invoice.items || [];

  const fmt = (num) =>
    Number(num || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const rows = items.map((item) => {
    const qty = Number(item.qty || item.quantity || 1);
    const rate = Number(item.rate || 0);
    const taxableValue = Number(
      item.taxable_value ?? item.amount ?? qty * rate,
    );
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let lineTotal = taxableValue;

    if (isGST) {
      cgstAmount = (taxableValue * cgstRate) / 100;
      sgstAmount = (taxableValue * sgstRate) / 100;
      lineTotal += cgstAmount + sgstAmount;
    }

    if (isIGST) {
      igstAmount = (taxableValue * igstRate) / 100;
      lineTotal += igstAmount;
    }

    return {
      ...item,
      qty,
      rate,
      taxableValue,
      cgstAmount,
      sgstAmount,
      igstAmount,
      lineTotal,
    };
  });

  const totalTaxable = rows.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCGST = rows.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSGST = rows.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIGST = rows.reduce((sum, item) => sum + item.igstAmount, 0);

  const discountPercent = Number(
    invoice.discount_percentage ||
      invoice.discount_percent ||
      invoice.discountPercent ||
      0,
  );
  const discountAmountRaw = Number(
    invoice.discount_amount || invoice.discountAmount || 0,
  );
  let discountVal = 0;
  let discountLabel = "Discount";

  if (discountPercent > 0) {
    discountVal = (totalTaxable * discountPercent) / 100;
    discountLabel = `Discount (${discountPercent}%)`;
  } else if (discountAmountRaw > 0) {
    discountVal = discountAmountRaw;
  }
  const finalGrandTotal =
    invoice.total_amount !== undefined && invoice.total_amount !== null
      ? Number(invoice.total_amount)
      : totalTaxable -
        discountVal +
        (isGST ? totalCGST + totalSGST : isIGST ? totalIGST : 0);

  const amtPaid = Number(invoice.amount_paid || 0);
  const netGrandTotal = finalGrandTotal - amtPaid;
  const totalWords = amountToWords(finalGrandTotal);
  const balDue =
    invoice.balance_due !== undefined && invoice.balance_due !== null
      ? Number(invoice.balance_due)
      : netGrandTotal;

  const rowCount =
    2 +
    (discountVal > 0 ? 1 : 0) +
    (isGST ? 3 : isIGST ? 2 : 0) +
    (amtPaid > 0 ? 2 : 0);

  let panelTop = 809;
  let panelFontSize = 10;
  let grandTotalFontSize = 11;
  let cellPy = 3.5; // padding top/bottom in pixels
  let totalCellPy = 8; // padding top/bottom in pixels for Grand Total / Balance Due
  let oeMargin = 3; // margin top in pixels

  if (rowCount >= 8) {
    panelTop = 804;
    panelFontSize = 8.5;
    grandTotalFontSize = 9.2;
    cellPy = 1.5;
    totalCellPy = 4.0;
    oeMargin = 0;
  } else if (rowCount >= 6) {
    panelTop = 806;
    panelFontSize = 9;
    grandTotalFontSize = 10.0;
    cellPy = 2;
    totalCellPy = 5.5;
    oeMargin = 1;
  }

  const displayRows = [...rows];
  while (displayRows.length < 5) {
    displayRows.push({
      description: "",
      qty: "",
      rate: "",
      taxableValue: "",
      cgstAmount: "",
      sgstAmount: "",
      igstAmount: "",
      lineTotal: "",
    });
  }

  return (
    <div className="flex justify-center bg-[#e2e8f0] py-10 font-sans">
      <div
        className={`relative w-[794px] h-[1122px] bg-[#ffffff] overflow-hidden text-[#0f172a] ${isPrinting ? "" : "shadow-xl"}`}
      >
        {/* Background Template */}

        <img
          src={BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Invoice Header */}

        <div className="flex absolute text-sm font-bold gap-[135px] top-[195px] left-[79px]">
          <div>{invNum}</div>
          <div>{invDate}</div>
          <div>{invMonth}</div>
          <div className="!ml-2">{placeSupply}</div>
        </div>

        {/* Year */}
        <div className="absolute top-[80px] left-[660px] ">
          <h1
            className="font-semibold text-[#2158A9]"
            style={{ transform: "scale(2.6)", transformOrigin: "top left" }}
          >
            {yearStr}
          </h1>
        </div>

        {/* Bill To */}

        <div className="absolute top-[275px] left-[50px] w-[270px] text-xs p-2 space-y-2">
          <p className="font-semibold flex gap-8">
            <strong>Name:</strong> {custName}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>GSTIN:</strong> {custGstin}
          </p>
          <p className="font-semibold flex gap-6">
            <strong>Address:</strong> {custAddress}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>Phone:</strong> {custPhone}
          </p>
          <p className="font-semibold flex gap-6">
            <strong>Website:</strong> {custWebsite}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>Email:</strong> {custEmail}
          </p>
        </div>

        {/* Bill From */}
        <div className="absolute top-[275px] left-[450px] w-[270px] p-2 text-xs space-y-2">
          <p className="font-semibold flex gap-8">
            <strong>Name:</strong> {COMPANY.name}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>GSTIN:</strong> {COMPANY.gstin}
          </p>
          <div className="font-semibold flex gap-6">
            <strong>Address:</strong>{" "}
            <span className="text-xs">{COMPANY.address}</span>
          </div>
          <p className="font-semibold flex gap-8">
            <strong>Phone:</strong> {COMPANY.phone}
          </p>
          <p className="font-semibold flex gap-6">
            <strong>Website:</strong> {COMPANY.website}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>Email:</strong> {COMPANY.email}
          </p>
        </div>

        {/* ITEMS TABLE */}
        <div className="absolute top-[485px] left-[20px] w-[748px]">
          <div className="overflow-hidden rounded-xl border border-[#d6dee9]">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-2 py-3 w-[4%] rounded-tl-xl">
                    SL.
                    <br />
                    NO
                  </th>
                  <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-2 py-3 text-left w-[21%]">
                    DESCRIPTION OF SERVICE
                  </th>
                  <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-2 py-3 w-[7%]">
                    HSN / SAC
                  </th>
                  <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-2 py-3 w-[4%]">
                    QTY
                  </th>
                  <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-2 py-3 w-[10%]">
                    RATE (₹)
                  </th>
                  <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-2 py-3 w-[12%]">
                    TAXABLE
                    <br />
                    VALUE (₹)
                  </th>
                  {isGST && (
                    <>
                      <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-1 py-3 w-[4%]">
                        CGST %
                      </th>
                      <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-1 py-3 w-[9%]">
                        CGST AMOUNT
                      </th>
                      <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-1 py-3 w-[4%]">
                        SGST %
                      </th>
                      <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-1 py-3 w-[9%]">
                        SGST AMOUNT
                      </th>
                    </>
                  )}
                  {isIGST && (
                    <>
                      <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-1 py-3 w-[6%]">
                        IGST %
                      </th>
                      <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-1 py-3 w-[12%]">
                        IGST AMOUNT
                      </th>
                    </>
                  )}
                  {isNoGST && (
                    <>
                      <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-1 py-3 w-[6%]">
                        GST %
                      </th>
                      <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-1 py-3 w-[12%]">
                        GST AMOUNT
                      </th>
                    </>
                  )}
                  <th className="bg-[#2158A9] text-white border border-[#2158A9] text-[10px] px-2 py-3 w-[15%] rounded-tr-xl">
                    TOTAL (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  return displayRows.map((item, index) => {
                    const isLastRow = index === displayRows.length - 1;
                    const borderClass = `border-l border-r border-[#d6dee9] ${isLastRow ? "border-b" : ""}`;

                    const cellPadding = isGST ? "p-1" : "px-2";
                    const descPadding = isGST ? "p-1" : "px-3 pt-3";

                    return (
                      <tr key={index} style={{ height: "38px" }}>
                        <td
                          className={`${borderClass} ${cellPadding} text-center text-[11px]`}
                        >
                          {item.description ? index + 1 : ""}
                        </td>
                        <td
                          className={`${borderClass} ${descPadding} text-xs leading-5 whitespace-normal break-words align-top`}
                        >
                          {item.description}
                        </td>
                        <td
                          className={`${borderClass} ${cellPadding} text-center text-[11px]`}
                        >
                          {item.description ? HSN_SAC_CODE : ""}
                        </td>
                        <td
                          className={`${borderClass} ${cellPadding} text-center text-[11px]`}
                        >
                          {item.qty}
                        </td>
                        <td
                          className={`${borderClass} ${cellPadding} text-right text-[11px] whitespace-nowrap`}
                        >
                          {item.rate !== "" ? fmt(item.rate) : ""}
                        </td>
                        <td
                          className={`${borderClass} ${cellPadding} text-right text-[11px] whitespace-nowrap`}
                        >
                          {item.taxableValue !== ""
                            ? fmt(item.taxableValue)
                            : ""}
                        </td>
                        {isGST && (
                          <>
                            <td
                              className={`${borderClass} ${cellPadding} text-center text-[11px]`}
                            >
                              {item.description ? `${cgstRate}%` : ""}
                            </td>
                            <td
                              className={`${borderClass} ${cellPadding} text-right text-[11px] whitespace-nowrap`}
                            >
                              {item.cgstAmount !== ""
                                ? fmt(item.cgstAmount)
                                : ""}
                            </td>
                            <td
                              className={`${borderClass} ${cellPadding} text-center text-[11px]`}
                            >
                              {item.description ? `${sgstRate}%` : ""}
                            </td>
                            <td
                              className={`${borderClass} ${cellPadding} text-right text-[11px] whitespace-nowrap`}
                            >
                              {item.sgstAmount !== ""
                                ? fmt(item.sgstAmount)
                                : ""}
                            </td>
                          </>
                        )}
                        {isIGST && (
                          <>
                            <td
                              className={`${borderClass} ${cellPadding} text-center text-[11px]`}
                            >
                              {item.description ? `${igstRate}%` : ""}
                            </td>
                            <td
                              className={`${borderClass} ${cellPadding} text-right text-[11px] whitespace-nowrap`}
                            >
                              {item.igstAmount !== ""
                                ? fmt(item.igstAmount)
                                : ""}
                            </td>
                          </>
                        )}
                        {isNoGST && (
                          <>
                            <td
                              className={`${borderClass} ${cellPadding} text-center text-[11px]`}
                            >
                              {item.description ? "0%" : ""}
                            </td>
                            <td
                              className={`${borderClass} ${cellPadding} text-right text-[11px] whitespace-nowrap`}
                            >
                              {item.description ? "0.00" : ""}
                            </td>
                          </>
                        )}
                        <td
                          className={`${borderClass} ${cellPadding} text-center text-[11px] font-semibold whitespace-nowrap`}
                        >
                          {item.lineTotal !== "" ? fmt(item.lineTotal) : ""}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    className="bg-[#eef2f7] border border-[#d6dee9] text-center font-bold text-[12px] text-[#2158A9] py-3"
                    colSpan={5}
                  >
                    TOTAL
                  </td>
                  <td
                    className={`bg-[#eef2f7] border border-[#d6dee9] text-right font-bold text-[11px] whitespace-nowrap ${isGST ? "p-1" : "px-2"}`}
                  >
                    {fmt(totalTaxable)}
                  </td>
                  {isGST && (
                    <>
                      <td className="bg-[#eef2f7] border border-[#d6dee9]" />
                      <td
                        className={`bg-[#eef2f7] border border-[#d6dee9] text-right font-bold text-[11px] whitespace-nowrap ${isGST ? "p-1" : "px-2"}`}
                      >
                        {fmt(totalCGST)}
                      </td>
                      <td className="bg-[#eef2f7] border border-[#d6dee9]" />
                      <td
                        className={`bg-[#eef2f7] border border-[#d6dee9] text-right font-bold text-[11px] whitespace-nowrap ${isGST ? "p-1" : "px-2"}`}
                      >
                        {fmt(totalSGST)}
                      </td>
                    </>
                  )}
                  {isIGST && (
                    <>
                      <td className="bg-[#eef2f7] border border-[#d6dee9]" />
                      <td
                        className={`bg-[#eef2f7] border border-[#d6dee9] text-right font-bold text-[11px] whitespace-nowrap ${isGST ? "p-1" : "px-2"}`}
                      >
                        {fmt(totalIGST)}
                      </td>
                    </>
                  )}
                  {isNoGST && (
                    <>
                      <td className="bg-[#eef2f7] border border-[#d6dee9]" />
                      <td className="bg-[#eef2f7] border border-[#d6dee9]" />
                    </>
                  )}
                  <td
                    className={`bg-[#eef2f7] border border-[#d6dee9] text-center font-bold text-[11px] whitespace-nowrap ${isGST ? "p-1" : "px-2"}`}
                  >
                    {fmt(finalGrandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Total In Words */}
        <div className="absolute top-[828px] left-[30px] w-[320px] h-[45px] flex items-center justify-center text-center px-2">
          <p className="text-[11px] font-bold uppercase text-[#0f172a] leading-snug">
            {totalWords}
          </p>
        </div>

        {/* Bank Details */}
        <div className="absolute top-[940px] left-[50px] w-[320px] text-xs p-2 space-y-2">
          <p className="flex gap-7 font-semibold">
            <strong>Account Name:</strong> {BANK.accountName}
          </p>
          <p className="flex gap-13 font-semibold">
            <strong>Bank Name:</strong> {BANK.bankName}
          </p>
          <p className="flex gap-4 font-semibold">
            <strong>Account Number:</strong> {BANK.accountNumber}
          </p>
          <p className="flex gap-3 font-semibold">
            <strong>Bank branch IFSC:</strong> {BANK.ifsc}
          </p>
        </div>

        {/* DYNAMIC TAX SUMMARY PANEL */}
        <div
          className="absolute text-[#0f172a]"
          style={{ top: `${panelTop}px`, right: "43px", width: "338px" }}
        >
          <div
            className="overflow-hidden rounded-lg border border-[#d6dee9] bg-white w-full"
            style={{ fontSize: `${panelFontSize}px` }}
          >
            <table className="w-full border-separate border-spacing-0">
              <tbody>
                <tr className="border-b border-[#eef2f7]">
                  <td
                    className="border-b border-[#eef2f7] text-[#64748b] font-medium"
                    style={{ padding: `${cellPy}px 8px` }}
                  >
                    Taxable Amount
                  </td>
                  <td
                    className="border-b border-[#eef2f7] text-right font-bold text-[#1e293b]"
                    style={{ padding: `${cellPy}px 8px` }}
                  >
                    ₹ {fmt(totalTaxable)}
                  </td>
                </tr>
                {discountVal > 0 && (
                  <tr className="border-b border-[#eef2f7] bg-red-50/30">
                    <td
                      className="border-b border-[#eef2f7] text-[#dc2626] font-medium"
                      style={{ padding: `${cellPy}px 8px` }}
                    >
                      {discountLabel}
                    </td>
                    <td
                      className="border-b border-[#eef2f7] text-right font-bold text-[#dc2626]"
                      style={{ padding: `${cellPy}px 8px` }}
                    >
                      - ₹ {fmt(discountVal)}
                    </td>
                  </tr>
                )}
                {isGST && (
                  <>
                    <tr className="border-b border-[#eef2f7]">
                      <td
                        className="border-b border-[#eef2f7] text-[#64748b] font-medium"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        Add CGST ({cgstRate}%)
                      </td>
                      <td
                        className="border-b border-[#eef2f7] text-right font-bold text-[#1e293b]"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        ₹ {fmt(totalCGST)}
                      </td>
                    </tr>
                    <tr className="border-b border-[#eef2f7]">
                      <td
                        className="border-b border-[#eef2f7] text-[#64748b] font-medium"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        Add SGST ({sgstRate}%)
                      </td>
                      <td
                        className="border-b border-[#eef2f7] text-right font-bold text-[#1e293b]"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        ₹ {fmt(totalSGST)}
                      </td>
                    </tr>
                    <tr className="border-b border-[#eef2f7]">
                      <td
                        className="border-b border-[#eef2f7] text-[#64748b] font-semibold"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        Total Tax
                      </td>
                      <td
                        className="border-b border-[#eef2f7] text-right font-bold text-[#1e293b]"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        ₹ {fmt(totalCGST + totalSGST)}
                      </td>
                    </tr>
                  </>
                )}
                {isIGST && (
                  <>
                    <tr className="border-b border-[#eef2f7]">
                      <td
                        className="border-b border-[#eef2f7] text-[#64748b] font-medium"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        Add IGST ({igstRate}%)
                      </td>
                      <td
                        className="border-b border-[#eef2f7] text-right font-bold text-[#1e293b]"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        ₹ {fmt(totalIGST)}
                      </td>
                    </tr>
                    <tr className="border-b border-[#eef2f7]">
                      <td
                        className="border-b border-[#eef2f7] text-[#64748b] font-semibold"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        Total Tax
                      </td>
                      <td
                        className="border-b border-[#eef2f7] text-right font-bold text-[#1e293b]"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        ₹ {fmt(totalIGST)}
                      </td>
                    </tr>
                  </>
                )}
                <tr className="bg-[#2158A9] text-[#ffffff] font-bold">
                  <td
                    className="font-black tracking-wide"
                    style={{
                      padding: `${totalCellPy}px 10px`,
                      fontSize: `${grandTotalFontSize}px`,
                      borderBottomLeftRadius: amtPaid > 0 ? "0" : "6px",
                    }}
                  >
                    Grand Total
                  </td>
                  <td
                    className="text-right font-black tracking-wide"
                    style={{
                      padding: `${totalCellPy}px 10px`,
                      fontSize: `${grandTotalFontSize}px`,
                      borderBottomRightRadius: amtPaid > 0 ? "0" : "6px",
                    }}
                  >
                    ₹ {fmt(finalGrandTotal)}
                  </td>
                </tr>
                {amtPaid > 0 && (
                  <>
                    <tr className="border-b border-[#eef2f7] bg-green-50/30">
                      <td
                        className="border-b border-[#eef2f7] text-[#16a34a] font-medium"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        Amount Paid / Advance
                      </td>
                      <td
                        className="border-b border-[#eef2f7] text-right font-bold text-[#16a34a]"
                        style={{ padding: `${cellPy}px 8px` }}
                      >
                        - ₹ {fmt(amtPaid)}
                      </td>
                    </tr>
                    <tr className="bg-red-50/30 font-bold">
                      <td
                        className="text-[#dc2626] font-black tracking-wide"
                        style={{
                          padding: `${totalCellPy}px 10px`,
                          fontSize: `${grandTotalFontSize}px`,
                          borderBottomLeftRadius: "6px",
                        }}
                      >
                        Balance Due
                      </td>
                      <td
                        className="text-right text-[#dc2626] font-black tracking-wide"
                        style={{
                          padding: `${totalCellPy}px 10px`,
                          fontSize: `${grandTotalFontSize}px`,
                          borderBottomRightRadius: "6px",
                        }}
                      >
                        ₹ {fmt(balDue)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div
            className="w-full text-right text-[9px] text-[#64748b] font-medium pr-1"
            style={{ marginTop: `${oeMargin}px` }}
          >
            (E &amp; O.E.)
          </div>
        </div>
      </div>
    </div>
  );
}

export const generateInvoicePDF = (
  invoice,
  _formatDate,
  _formatMoney,
  toast,
) => {
  const loadingToast = toast.loading("Generating PDF...");

  try {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.left = "0";
    tempDiv.style.top = "0";
    tempDiv.style.width = "794px";
    tempDiv.style.height = "1122px";
    tempDiv.style.zIndex = "-9999";
    tempDiv.style.pointerEvents = "none";
    tempDiv.style.overflow = "hidden";
    document.body.appendChild(tempDiv);

    const root = createRoot(tempDiv);
    flushSync(() => {
      root.render(<InvoicePreview invoice={invoice} isPrinting={true} />);
    });

    const runRender = () => {
      const target = tempDiv.querySelector(".relative") || tempDiv;

      const captureCanvas = () => {
        html2canvas(target, {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 794,
          height: 1122,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
        })
          .then((canvas) => {
            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            const pdf = new jsPDF("p", "mm", "a4");
            pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
            pdf.save(`Invoice_${invoice.invoice_number || "draft"}.pdf`);

            toast.success("Download started!", { id: loadingToast });
            root.unmount();
            document.body.removeChild(tempDiv);
          })
          .catch((err) => {
            console.error("html2canvas render error:", err);
            toast.error("Failed to render PDF.", { id: loadingToast });
            root.unmount();
            document.body.removeChild(tempDiv);
          });
      };

      const img = target.querySelector("img");
      if (img) {
        if (img.complete) {
          img.decode().then(captureCanvas).catch(captureCanvas);
        } else {
          img.addEventListener("load", () => {
            img.decode().then(captureCanvas).catch(captureCanvas);
          });
          img.addEventListener("error", captureCanvas);
        }
      } else {
        captureCanvas();
      }
    };

    runRender();
  } catch (err) {
    console.error("generateInvoicePDF error:", err);
    toast.error("Failed to generate PDF.", { id: loadingToast });
  }
};

export const generateInvoicePDFBase64 = (
  invoice,
  _formatDate,
  _formatMoney,
) => {
  return new Promise((resolve, reject) => {
    try {
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "fixed";
      tempDiv.style.left = "0";
      tempDiv.style.top = "0";
      tempDiv.style.width = "794px";
      tempDiv.style.height = "1122px";
      tempDiv.style.zIndex = "-9999";
      tempDiv.style.pointerEvents = "none";
      tempDiv.style.overflow = "hidden";
      document.body.appendChild(tempDiv);

      const root = createRoot(tempDiv);
      flushSync(() => {
        root.render(<InvoicePreview invoice={invoice} isPrinting={true} />);
      });

      const runRender = () => {
        const target = tempDiv.querySelector(".relative") || tempDiv;

        const captureCanvas = () => {
          html2canvas(target, {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 794,
            height: 1122,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
          })
            .then((canvas) => {
              const imgData = canvas.toDataURL("image/jpeg", 0.98);
              const pdf = new jsPDF("p", "mm", "a4");
              pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
              const base64 = pdf.output("datauristring").split(",")[1];

              resolve(base64);
              root.unmount();
              document.body.removeChild(tempDiv);
            })
            .catch((err) => {
              console.error("html2canvas render base64 error:", err);
              reject(err);
              root.unmount();
              document.body.removeChild(tempDiv);
            });
        };

        const img = target.querySelector("img");
        if (img) {
          if (img.complete) {
            img.decode().then(captureCanvas).catch(captureCanvas);
          } else {
            img.addEventListener("load", () => {
              img.decode().then(captureCanvas).catch(captureCanvas);
            });
            img.addEventListener("error", captureCanvas);
          }
        } else {
          captureCanvas();
        }
      };

      runRender();
    } catch (err) {
      console.error("generateInvoicePDFBase64 error:", err);
      reject(err);
    }
  });
};
