
import {
  FiPlus,
  FiTrash2,
  FiDownload,
  FiSend,
  FiUpload,
  FiSave,
} from "react-icons/fi";

const NewInvoice = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
      {/* Top Action Bar */}
      <div className="max-w-5xl mx-auto flex flex-wrap justify-end gap-3 mb-8">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-all">
          <FiSave size={16} /> Save Draft
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-all">
          <FiDownload size={16} /> Download
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-xeflow-brand text-white hover:opacity-90 font-semibold text-sm transition-all shadow-sm">
          <FiSend size={16} /> Send Invoice
        </button>
      </div>

      {/* Invoice Paper Form */}
      <div className="max-w-5xl mx-auto bg-xeflow-surface p-8 md:p-16 rounded-xl shadow-xl border border-xeflow-border text-xeflow-text transition-colors duration-300">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-xeflow-border pb-10 mb-10">
          {/* From Details */}
          <div className="w-full md:w-1/2 space-y-2">
            <div className="w-24 h-24 bg-xeflow-bg border-2 border-dashed border-xeflow-border rounded-xl flex flex-col items-center justify-center text-xeflow-muted cursor-pointer hover:bg-xeflow-brand/5 hover:border-xeflow-brand/50 transition-colors mb-6">
              <FiUpload size={24} />
              <span className="text-[10px] font-bold uppercase mt-2">Logo</span>
            </div>
            <input
              type="text"
              placeholder="Your Company Name"
              defaultValue="XeFlow Technologies"
              className="w-full text-2xl font-bold bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
            />
            <input
              type="text"
              placeholder="Company Address"
              className="w-full text-sm text-xeflow-muted bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
            />
            <input
              type="text"
              placeholder="Email Address"
              className="w-full text-sm text-xeflow-muted bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
            />
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Phone Number"
                className="w-1/2 text-sm text-xeflow-muted bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
              />
              <input
                type="text"
                placeholder="GST Number"
                className="w-1/2 text-sm text-xeflow-muted bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
              />
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="w-full md:w-1/3 text-left md:text-right space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-xeflow-border uppercase tracking-widest">
              Invoice
            </h1>
            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-center gap-4">
                <span className="text-sm font-semibold text-xeflow-muted uppercase">
                  Invoice #
                </span>
                <input
                  type="text"
                  placeholder="INV-001"
                  defaultValue="INV-2024-001"
                  className="text-right font-bold w-32 bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-sm font-semibold text-xeflow-muted uppercase">
                  Issue Date
                </span>
                <input
                  type="date"
                  className="text-right text-sm text-xeflow-text bg-transparent outline-none cursor-pointer border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-sm font-semibold text-xeflow-muted uppercase">
                  Due Date
                </span>
                <input
                  type="date"
                  className="text-right text-sm text-xeflow-text bg-transparent outline-none cursor-pointer border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-10">
          <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-3 border-b border-xeflow-border pb-2 inline-block">
            Billed To
          </h3>
          <div className="max-w-sm space-y-2">
            <input
              type="text"
              placeholder="Client Name"
              className="w-full text-lg font-bold bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
            />
            <input
              type="text"
              placeholder="Client Address"
              className="w-full text-sm text-xeflow-text bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
            />
            <input
              type="text"
              placeholder="Client Email"
              className="w-full text-sm text-xeflow-text bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
            />
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Phone"
                className="w-1/2 text-sm text-xeflow-text bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
              />
              <input
                type="text"
                placeholder="Tax ID / GST"
                className="w-1/2 text-sm text-xeflow-text bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-10">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-3 border-b-2 border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {/* Table Rows (Static Examples) */}
          <div className="space-y-3 pt-4">
            {/* Row 1 */}
            <div className="grid grid-cols-12 gap-4 items-center group">
              <div className="col-span-6">
                <input
                  type="text"
                  placeholder="Item description..."
                  defaultValue="Web Development Services"
                  className="w-full text-sm font-medium bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="1"
                  defaultValue="1"
                  className="w-full text-right text-sm bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="0.00"
                  defaultValue="1500.00"
                  className="w-full text-right text-sm bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="col-span-2 text-right text-sm font-medium relative">
                $1,500.00
                <button className="absolute -right-8 top-1/2 -translate-y-1/2 text-xeflow-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-12 gap-4 items-center group">
              <div className="col-span-6">
                <input
                  type="text"
                  placeholder="Item description..."
                  defaultValue="Server Hosting (1 Year)"
                  className="w-full text-sm font-medium bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="1"
                  defaultValue="12"
                  className="w-full text-right text-sm bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="0.00"
                  defaultValue="50.00"
                  className="w-full text-right text-sm bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="col-span-2 text-right text-sm font-medium relative">
                $600.00
                <button className="absolute -right-8 top-1/2 -translate-y-1/2 text-xeflow-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 text-sm font-bold text-xeflow-brand hover:opacity-80 mt-6 transition-colors">
            <FiPlus size={16} /> Add Line Item
          </button>
        </div>

        {/* Bottom Summary Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Notes & Terms */}
          <div className="w-full md:w-1/2 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-2">
                Notes
              </h3>
              <textarea
                placeholder="Thanks for your business..."
                className="w-full bg-xeflow-bg border border-xeflow-border rounded-lg p-3 text-sm text-xeflow-text outline-none focus:border-xeflow-brand resize-none h-20 transition-colors"
              ></textarea>
            </div>
            <div>
              <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-2">
                Terms & Conditions
              </h3>
              <textarea
                placeholder="Payment is due within 15 days..."
                className="w-full bg-xeflow-bg border border-xeflow-border rounded-lg p-3 text-sm text-xeflow-text outline-none focus:border-xeflow-brand resize-none h-20 transition-colors"
              ></textarea>
            </div>
          </div>

          {/* Totals */}
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-xeflow-muted font-medium">Subtotal</span>
              <span className="font-semibold">$2,100.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-xeflow-muted font-medium flex items-center gap-2">
                Tax (%){" "}
                <input
                  type="number"
                  placeholder="0"
                  defaultValue="10"
                  className="w-12 border-b border-xeflow-border text-center outline-none bg-transparent pb-1 focus:border-xeflow-brand transition-colors"
                />
              </span>
              <span className="font-semibold">$210.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-xeflow-muted font-medium">Discount</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-24 text-right border-b border-xeflow-border outline-none bg-transparent font-semibold pb-1 focus:border-xeflow-brand transition-colors"
              />
            </div>

            <div className="flex justify-between items-center border-t-2 border-xeflow-border pt-3 mt-3">
              <span className="text-lg font-black text-xeflow-text">Total</span>
              <span className="text-lg font-black text-xeflow-text">
                $2,310.00
              </span>
            </div>

            <div className="flex justify-between items-center text-sm pt-2 border-b border-xeflow-border pb-4">
              <span className="text-xeflow-muted font-medium">Amount Paid</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-24 text-right border-b border-xeflow-border outline-none bg-transparent text-green-500 font-semibold pb-1 focus:border-xeflow-brand transition-colors"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-xeflow-text">
                Balance Due
              </span>
              <span className="text-xl font-black text-xeflow-brand">
                $2,310.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
