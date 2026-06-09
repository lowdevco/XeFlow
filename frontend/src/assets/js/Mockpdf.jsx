import BG from "../image/invoice-template.png";
import { COMPANY } from "../info/company.js";
import { BANK } from "../info/bank.js";

export default function InvoicePreview() {
  const invoice = {
    invoiceNumber: "INV-001",
    invoiceDate: "23/05/2026",
    invoiceMonth: "May 2026",
    placeOfSupply: "Kerala",

    customer: {
      name: "Acme Technologies Pvt Ltd",
      address: "Infopark, Kochi",
      phone: "+91 9876543210",
      email: "contact@acme.com",
      gstin: "32ABCDE1234F1Z5",
    },

    company: {
      name: "Xeflow Technologies",
      address: "Kalpetta, Wayanad",
      phone: "+91 9746905919",
      email: "admin@xeflow.com",
      gstin: "32BEDPT5030H1ZR",
    },

    items: [
      {
        description: "Website Development",
        qty: 1,
        rate: 25000,
        total: 25000,
      },
      {
        description: "Hosting & Maintenance",
        qty: 1,
        rate: 5000,
        total: 5000,
      },
    ],

    totalWords: "Thirty Thousand Rupees Only",
  };

  return (
    <div className="flex justify-center bg-slate-200 py-10">
      <div className="relative w-[794px] h-[1123px] bg-white shadow-xl overflow-hidden">
        {/* Background Template */}
        <img
          src={BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Invoice Header */}
        <div className="flex absolute text-sm font-bold gap-[132px] top-[195px] left-[79px]">
          <div>{invoice.invoiceNumber}</div>
          <div>{invoice.invoiceDate}</div>
          <div>{invoice.invoiceMonth}</div>
          <div>{invoice.placeOfSupply}</div>
        </div>

        {/* Year */}
        <div className="absolute top-[100px] left-[690px]">
          <h1 className="font-semibold scale-260 text-[#2158A9]">2026</h1>
        </div>

        {/* Bill To */}
        <div className="absolute top-[275px] left-[50px] w-[270px] text-xs p-2 space-y-2">
          <p className="font-semibold flex gap-8">
            <strong>Name:</strong>
            {invoice.customer.name}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>GSTIN:</strong>
            {invoice.customer.gstin}
          </p>
          <p className="font-semibold flex gap-6">
            <strong>Address:</strong>
            {invoice.customer.address}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>Phone:</strong>
            {invoice.customer.phone}
          </p>
          <p className="font-semibold flex gap-6">
            <strong>Website:</strong>
            {invoice.customer.website}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>Email:</strong>
            {invoice.customer.email}
          </p>
        </div>

        {/* Bill From */}
        <div className="absolute top-[275px] left-[450px] w-[270px] p-2 text-xs space-y-2">
          <p className="font-semibold flex gap-8">
            <strong>Name:</strong>
            {COMPANY.name}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>GSTIN:</strong>
            {COMPANY.gstin}
          </p>
          <div className="font-semibold flex gap-6">
            <strong>Address:</strong>
            <span className="text-xs">{COMPANY.address}</span>
          </div>
          <p className="font-semibold flex gap-8">
            <strong>Phone:</strong>
            {COMPANY.phone}
          </p>
          <p className="font-semibold flex gap-6">
            <strong>Website:</strong>
            {COMPANY.website}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>Email:</strong>
            {COMPANY.email}
          </p>
        </div>

        {/* ITEMS TABLE */}
        {(() => {
          const HSN_SAC_CODE = "998314";
          const taxType = (invoice.tax_type || "GST").toUpperCase();
          const isGST = taxType === "GST";
          const isIGST = taxType === "IGST";
          const isNoGST = taxType === "NO_GST";
          const cgstRate = Number(invoice.cgst_rate || 9);
          const sgstRate = Number(invoice.sgst_rate || 9);
          const igstRate = Number(invoice.igst_rate || 18);
          const items = invoice.items || [];
          let totalTaxable = 0;
          let totalCGST = 0;
          let totalSGST = 0;
          let totalIGST = 0;
          let grandTotal = 0;

          const fmt = (num) =>
            Number(num || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

          const rows = items.map((item) => {
            const qty = Number(item.qty || item.quantity || 1);
            const rate = Number(item.rate || 0);
            const taxableValue = qty * rate;
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

            totalTaxable += taxableValue;
            totalCGST += cgstAmount;
            totalSGST += sgstAmount;
            totalIGST += igstAmount;
            grandTotal += lineTotal;

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

          return (
            <div className="absolute top-[485px] left-[20px] w-[755px]">
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

                      return displayRows.map((item, index) => {
                        const isLastRow = index === displayRows.length - 1;
                        const borderClass = `border-l border-r border-[#d6dee9] ${
                          isLastRow ? "border-b" : ""
                        }`;

                        return (
                          <tr key={index} style={{ height: "38px" }}>
                            <td
                              className={`${borderClass} px-2 text-center text-[11px]`}
                            >
                              {item.description ? index + 1 : ""}
                            </td>
                            <td
                              className={`
                                ${borderClass}
                                px-3
                                text-xs
                                leading-5
                                whitespace-normal
                                break-words
                                align-top
                                pt-3
                              `}
                            >
                              {item.description}
                            </td>
                            <td
                              className={`${borderClass} px-2 text-center text-[11px]`}
                            >
                              {item.description ? HSN_SAC_CODE : ""}
                            </td>
                            <td
                              className={`${borderClass} px-2 text-center text-[11px]`}
                            >
                              {item.qty}
                            </td>
                            <td
                              className={`${borderClass} px-2 text-right text-[11px] whitespace-nowrap`}
                            >
                              {item.rate !== "" ? fmt(item.rate) : ""}
                            </td>
                            <td
                              className={`${borderClass} px-2 text-right text-[11px] whitespace-nowrap`}
                            >
                              {item.taxableValue !== ""
                                ? fmt(item.taxableValue)
                                : ""}
                            </td>
                            {isGST && (
                              <>
                                <td
                                  className={`${borderClass} px-2 text-center text-[11px]`}
                                >
                                  {item.description ? `${cgstRate}%` : ""}
                                </td>
                                <td
                                  className={`${borderClass} px-2 text-right text-[11px] whitespace-nowrap`}
                                >
                                  {item.cgstAmount !== ""
                                    ? fmt(item.cgstAmount)
                                    : ""}
                                </td>
                                <td
                                  className={`${borderClass} px-2 text-center text-[11px]`}
                                >
                                  {item.description ? `${sgstRate}%` : ""}
                                </td>
                                <td
                                  className={`${borderClass} px-2 text-right text-[11px] whitespace-nowrap`}
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
                                  className={`${borderClass} px-2 text-center text-[11px]`}
                                >
                                  {item.description ? `${igstRate}%` : ""}
                                </td>
                                <td
                                  className={`${borderClass} px-2 text-right text-[11px] whitespace-nowrap`}
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
                                  className={`${borderClass} px-2 text-center text-[11px]`}
                                >
                                  {item.description ? "0%" : ""}
                                </td>
                                <td
                                  className={`${borderClass} px-2 text-right text-[11px] whitespace-nowrap`}
                                >
                                  {item.description ? "0.00" : ""}
                                </td>
                              </>
                            )}
                            <td
                              className={`${borderClass} px-2 text-center text-[11px] font-semibold whitespace-nowrap`}
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
                      <td className="bg-[#eef2f7] border border-[#d6dee9] text-right font-bold text-[11px] px-2 whitespace-nowrap">
                        {fmt(totalTaxable)}
                      </td>
                      {isGST && (
                        <>
                          <td className="bg-[#eef2f7] border border-[#d6dee9]" />
                          <td className="bg-[#eef2f7] border border-[#d6dee9] text-right font-bold text-[11px] px-2 whitespace-nowrap">
                            {fmt(totalCGST)}
                          </td>
                          <td className="bg-[#eef2f7] border border-[#d6dee9]" />
                          <td className="bg-[#eef2f7] border border-[#d6dee9] text-right font-bold text-[11px] px-2 whitespace-nowrap">
                            {fmt(totalSGST)}
                          </td>
                        </>
                      )}
                      {isIGST && (
                        <>
                          <td className="bg-[#eef2f7] border border-[#d6dee9]" />
                          <td className="bg-[#eef2f7] border border-[#d6dee9] text-right font-bold text-[11px] px-2 whitespace-nowrap">
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
                      <td className="bg-[#eef2f7] border border-[#d6dee9] text-center font-bold text-[11px] px-2 whitespace-nowrap">
                        {fmt(grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Total In Words */}
        <div className="absolute top-[840px] left-[70px] w-[280px]">
          <p className="text-sm font-bold uppercase">{invoice.totalWords}</p>
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

        {/* Tax Summary */}
        
        <div className="absolute top-[820px] right-[45px] w-[280px]">
          <table className="w-full text-sm border">
            <tbody>
              <tr>
                <td className="border p-2">Taxable Amount</td>
                <td className="border p-2 text-right">₹30,000</td>
              </tr>
              <tr>
                <td className="border p-2">CGST</td>
                <td className="border p-2 text-right">₹0</td>
              </tr>
              <tr>
                <td className="border p-2">SGST</td>
                <td className="border p-2 text-right">₹0</td>
              </tr>
              <tr className="bg-blue-700 text-white font-bold">
                <td className="p-2">Grand Total</td>
                <td className="p-2 text-right">₹30,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
