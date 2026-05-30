import LOGO from "../image/Xeventure.png";

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY DETAILS  ·  Edit these to update the "Bill From" section
// ─────────────────────────────────────────────────────────────────────────────
const COMPANY = {
  name: "Xeventure IT Solutions",
  address:
    "Bathery Opp to Issacs Residency, Sulthan Bathery, Wayanad, Kerala, India 673592",
  gstin: "32BEDPT5030H1ZR",
  pan: "BEDPT5030H",
  phone: "+91 9746905919",
  website: "www.xeventureit.com",
  email: "info@xeventureit.com",
};

const BANK = {
  accountName: "NIKHIL THOMAS",
  bankName: "FEDERAL BANK",
  accountNumber: "10690100173612",
  ifsc: "FDRL0001069",
  branch: "Sulthan Bathery",
};

const _MONTHS = [
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

function _parseDate(d) {
  if (!d) return new Date();
  const parsed = new Date(d);
  return isNaN(parsed) ? new Date() : parsed;
}

/** Returns "DD/MM/YYYY" */

function fmtDDMMYYYY(d) {
  const dt = _parseDate(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

/** Returns full month name, e.g. "April" */

function fmtMonthName(d) {
  return _MONTHS[_parseDate(d).getMonth()];
}

// AMOUNT → WORDS  (Indian numbering: Crore / Lakh / Thousand)

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

function amountToWords(amount) {
  const num = parseFloat(amount) || 0;
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let w = "Rupees " + (rupees > 0 ? _numWords(rupees) : "Zero");
  if (paise > 0) w += " And " + _numWords(paise) + " Paise";
  return (w + " Only").toUpperCase();
}

const IC = {
  doc: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  cal: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  user: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  bldg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  bank: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b4fd8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
  note: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1b4fd8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  phone: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.46a16 16 0 0 0 6.29 6.29l.49-.49a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>`,
  web: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  mail: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
};

// CSS — shared inline styles as JS constants

const PRIMARY = "#1b4fd8";
const BGk = "#f1f5f9"; // Background
const BORDER = "#d1d9e6"; // table / card borders
const TXT = "#0f172a"; // primary text
const MUTED = "#475569"; // secondary text
const ACCENT = "#2563eb"; // blue accent (unused totals)
const GREEN = "#16a34a";
const RED = "#dc2626";

const thStyle = `padding: 7px 6px; text-align: center; font-size: 9.5px;
  font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;
  color: white; background: ${PRIMARY}; border: 1px solid #2d5297;`;
const tdStyle = `padding: 8px 6px; font-size: 11.5px; color: ${TXT};
  border: 1px solid ${BORDER}; vertical-align: top;`;
const tdR = tdStyle + " text-align: right;";
const tdC = tdStyle + " text-align: center;";

// PARTY INFO ROW helper

function infoRow(label, value, extra = "") {
  if (!value) return "";
  return `
    <tr>
      <td style="padding: 3px 0; font-size: 12px; font-weight: 700; color: ${TXT}; width: 72px; vertical-align: top;">${label}</td>
      <td style="padding: 3px 0; font-size: 12px; color: ${MUTED}; vertical-align: top;">${value}${extra}</td>
    </tr>`;
}

// ITEMS TABLE  (handles GST / IGST / No-Tax)

function buildItemsTable(invoice, fmtMoney) {
  const taxType = (invoice.tax_type || "").toUpperCase();
  const isGST = taxType === "GST";
  const isIGST = taxType === "IGST";

  // ---- CGST / SGST rates used across all items ----
  const cgstRate = parseFloat(invoice.cgst_rate) || 0;
  const sgstRate = parseFloat(invoice.sgst_rate) || 0;
  const igstRate = parseFloat(invoice.igst_rate) || 0;

  // ---- header rows ----

  let headerHTML = "";
  if (isGST) {
    headerHTML = `
      <tr>
        <th rowspan="2" style="${thStyle} width:4%">SL.<br>NO</th>
        <th rowspan="2" style="${thStyle} width:22%; text-align:left;">DESCRIPTION OF SERVICE</th>
        <th rowspan="2" style="${thStyle} width:7%">HSN/<br>SAC</th>
        <th rowspan="2" style="${thStyle} width:4%">QTY</th>
        <th rowspan="2" style="${thStyle} width:9%">RATE<br>(₹)</th>
        <th rowspan="2" style="${thStyle} width:10%">TAXABLE<br>VALUE (₹)</th>
        <th colspan="2" style="${thStyle} width:16%">CGST</th>
        <th colspan="2" style="${thStyle} width:16%">SGST</th>
        <th rowspan="2" style="${thStyle} width:10%">TOTAL<br>(₹)</th>
      </tr>
      <tr>
        <th style="${thStyle} width:5%">%</th>
        <th style="${thStyle} width:9%">AMOUNT<br>(₹)</th>
        <th style="${thStyle} width:5%">%</th>
        <th style="${thStyle} width:9%">AMOUNT<br>(₹)</th>
      </tr>`;
  } else if (isIGST) {
    headerHTML = `
      <tr>
        <th rowspan="2" style="${thStyle} width:4%">SL.<br>NO</th>
        <th rowspan="2" style="${thStyle} width:28%; text-align:left;">DESCRIPTION OF SERVICE</th>
        <th rowspan="2" style="${thStyle} width:8%">HSN/<br>SAC</th>
        <th rowspan="2" style="${thStyle} width:5%">QTY</th>
        <th rowspan="2" style="${thStyle} width:10%">RATE<br>(₹)</th>
        <th rowspan="2" style="${thStyle} width:12%">TAXABLE<br>VALUE (₹)</th>
        <th colspan="2" style="${thStyle} width:20%">IGST</th>
        <th rowspan="2" style="${thStyle} width:11%">TOTAL<br>(₹)</th>
      </tr>
      <tr>
        <th style="${thStyle} width:7%">%</th>
        <th style="${thStyle} width:11%">AMOUNT<br>(₹)</th>
      </tr>`;
  } else {
    headerHTML = `
      <tr>
        <th style="${thStyle} width:5%">SL. NO</th>
        <th style="${thStyle} width:35%; text-align:left;">DESCRIPTION OF SERVICE</th>
        <th style="${thStyle} width:10%">HSN / SAC</th>
        <th style="${thStyle} width:6%">QTY</th>
        <th style="${thStyle} width:14%">RATE (₹)</th>
        <th style="${thStyle} width:15%">TAXABLE VALUE (₹)</th>
        <th style="${thStyle} width:15%">TOTAL (₹)</th>
      </tr>`;
  }

  // ---- item rows ----

  const items = invoice.items || [];
  let totalTaxable = 0,
    totalCGST = 0,
    totalSGST = 0,
    totalIGST = 0,
    grandTotal = 0;

  const rowsHTML = items.length
    ? items
        .map((item, idx) => {
          const taxableVal =
            parseFloat(
              item.taxable_value ??
                item.amount ??
                parseFloat(item.rate) * parseFloat(item.quantity),
            ) || 0;
          const cgstAmt =
            parseFloat(item.cgst_amount) ?? (taxableVal * cgstRate) / 100;
          const sgstAmt =
            parseFloat(item.sgst_amount) ?? (taxableVal * sgstRate) / 100;
          const igstAmt =
            parseFloat(item.igst_amount) ?? (taxableVal * igstRate) / 100;
          let lineTotal;
          if (isGST) lineTotal = taxableVal + cgstAmt + sgstAmt;
          else if (isIGST) lineTotal = taxableVal + igstAmt;
          else lineTotal = taxableVal;

          totalTaxable += taxableVal;
          totalCGST += cgstAmt;
          totalSGST += sgstAmt;
          totalIGST += igstAmt;
          grandTotal += lineTotal;

          const hsnSac = item.hsn_sac || "—";
          const bg = idx % 2 === 1 ? `background:#f8fafc;` : "";

          if (isGST) {
            return `
        <tr style="${bg} page-break-inside: avoid;">
          <td style="${tdC}">${idx + 1}</td>
          <td style="${tdStyle}">${item.description || ""}</td>
          <td style="${tdC}">${hsnSac}</td>
          <td style="${tdC}">${parseFloat(item.quantity)}</td>
          <td style="${tdR}">${fmtMoney(item.rate)}</td>
          <td style="${tdR}">${fmtMoney(taxableVal)}</td>
          <td style="${tdC}">${cgstRate}%</td>
          <td style="${tdR}">${fmtMoney(cgstAmt)}</td>
          <td style="${tdC}">${sgstRate}%</td>
          <td style="${tdR}">${fmtMoney(sgstAmt)}</td>
          <td style="${tdR} font-weight:700;">${fmtMoney(lineTotal)}</td>
        </tr>`;
          } else if (isIGST) {
            return `
        <tr style="${bg} page-break-inside: avoid;">
          <td style="${tdC}">${idx + 1}</td>
          <td style="${tdStyle}">${item.description || ""}</td>
          <td style="${tdC}">${hsnSac}</td>
          <td style="${tdC}">${parseFloat(item.quantity)}</td>
          <td style="${tdR}">${fmtMoney(item.rate)}</td>
          <td style="${tdR}">${fmtMoney(taxableVal)}</td>
          <td style="${tdC}">${igstRate}%</td>
          <td style="${tdR}">${fmtMoney(igstAmt)}</td>
          <td style="${tdR} font-weight:700;">${fmtMoney(lineTotal)}</td>
        </tr>`;
          } else {
            return `
        <tr style="${bg} page-break-inside: avoid;">
          <td style="${tdC}">${idx + 1}</td>
          <td style="${tdStyle}">${item.description || ""}</td>
          <td style="${tdC}">${hsnSac}</td>
          <td style="${tdC}">${parseFloat(item.quantity)}</td>
          <td style="${tdR}">${fmtMoney(item.rate)}</td>
          <td style="${tdR}">${fmtMoney(taxableVal)}</td>
          <td style="${tdR} font-weight:700;">${fmtMoney(lineTotal)}</td>
        </tr>`;
          }
        })
        .join("")
    : `<tr><td colspan="11" style="${tdC} color:#94a3b8;">No line items.</td></tr>`;

  // ---- TOTAL row ----
  let totalRowHTML;
  const ts = `padding: 9px 6px; font-size: 12.5px; font-weight: 800; color: ${TXT};
    border: 1px solid ${BORDER}; border-top: 2px solid ${PRIMARY}; background: #f1f5f9;`;
  if (isGST) {
    totalRowHTML = `
      <tr style="page-break-inside: avoid;">
        <td colspan="5" style="${ts} text-align:center; letter-spacing:1px; font-size:13px; color:${PRIMARY};">TOTAL</td>
        <td style="${ts} text-align:right;">${fmtMoney(totalTaxable)}</td>
        <td style="${ts}"></td>
        <td style="${ts} text-align:right;">${fmtMoney(totalCGST)}</td>
        <td style="${ts}"></td>
        <td style="${ts} text-align:right;">${fmtMoney(totalSGST)}</td>
        <td style="${ts} text-align:right;">${fmtMoney(grandTotal)}</td>
      </tr>`;
  } else if (isIGST) {
    totalRowHTML = `
      <tr style="page-break-inside: avoid;">
        <td colspan="5" style="${ts} text-align:center; letter-spacing:1px; font-size:13px; color:${PRIMARY};">TOTAL</td>
        <td style="${ts} text-align:right;">${fmtMoney(totalTaxable)}</td>
        <td style="${ts}"></td>
        <td style="${ts} text-align:right;">${fmtMoney(totalIGST)}</td>
        <td style="${ts} text-align:right;">${fmtMoney(grandTotal)}</td>
      </tr>`;
  } else {
    totalRowHTML = `
      <tr style="page-break-inside: avoid;">
        <td colspan="5" style="${ts} text-align:center; letter-spacing:1px; font-size:13px; color:${PRIMARY};">TOTAL</td>
        <td style="${ts} text-align:right;">${fmtMoney(totalTaxable)}</td>
        <td style="${ts} text-align:right;">${fmtMoney(grandTotal)}</td>
      </tr>`;
  }

  return {
    html: `
    <table style="width:100%; border-collapse:collapse; margin-bottom:18px;">
      <thead>${headerHTML}</thead>
      <tbody>${rowsHTML}</tbody>
      <tfoot>${totalRowHTML}</tfoot>
    </table>`,
    totalTaxable,
    totalCGST,
    totalSGST,
    totalIGST,
    grandTotal,
  };
}

// TAX SUMMARY (right side of bottom section)

function buildTaxSummary(invoice, fmtMoney, totals) {
  const taxType = (invoice.tax_type || "").toUpperCase();
  const isGST = taxType === "GST";
  const isIGST = taxType === "IGST";

  const cgstRate = parseFloat(invoice.cgst_rate) || 0;
  const sgstRate = parseFloat(invoice.sgst_rate) || 0;
  const igstRate = parseFloat(invoice.igst_rate) || 0;

  const rs = `padding: 8px 12px; font-size: 12px; border-bottom: 1px solid ${BORDER};`;
  const rv = `${rs} text-align: right; font-weight: 700; color: ${TXT};`;

  let taxRows = "";
  if (isGST) {
    taxRows = `
      <tr>
        <td style="${rs} color:${MUTED};">Add CGST (${cgstRate}%)</td>
        <td style="${rv}">${fmtMoney(totals.totalCGST)}</td>
      </tr>
      <tr>
        <td style="${rs} color:${MUTED};">Add SGST (${sgstRate}%)</td>
        <td style="${rv}">${fmtMoney(totals.totalSGST)}</td>
      </tr>
      <tr>
        <td style="${rs} font-weight:800; color:${TXT};">Total Tax</td>
        <td style="${rv} font-weight:800;">${fmtMoney(totals.totalCGST + totals.totalSGST)}</td>
      </tr>`;
  } else if (isIGST) {
    taxRows = `
      <tr>
        <td style="${rs} color:${MUTED};">Add IGST (${igstRate}%)</td>
        <td style="${rv}">${fmtMoney(totals.totalIGST)}</td>
      </tr>
      <tr>
        <td style="${rs} font-weight:800; color:${TXT};">Total Tax</td>
        <td style="${rv} font-weight:800;">${fmtMoney(totals.totalIGST)}</td>
      </tr>`;
  }

  return `
    <table style="width:100%; border-collapse:collapse; border:1px solid ${BORDER}; border-radius:6px; overflow:hidden; font-family:inherit;">
      <tr>
        <td style="${rs} color:${MUTED};">Taxable Amount</td>
        <td style="${rv}">${fmtMoney(totals.totalTaxable)}</td>
      </tr>
      ${taxRows}
      <tr>
        <td style="padding:10px 12px; font-size:14px; font-weight:900; color:white; background:${PRIMARY};">Grand Total</td>
        <td style="padding:10px 12px; font-size:14px; font-weight:900; color:white; background:${PRIMARY}; text-align:right;">
          ₹ ${fmtMoney(totals.grandTotal)}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:4px 12px; font-size:10px; color:${MUTED}; text-align:right;">(E &amp; O.E.)</td>
      </tr>
      <tr>
        <td style="${rs} font-weight:700; color:${TXT}; border-top:1.5px solid ${BORDER};">GST Payable on Reverse Charge</td>
        <td style="${rv} border-top:1.5px solid ${BORDER};">N.A.</td>
      </tr>
    </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PDF GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export const generateInvoicePDF = (invoice, formatDate, formatMoney, toast) => {
  const loadingToast = toast.loading("Generating PDF...");

  try {
    import("html2pdf.js")
      .then((mod) => {
        const html2pdf = mod.default || mod;

        // ── dates ──
        const dateStr = fmtDDMMYYYY(invoice.issue_date);
        const monthStr =
          invoice.invoice_month || fmtMonthName(invoice.issue_date);
        const yearStr =
          new Date(invoice.issue_date || Date.now()).getFullYear() ||
          new Date().getFullYear();
        const supplyStr = invoice.place_of_supply || "Kerala (32)";

        // ── items table + running totals ──
        const { html: tableHTML, ...totals } = buildItemsTable(
          invoice,
          formatMoney,
        );

        // ── total in words ──
        const totalWords = amountToWords(
          totals.grandTotal || invoice.total_amount || 0,
        );

        // ── tax summary ──
        const taxSummaryHTML = buildTaxSummary(invoice, formatMoney, totals);

        // ── customer / company detail builders ──
        const cust = invoice.customer || {};
        const custHTML = cust.company_name
          ? `<table style="border-collapse:collapse; width:100%;">
            ${infoRow("Name", cust.company_name)}
            ${infoRow("GSTIN", cust.gstin || cust.gst_number || "—")}
            ${infoRow("Address", cust.address)}
            ${infoRow("Phone", cust.phone)}
            ${infoRow("Website", cust.website || "—")}
            ${infoRow("Email", cust.email)}
           </table>`
          : `<p style="color:${RED}; font-size:12px; margin:0;">Customer details missing.</p>`;

        const fromHTML = `<table style="border-collapse:collapse; width:100%;">
        ${infoRow("Name", COMPANY.name)}
        ${infoRow("GSTIN", COMPANY.gstin)}
        ${infoRow("Address", COMPANY.address)}
        ${infoRow("Phone", COMPANY.phone)}
        ${infoRow("Website", COMPANY.website)}
        ${infoRow("Email", COMPANY.email)}
      </table>`;

        // ══════════════════════════════════════════════════════════════
        // BUILD HTML ELEMENT
        // ══════════════════════════════════════════════════════════════
        const el = document.createElement("div");
        el.style.cssText = `
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: ${TXT};
        background: #ffffff;
        width: 794px;
        box-sizing: border-box;
        padding: 36px 40px 0 40px;
      `;

        el.innerHTML = `
        <!-- ═══ HEADER ═══ -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <!-- Logo -->
          <div>
            <img src="${LOGO}"
                 style="height:80px; object-fit:contain; display:block;"
                 alt="${COMPANY.name}">
          </div>
          <!-- INVOICE / YEAR -->
          <div style="text-align:right; line-height:1;">
            <div style="font-size:50px; font-weight:900; color:${TXT}; letter-spacing:-1px; line-height:1;">INVOICE</div>
            <div style="font-size:36px; font-weight:900; color:${TXT}; line-height:1.1;">${yearStr}</div>
          </div>
        </div>

        <!-- thin rule -->
        <hr style="border:none; border-top:1.5px solid ${BORDER}; margin:0 0 14px 0;">

        <!-- ═══ METADATA BAR ═══ -->
        <div style="display:flex; border:1.5px solid ${BORDER}; border-radius:8px; overflow:hidden; margin-bottom:16px;">
          ${[
            {
              icon: IC.doc,
              label: "Invoice No.",
              val: invoice.invoice_number || "—",
            },
            { icon: IC.cal, label: "Invoice Date", val: dateStr },
            { icon: IC.cal, label: "Invoice Month", val: monthStr },
            { icon: IC.pin, label: "Place of Supply", val: supplyStr },
          ]
            .map(
              (m, i) => `
            <div style="flex:1; padding:10px 14px;
              ${i < 3 ? `border-right:1.5px solid ${BORDER};` : ""}">
              <div style="display:flex; align-items:center; gap:6px; color:${MUTED}; font-size:11px; font-weight:600; margin-bottom:3px;">
                <span style="color:${PRIMARY};">${m.icon}</span> ${m.label}
              </div>
              <div style="font-size:14px; font-weight:800; color:${TXT};">${m.val}</div>
            </div>`,
            )
            .join("")}
        </div>

        <!-- ═══ BILL TO / BILL FROM ═══ -->
        <div style="display:flex; gap:14px; margin-bottom:16px;">
          <!-- BILL TO -->
          <div style="flex:1; border:1.5px solid ${BORDER}; border-radius:8px; overflow:hidden;">
            <div style="background:${PRIMARY}; color:white; padding:9px 16px;
              font-size:12px; font-weight:800; text-transform:uppercase;
              display:flex; align-items:center; gap:8px; letter-spacing:0.5px;">
              ${IC.user}&nbsp;BILL TO
            </div>
            <div style="padding:14px 16px;">${custHTML}</div>
          </div>
          <!-- BILL FROM -->
          <div style="flex:1; border:1.5px solid ${BORDER}; border-radius:8px; overflow:hidden;">
            <div style="background:${PRIMARY}; color:white; padding:9px 16px;
              font-size:12px; font-weight:800; text-transform:uppercase;
              display:flex; align-items:center; gap:8px; letter-spacing:0.5px;">
              ${IC.bldg}&nbsp;BILL FROM
            </div>
            <div style="padding:14px 16px;">${fromHTML}</div>
          </div>
        </div>

        <!-- ═══ ITEMS TABLE ═══ -->
        ${tableHTML}

        <!-- ═══ BOTTOM SECTION (Total in Words + Bank | Tax Summary) ═══ -->
        <div style="display:flex; gap:14px; margin-bottom:0; page-break-inside:avoid;">

          <!-- LEFT: Total in Words + Bank Details -->
          <div style="flex:1; display:flex; flex-direction:column; gap:14px;">

            <!-- Total in Words -->
            <div style="border:1.5px solid ${BORDER}; border-radius:8px; padding:14px 16px;">
              <div style="font-size:10.5px; font-weight:800; text-transform:uppercase;
                letter-spacing:0.5px; color:${TXT}; margin-bottom:8px;">Total in Words</div>
              <div style="font-size:11.5px; font-weight:600; color:${PRIMARY}; line-height:1.5;">
                ${totalWords}
              </div>
            </div>

            <!-- Bank Details -->
            <div style="border:1.5px solid ${BORDER}; border-radius:8px; padding:14px 16px;">
              <div style="display:flex; align-items:center; gap:8px;
                font-size:12px; font-weight:800; text-transform:uppercase;
                letter-spacing:0.5px; color:${TXT}; margin-bottom:10px;
                padding-bottom:8px; border-bottom:1px solid ${BORDER};">
                ${IC.bank}&nbsp;Bank Details
              </div>
              <table style="border-collapse:collapse; width:100%;">
                <tr><td style="padding:3px 0; font-size:11.5px; font-weight:700; color:${TXT}; width:130px;">Account Holder Name</td>
                    <td style="padding:3px 0; font-size:11.5px; color:${MUTED};">${BANK.accountName}</td></tr>
                <tr><td style="padding:3px 0; font-size:11.5px; font-weight:700; color:${TXT};">Bank Name</td>
                    <td style="padding:3px 0; font-size:11.5px; color:${MUTED};">${BANK.bankName}</td></tr>
                <tr><td style="padding:3px 0; font-size:11.5px; font-weight:700; color:${TXT};">Bank Account Number</td>
                    <td style="padding:3px 0; font-size:11.5px; color:${MUTED};">${BANK.accountNumber}</td></tr>
                <tr><td style="padding:3px 0; font-size:11.5px; font-weight:700; color:${TXT};">Bank Branch IFSC</td>
                    <td style="padding:3px 0; font-size:11.5px; color:${MUTED};">${BANK.ifsc}</td></tr>
              </table>
            </div>
          </div>

          <!-- RIGHT: Tax Summary + Computer Generated Notice -->
          <div style="flex:1; display:flex; flex-direction:column; gap:14px;">
            ${taxSummaryHTML}

            <!-- Computer Generated Notice -->
            <div style="border:1.5px solid ${BORDER}; border-radius:8px; padding:12px 16px;
              display:flex; align-items:center; gap:12px;">
              <span style="flex-shrink:0;">${IC.note}</span>
              <div style="font-size:11.5px; color:${MUTED}; line-height:1.6;">
                <span>This is computer generated invoice</span><br>
                <span>no signature required.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ FOOTER ═══ -->
        <div style="background:${PRIMARY}; color:white; padding:12px 20px;
          display:flex; justify-content:space-between; align-items:center;
          margin: 20px -40px 0 -40px;">
          <div style="display:flex; align-items:center; gap:20px; font-size:11.5px;">
            <span style="display:flex;align-items:center;gap:5px;">${IC.phone}&nbsp;${COMPANY.phone}</span>
            <span style="display:flex;align-items:center;gap:5px;">${IC.web}&nbsp;${COMPANY.website}</span>
            <span style="display:flex;align-items:center;gap:5px;">${IC.mail}&nbsp;${COMPANY.email}</span>
          </div>
          <div style="font-size:13px; font-weight:700; letter-spacing:0.3px;">
            Thank you for your business!
          </div>
        </div>
      `;

        // ── html2pdf options ──
        const opt = {
          margin: [0, 0, 0, 0],
          filename: `Invoice_${invoice.invoice_number || "draft"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        html2pdf()
          .from(el)
          .set(opt)
          .save()
          .then(() => toast.success("Download started!", { id: loadingToast }))
          .catch((err) => {
            console.error("html2pdf render error:", err);
            toast.error("Failed to render PDF.", { id: loadingToast });
          });
      })
      .catch((err) => {
        console.error("html2pdf.js import failed:", err);
        toast.error("Missing html2pdf.js module.", { id: loadingToast });
      });
  } catch (err) {
    console.error("generateInvoicePDF error:", err);
    toast.error("Failed to generate PDF.", { id: loadingToast });
  }
};
