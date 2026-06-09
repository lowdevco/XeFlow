import BG from "../image/invoice-template.png";
import { COMPANY } from "../info/company.js";

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

    bank: {
      accountName: "Xeflow Technologies",
      bankName: "Federal Bank",
      accountNumber: "10690100173612",
      ifsc: "FDRL0001069",
    },
  };

  return (
    <div className="flex justify-center bg-slate-200 py-10">
      <div
        className="
          relative
          w-[794px]
          h-[1123px]
          bg-white
          shadow-xl
          overflow-hidden
        "
      >
        {/* Background Template */}
        <img
          src={BG}
          alt=""
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            pointer-events-none
          "
        />
        {/* Invoice Header */}
        <div className="flex absolute text-sm font-bold gap-[132px] top-[195px] left-[79px]">
          <div>{invoice.invoiceNumber}</div>

          <div>{invoice.invoiceDate}</div>

          <div>{invoice.invoiceMonth}</div>

          <div>{invoice.placeOfSupply}</div>
        </div>

        {/* Bill To */}

        <div
          className="
            absolute
            top-[275px]
            left-[50px]
            w-[270px]
            text-xs
            p-2
            space-y-2
          "
        >
          <p className="font-semibold flex gap-8">
            <strong>Name:</strong>
            {invoice.customer.name}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>GSTIN:</strong>
            {invoice.customer.gstin}
          </p>
          <p className="font-semibold flex gap-6">
            <strong>Address:</strong> {invoice.customer.address}
          </p>
          <p className="font-semibold flex gap-8">
            {" "}
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

        <div
          className="
            absolute
            top-[275px]
            left-[450px]
            w-[270px]
            p-2
            text-xs
            space-y-2
          "
        >
          <p className="font-semibold flex gap-8">
            <strong>Name:</strong>
            {COMPANY.name}
          </p>
          <p className="font-semibold flex gap-8">
            <strong>GSTIN:</strong> {COMPANY.gstin}
          </p>
          <p className="font-semibold flex gap-6">
            <strong>Address:</strong>{" "}
            <p className=" text-xs">{COMPANY.address}</p>
          </p>
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

        {/* Items Table */}
        <div
          className="
            absolute
            top-[485px]
            left-[40px]
            w-[715px]
          "
        >
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="border p-2">SL</th>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">Total</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>

                  <td className="border p-2">{item.description}</td>

                  <td className="border p-2 text-center">{item.qty}</td>

                  <td className="border p-2 text-right">₹{item.rate}</td>

                  <td className="border p-2 text-right">₹{item.total}</td>
                </tr>
              ))}

              <tr className="font-bold">
                <td colSpan={4} className="border p-2 text-right">
                  Grand Total
                </td>

                <td className="border p-2 text-right">₹30,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Total In Words */}
        <div
          className="
            absolute
            top-[850px]
            left-[60px]
            w-[280px]
          "
        >
          <p className="text-xs font-bold uppercase mb-2">Total In Words</p>

          <p className="text-sm">{invoice.totalWords}</p>
        </div>
        {/* Bank Details */}
        <div
          className="
            absolute
            top-[980px]
            left-[60px]
            w-[320px]
            text-sm
            space-y-2
          "
        >
          <p>
            <strong>Account Name:</strong> {invoice.bank.accountName}
          </p>

          <p>
            <strong>Bank:</strong> {invoice.bank.bankName}
          </p>

          <p>
            <strong>Account Number:</strong> {invoice.bank.accountNumber}
          </p>

          <p>
            <strong>IFSC:</strong> {invoice.bank.ifsc}
          </p>
        </div>
        {/* Tax Summary */}
        <div
          className="
            absolute
            top-[820px]
            right-[45px]
            w-[280px]
          "
        >
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
