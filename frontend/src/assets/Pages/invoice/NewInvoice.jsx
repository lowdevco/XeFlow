import { useState, useEffect, useMemo,  } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiDownload, FiSend, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../js/api";



// Const Values

import Xeventure_Logo from "../../image/Xeventure.png";
const GSTIN = "32ABCDE1234F1Z5";

//_______________________________


const NewInvoice = () => {

  const navigate = useNavigate();

  //  State For Invoice Data Fetching From Database
  const [dbCustomers, setDbCustomers] = useState([]);
  const [dbServices, setDbServices] = useState([]);

  // ─── STATE: INVOICE DETAILS ─────────────
  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000),
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15))
      .toISOString()
      .split("T")[0],
    notes: "Thank you for your business!",
    terms: "Payment is due within 15 days.",
  });

  //  States For Selected Data From Drop Down
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [lineItems, setLineItems] = useState([
    {
      id: Date.now(),
      service_id: "",
      description: "",
      quantity: "1",
      rate: "",
      amount: 0,
    },
  ]);

  //  Financial State
  
  const [cgstRate, setCgstRate] = useState("9");
  const [sgstRate, setSgstRate] = useState("9");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [amountPaid, setAmountPaid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //  Initial Data Fetching From Data Base

  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [custRes, servRes] = await Promise.all([
          fetchWithAuth("/customers/", { method: "GET" }),
          fetchWithAuth("/services/", { method: "GET" }),
        ]);

        if (custRes.ok) setDbCustomers(await custRes.json());
        if (servRes.ok) setDbServices(await servRes.json());
      } catch (error) {
        console.error("Failed to load DB data:", error);
      }
    };
    loadInitialData();
  }, []);

  //  Line Item Handler

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now(),
        service_id: "",
        description: "",
        quantity: "1",
        rate: "",
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (idToRemove) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== idToRemove));
    }
  };

  const handleLineItemChange = (id, field, value) => {
    const updatedItems = lineItems.map((item) => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };

        // Autofill from Data Base

        if (field === "service_id") {
          const selectedService = dbServices.find(
            (s) => s.id.toString() === value,
          );
          if (selectedService) {
            updatedItem.description = selectedService.name;
            updatedItem.rate = selectedService.price;
          }
        }

        // Safely calculate amount ignoring empty strings

        const safeQty = parseFloat(updatedItem.quantity) || 0;
        const safeRate = parseFloat(updatedItem.rate) || 0;
        updatedItem.amount = safeQty * safeRate;

        return updatedItem;
      }
      return item;
    });
    setLineItems(updatedItems);
  };


  // Invoice Math Engine 

  
  const {
    subtotal,
    discountAmount,
    cgstAmount,
    sgstAmount,
    total,
    balanceDue,
  } = useMemo(() => {
    const calcSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

    const safeDiscount = parseFloat(discount) || 0;
    const safeCgstRate = parseFloat(cgstRate) || 0;
    const safeSgstRate = parseFloat(sgstRate) || 0;
    const safeAmountPaid = parseFloat(amountPaid) || 0;

    // Calculate Discount


    let calcDiscount = 0;
    if (discountType === "percent") {
      calcDiscount = calcSubtotal * (safeDiscount / 100);
    } else {
      calcDiscount = safeDiscount;
    }

    // GST  calculated on the amount AFTER discount

    const taxableAmount = calcSubtotal - calcDiscount;
    const calcCgst = taxableAmount * (safeCgstRate / 100);
    const calcSgst = taxableAmount * (safeSgstRate / 100);

    const calcTotal = taxableAmount + calcCgst + calcSgst;
    const calcBalance = calcTotal - safeAmountPaid;

    return {
      subtotal: calcSubtotal,
      discountAmount: calcDiscount,
      cgstAmount: calcCgst,
      sgstAmount: calcSgst,
      total: calcTotal,
      balanceDue: calcBalance,
    };
  }, [lineItems, cgstRate, sgstRate, discount, discountType, amountPaid]);

  // Currency Formatterr 

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };


  //  Invoice Save to Data basse Handler


  const handleSaveDraft = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer before saving.");
      return;
    }
    if (lineItems.length === 0 || lineItems[0].description === "") {
      toast.error("Please add at least one valid line item.");
      return;
    }

    const toastId = toast.loading("Saving invoice...");
    setIsSubmitting(true);

    const payload = {
      customer: selectedCustomer.id,
      invoice_number: invoiceMeta.invoiceNumber,
      issue_date: invoiceMeta.issueDate,
      due_date: invoiceMeta.dueDate,
      status: "Draft",
      notes: invoiceMeta.notes,
      terms: invoiceMeta.terms,

      subtotal: subtotal,
      discount_amount: discountAmount,
      cgst_rate: parseFloat(cgstRate) || 0,
      sgst_rate: parseFloat(sgstRate) || 0,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      total_amount: total,
      amount_paid: parseFloat(amountPaid) || 0,
      balance_due: balanceDue,
      items: lineItems.map((item) => ({
        service: item.service_id ? parseInt(item.service_id) : null,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        amount: item.amount,
      })),
    };

    try {
      const response = await fetchWithAuth("/invoices/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Invoice created successfully!", { id: toastId });
        navigate("/invoice/view"); 
      } else {
        const errorData = await response.json();
        console.error("Django Error:", errorData);
        toast.error("Failed to create invoice. Check console.", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Network error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">

      {/* ── TOP ACTION BAR  */}

      <div className="max-w-5xl mx-auto flex flex-wrap justify-end gap-3 mb-8">
        <button
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-all disabled:opacity-50"
        >
          <FiSave size={16} /> {isSubmitting ? "Saving..." : "Save Draft"}
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-all">
          <FiDownload size={16} /> Download
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-xeflow-brand text-white hover:opacity-90 font-semibold text-sm transition-all shadow-sm">
          <FiSend size={16} /> Send Invoice
        </button>
      </div>

      {/* ── INVOICE PAPER FORM  */}

      <div className="max-w-5xl mx-auto bg-xeflow-surface p-6 md:p-12 lg:p-16 rounded-2xl shadow-xl border border-xeflow-border text-xeflow-text transition-colors duration-300">

        {/* Header Section */}

        <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-xeflow-border pb-10 mb-10">

          {/* Static From Details (Xeventure) */}

          <div className="w-full md:w-1/2 space-y-4">
            <img
              src={Xeventure_Logo}
              alt="Xeventure Logo"
              className="w-auto h-24 pl-13 md:h-32 scale-500"
            />
            <div className="text-sm text-xeflow-muted space-y-1 mt-2">
              <p>123 Tech Park, Cyber Hub</p>
              <p>Kerala, India 673592</p>
              <p>Email: billing@xeventure.com</p>
              <p>Phone: +91 98765 43210</p>
              <p className="font-bold text-xeflow-text pt-2">GSTIN: {GSTIN}</p>
            </div>
          </div>

          {/* Invoice Meta Data */}

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
                  value={invoiceMeta.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceMeta({
                      ...invoiceMeta,
                      invoiceNumber: e.target.value,
                    })
                  }
                  className="text-right font-bold w-32 bg-transparent outline-none border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-sm font-semibold text-xeflow-muted uppercase">
                  Issue Date
                </span>
                <input
                  type="date"
                  value={invoiceMeta.issueDate}
                  onChange={(e) =>
                    setInvoiceMeta({
                      ...invoiceMeta,
                      issueDate: e.target.value,
                    })
                  }
                  className="text-right text-sm text-xeflow-text bg-transparent outline-none cursor-pointer border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-sm font-semibold text-xeflow-muted uppercase">
                  Due Date
                </span>
                <input
                  type="date"
                  value={invoiceMeta.dueDate}
                  onChange={(e) =>
                    setInvoiceMeta({ ...invoiceMeta, dueDate: e.target.value })
                  }
                  className="text-right text-sm text-xeflow-text bg-transparent outline-none cursor-pointer border-b border-transparent hover:border-xeflow-border focus:border-xeflow-brand pb-1 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BILL TO SECTION*/}
        <div className="mb-10">
          <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-3 border-b border-xeflow-border pb-2 inline-block">
            Billed To
          </h3>
          <div className="max-w-md space-y-3">
            <select
              className="w-full text-lg font-bold bg-xeflow-bg border border-xeflow-border rounded-lg p-3 outline-none focus:border-xeflow-brand transition-colors cursor-pointer"
              onChange={(e) => {
                const customer = dbCustomers.find(
                  (c) => c.id.toString() === e.target.value,
                );
                setSelectedCustomer(customer || null);
              }}
              value={selectedCustomer?.id || ""}
            >
              <option value="">-- Select a Customer --</option>
              {dbCustomers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.company_name} ({cust.rep_name})
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="p-4 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-muted space-y-1.5 shadow-sm">
                <p>
                  <span className="font-bold text-xeflow-text">Attn:</span>{" "}
                  {selectedCustomer.rep_name}
                </p>
                <p>
                  <span className="font-bold text-xeflow-text">Email:</span>{" "}
                  {selectedCustomer.email}
                </p>
                <p>
                  <span className="font-bold text-xeflow-text">Phone:</span>{" "}
                  {selectedCustomer.phone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mb-12">
          <div className="grid grid-cols-12 gap-4 pb-3 border-b-2 border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider">
            <div className="col-span-6">Service / Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <div className="space-y-3 pt-4">
            {lineItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 items-center group bg-xeflow-bg/30 p-2 rounded-lg border border-transparent hover:border-xeflow-border transition-colors"
              >
                <div className="col-span-6 flex flex-col gap-1.5">
                  <select
                    value={item.service_id}
                    onChange={(e) =>
                      handleLineItemChange(
                        item.id,
                        "service_id",
                        e.target.value,
                      )
                    }
                    className="w-full text-sm font-bold bg-transparent border-b border-xeflow-border outline-none focus:border-xeflow-brand pb-1 text-xeflow-text cursor-pointer"
                  >
                    <option value="">-- Custom Item --</option>
                    {dbServices.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Additional details..."
                    value={item.description}
                    onChange={(e) =>
                      handleLineItemChange(
                        item.id,
                        "description",
                        e.target.value,
                      )
                    }
                    className="w-full text-xs text-xeflow-muted bg-transparent outline-none pb-1"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLineItemChange(item.id, "quantity", e.target.value)
                    }
                    className="w-full text-right text-sm bg-xeflow-bg border border-xeflow-border rounded p-2 outline-none focus:border-xeflow-brand transition-colors"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.rate}
                    onChange={(e) =>
                      handleLineItemChange(item.id, "rate", e.target.value)
                    }
                    className="w-full text-right text-sm bg-xeflow-bg border border-xeflow-border rounded p-2 outline-none focus:border-xeflow-brand transition-colors"
                  />
                </div>

                <div className="col-span-2 text-right text-sm font-bold relative flex items-center justify-end gap-3">
                  {formatMoney(item.amount)}
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="text-xeflow-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addLineItem}
            className="flex items-center gap-2 text-sm font-bold text-xeflow-brand hover:opacity-80 mt-4 transition-colors p-2 hover:bg-xeflow-brand/10 rounded-lg"
          >
            <FiPlus size={16} /> Add Line Item
          </button>
        </div>

        {/* ── BOTTOM SUMMARY SECTION ── */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">

          {/* Notes and  Terms Section  */}

          <div className="flex flex-col gap-6">
            <div className="flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-2">
                Notes
              </h3>
              <textarea
                value={invoiceMeta.notes}
                onChange={(e) =>
                  setInvoiceMeta({ ...invoiceMeta, notes: e.target.value })
                }
                className="w-full flex-1 bg-xeflow-bg border border-xeflow-border rounded-xl p-4 text-sm text-xeflow-text outline-none focus:border-xeflow-brand resize-none transition-colors custom-scrollbar min-h-[120px]"
              ></textarea>
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-xeflow-muted uppercase mb-2">
                Terms & Conditions
              </h3>
              <textarea
                value={invoiceMeta.terms}
                onChange={(e) =>
                  setInvoiceMeta({ ...invoiceMeta, terms: e.target.value })
                }
                className="w-full flex-1 bg-xeflow-bg border border-xeflow-border rounded-xl p-4 text-sm text-xeflow-text outline-none focus:border-xeflow-brand resize-none transition-colors custom-scrollbar min-h-[120px]"
              ></textarea>
            </div>
          </div>

          {/* ── TOTALS ENGINE ── */}
          
          <div className="w-full space-y-4 bg-xeflow-bg p-6 md:p-8 rounded-2xl border border-xeflow-border flex flex-col justify-center">
            <div className="flex justify-between items-center text-sm">
              <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                Subtotal
              </span>
              <span className="font-bold text-xeflow-text">
                {formatMoney(subtotal)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-xeflow-muted font-bold uppercase tracking-wide flex items-center gap-2">
                Discount
                <button
                  onClick={() =>
                    setDiscountType(
                      discountType === "percent" ? "amount" : "percent",
                    )
                  }
                  className="text-[10px] font-bold uppercase bg-xeflow-brand/10 text-xeflow-brand px-1.5 py-0.5 rounded-md hover:bg-xeflow-brand/20 transition-colors"
                >
                  {discountType === "percent" ? "%" : "₹"}
                </button>
              </span>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 bg-xeflow-surface text-right border border-xeflow-border rounded-md p-1.5 outline-none font-bold focus:border-xeflow-brand transition-colors text-xeflow-text"
              />
            </div>

            {parseFloat(discount) > 0 && (
              <div className="flex justify-between items-center text-sm text-xeflow-brand">
                <span className="font-bold uppercase tracking-wide">
                  Discount Applied
                </span>
                <span className="font-bold">
                  -{formatMoney(discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-xeflow-muted font-bold uppercase tracking-wide flex items-center gap-2">
                CGST (%)
                <input
                  type="number"
                  min="0"
                  value={cgstRate}
                  onChange={(e) => setCgstRate(e.target.value)}
                  className="w-14 bg-xeflow-surface border border-xeflow-border rounded-md p-1.5 text-center outline-none focus:border-xeflow-brand transition-colors text-xeflow-text font-bold"
                />
              </span>
              <span className="font-bold text-xeflow-text">
                {formatMoney(cgstAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm pb-3 border-b border-xeflow-border">
              <span className="text-xeflow-muted font-bold uppercase tracking-wide flex items-center gap-2">
                SGST (%)
                <input
                  type="number"
                  min="0"
                  value={sgstRate}
                  onChange={(e) => setSgstRate(e.target.value)}
                  className="w-14 bg-xeflow-surface border border-xeflow-border rounded-md p-1.5 text-center outline-none focus:border-xeflow-brand transition-colors text-xeflow-text font-bold"
                />
              </span>
              <span className="font-bold text-xeflow-text">
                {formatMoney(sgstAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black text-xeflow-text uppercase tracking-wide">
                Total
              </span>
              <span className="text-lg font-black text-xeflow-text">
                {formatMoney(total)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm pt-4 border-b border-xeflow-border pb-5">
              <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                Amount Paid
              </span>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-24 bg-xeflow-surface text-right border border-xeflow-border rounded-md p-1.5 outline-none text-green-500 font-bold focus:border-xeflow-brand transition-colors"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-xeflow-text uppercase tracking-wide">
                Balance Due
              </span>
              <span className="text-xl font-black text-xeflow-brand">
                {formatMoney(balanceDue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
