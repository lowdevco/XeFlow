import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiDownload, FiSend, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../js/api";
import { generateInvoicePDF } from "../../js/PDF_template";
import SendEmailModal from "../../components/SendEmailModal";
import CustomSelect from "../../components/CustomSelect";

// Const Values

import { COMPANY } from "../../info/company";
import { BANK } from "../../info/bank";

const NewInvoice = () => {
  const navigate = useNavigate();
  const [emailInvoice, setEmailInvoice] = useState(null);

  //  State For Invoice Data Fetching From Database
  const [dbCustomers, setDbCustomers] = useState([]);
  const [dbServices, setDbServices] = useState([]);

  //  STATE: INVOICE DETAILS
  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNumber: "INV-0001",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15))
      .toISOString()
      .split("T")[0],
    notes: "",
    terms: "",
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

  const [taxType, setTaxType] = useState("No GST");
  const [igstRate, setIgstRate] = useState("18");
  const [cgstRate, setCgstRate] = useState("9");
  const [sgstRate, setSgstRate] = useState("9");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [amountPaid, setAmountPaid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerOptions = useMemo(() => {
    return [
      { value: "", label: "-- Select a Customer --" },
      ...dbCustomers.map((cust) => ({
        value: cust.id.toString(),
        label: `${cust.company_name} (Attn: ${cust.rep_name}, Email: ${cust.email}, Phone: ${cust.phone}${cust.address ? `, Address: ${cust.address}` : ""})`,
      })),
    ];
  }, [dbCustomers]);

  const serviceOptions = useMemo(() => {
    return [
      { value: "", label: "-- Custom Item --" },
      ...dbServices.map((srv) => ({
        value: srv.id.toString(),
        label: srv.name,
      })),
    ];
  }, [dbServices]);

  const taxTypeOptions = useMemo(() => {
    return [
      { value: "GST", label: "GST (CGST/SGST)" },
      { value: "IGST", label: "IGST" },
      { value: "No GST", label: "No GST" },
    ];
  }, []);

  //  Initial Data Fetching From Data Base

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [custRes, servRes, invRes] = await Promise.all([
          fetchWithAuth("/customers/", { method: "GET" }),
          fetchWithAuth("/services/", { method: "GET" }),
          fetchWithAuth("/invoices/", { method: "GET" }),
        ]);

        if (custRes.ok) setDbCustomers(await custRes.json());
        if (servRes.ok) setDbServices(await servRes.json());

        if (invRes.ok) {
          const invoices = await invRes.json();
          let maxNum = 0;
          invoices.forEach((inv) => {
            if (inv.invoice_number) {
              const match = inv.invoice_number.match(/INV-(\d+)/i);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) {
                  maxNum = num;
                }
              }
            }
          });
          const nextNum = maxNum + 1;
          const formattedNum = "INV-" + String(nextNum).padStart(4, "0");
          setInvoiceMeta((prev) => ({
            ...prev,
            invoiceNumber: formattedNum,
          }));
        }
      } catch (error) {
        console.error("Failed to load DB data:", error);
      }
    };
    loadInitialData();
  }, []);

  //  Line Item Handler

  const addLineItem = () => {
    if (lineItems.length >= 5) {
      toast.error("Maximum 5 service lines allowed per invoice.");
      return;
    }
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
    igstAmount,
    total,
    balanceDue,
  } = useMemo(() => {
    const calcSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

    const safeDiscount = parseFloat(discount) || 0;
    const safeCgstRate = parseFloat(cgstRate) || 0;
    const safeSgstRate = parseFloat(sgstRate) || 0;
    const safeIgstRate = parseFloat(igstRate) || 0;
    const safeAmountPaid = parseFloat(amountPaid) || 0;

    // Calculate Discount

    let calcDiscount = 0;
    if (discountType === "percent") {
      calcDiscount = calcSubtotal * (safeDiscount / 100);
    } else {
      calcDiscount = safeDiscount;
    }

    // GST/IGST calculated on the amount AFTER discount

    const taxableAmount = calcSubtotal - calcDiscount;

    let calcCgst = 0;
    let calcSgst = 0;
    let calcIgst = 0;

    if (taxType === "GST") {
      calcCgst = taxableAmount * (safeCgstRate / 100);
      calcSgst = taxableAmount * (safeSgstRate / 100);
    } else if (taxType === "IGST") {
      calcIgst = taxableAmount * (safeIgstRate / 100);
    }

    const calcTotal = taxableAmount + calcCgst + calcSgst + calcIgst;
    const calcBalance = calcTotal - safeAmountPaid;

    return {
      subtotal: calcSubtotal,
      discountAmount: calcDiscount,
      cgstAmount: calcCgst,
      sgstAmount: calcSgst,
      igstAmount: calcIgst,
      total: calcTotal,
      balanceDue: calcBalance,
    };
  }, [
    lineItems,
    taxType,
    cgstRate,
    sgstRate,
    igstRate,
    discount,
    discountType,
    amountPaid,
  ]);

  // Currency Formatterr

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleSaveInvoice = async (statusType) => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first.");
      return null;
    }

    if (lineItems.length === 0) {
      toast.error("Please add at least one line item.");
      return null;
    }

    const toastId = toast.loading("Saving invoice...");
    setIsSubmitting(true);

    const payload = {
      customer: selectedCustomer.id,
      invoice_number: invoiceMeta.invoiceNumber,
      issue_date: invoiceMeta.issueDate,
      due_date: invoiceMeta.dueDate,
      status: statusType,
      notes: invoiceMeta.notes,
      terms: invoiceMeta.terms,
      tax_type: taxType,
      discount_percentage:
        discountType === "percent" ? parseFloat(discount) || 0 : 0,
      discount_amount:
        discountType === "amount" ? parseFloat(discount) || 0 : 0,
      cgst_rate: taxType === "GST" ? parseFloat(cgstRate) || 0 : 0,
      sgst_rate: taxType === "GST" ? parseFloat(sgstRate) || 0 : 0,
      igst_rate: taxType === "IGST" ? parseFloat(igstRate) || 0 : 0,
      amount_paid: parseFloat(amountPaid) || 0,
      items: lineItems.map((item) => ({
        service: item.service_id ? parseInt(item.service_id) : null,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
      })),
    };

    try {
      const response = await fetchWithAuth("/invoices/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdInvoice = await response.json();
        toast.success("Invoice created successfully!", { id: toastId });
        return createdInvoice;
      } else {
        const errorData = await response.json();
        console.error("Django Error:", errorData);
        toast.error("Failed to create invoice. Check console.", {
          id: toastId,
        });
        return null;
      }
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Network error occurred.", { id: toastId });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const inv = await handleSaveInvoice("Draft");
    if (inv) {
      navigate("/invoice/view");
    }
  };

  const handleDownload = async () => {
    const inv = await handleSaveInvoice("Draft");
    if (inv) {
      generateInvoicePDF(inv, formatDate, formatMoney, toast);
      navigate("/invoice/view");
    }
  };

  const handleSendInvoice = async () => {
    const inv = await handleSaveInvoice("Sent");
    if (inv) {
      setEmailInvoice(inv);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
      {/* TOP ACTION BAR  */}

      <div className="max-w-5xl mx-auto flex flex-wrap justify-end gap-3 mb-8">
        <button
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-all disabled:opacity-50"
        >
          <FiSave size={16} /> {isSubmitting ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={handleDownload}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-all disabled:opacity-50"
        >
          <FiDownload size={16} /> Download
        </button>
        <button
          onClick={handleSendInvoice}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-xeflow-brand text-white hover:opacity-90 font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
        >
          <FiSend size={16} /> Send Invoice
        </button>
      </div>

      {/*  INVOICE PAPER FORM  */}

      <div className="max-w-5xl mx-auto bg-xeflow-surface p-6 md:p-12 lg:p-16 rounded-2xl shadow-xl border border-xeflow-border text-xeflow-text transition-colors duration-300">
        {/* Header Section */}

        <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-xeflow-border pb-10 mb-10">

          <div className="w-full md:w-1/2 space-y-4">
            <img
              src={COMPANY.logo}
              alt={COMPANY.name}
              className="w-auto h-16  md:h-20 object-contain"
            />
            <div className="text-sm text-xeflow-muted space-y-1 mt-2">
              <p>{COMPANY.address}</p>
              <p>Email: {COMPANY.email}</p>
              <p>Phone: {COMPANY.phone}</p>
              <p className="font-bold text-xeflow-text pt-2">GSTIN: {COMPANY.gstin}</p>
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
                  onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
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
                  onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
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
            <CustomSelect
              value={selectedCustomer?.id?.toString() || ""}
              onChange={(val) => {
                const customer = dbCustomers.find(
                  (c) => c.id.toString() === val,
                );
                setSelectedCustomer(customer || null);
              }}
              options={customerOptions}
              placeholder="-- Select a Customer --"
              fullWidth={true}
              align="left"
              buttonClassName="w-full text-lg font-bold bg-xeflow-bg border border-xeflow-border rounded-lg p-3 outline-none focus:border-xeflow-brand text-xeflow-text text-left"
              dropdownClassName="w-full left-0 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-2xl p-1.5"
            />

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
                {selectedCustomer.address && (
                  <p>
                    <span className="font-bold text-xeflow-text">Address:</span>{" "}
                    {selectedCustomer.address}
                  </p>
                )}
                {selectedCustomer.website && (
                  <p>
                    <span className="font-bold text-xeflow-text">Website:</span>{" "}
                    <a href={selectedCustomer.website.startsWith('http') ? selectedCustomer.website : `https://${selectedCustomer.website}`} target="_blank" rel="noopener noreferrer" className="text-xeflow-brand hover:underline">
                      {selectedCustomer.website}
                    </a>
                  </p>
                )}
                {selectedCustomer.gtin && (
                  <p>
                    <span className="font-bold text-xeflow-text">GTIN:</span>{" "}
                    {selectedCustomer.gtin}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-12">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b-2 border-xeflow-border text-xs font-bold text-xeflow-muted uppercase tracking-wider">
            <div className="col-span-6">Service / Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <div className="space-y-4 pt-4">
            {lineItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:grid md:grid-cols-12 gap-4 items-stretch md:items-center group bg-xeflow-bg/30 p-4 md:p-2 rounded-xl md:rounded-lg border border-xeflow-border md:border-transparent hover:border-xeflow-border transition-colors"
              >
                <div className="col-span-12 md:col-span-6 flex flex-col gap-1.5">
                  <CustomSelect
                    value={item.service_id?.toString() || ""}
                    onChange={(val) =>
                      handleLineItemChange(item.id, "service_id", val)
                    }
                    options={serviceOptions}
                    placeholder=" Custom Item "
                    fullWidth={true}
                    align="left"
                    buttonClassName="w-full text-sm font-bold bg-transparent border-b border-xeflow-border outline-none focus:border-xeflow-brand pb-1 text-xeflow-text text-left"
                    dropdownClassName="w-full left-0 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-2xl p-1.5"
                  />
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

                <div className="grid grid-cols-3 gap-3 col-span-12 md:col-span-6 md:contents">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">
                      Qty
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(
                          item.id,
                          "quantity",
                          e.target.value,
                        )
                      }
                      className="w-full text-left md:text-right text-sm bg-xeflow-bg border border-xeflow-border rounded p-2 outline-none focus:border-xeflow-brand transition-colors text-xeflow-text"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">
                      Rate
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) =>
                        handleLineItemChange(item.id, "rate", e.target.value)
                      }
                      className="w-full text-left md:text-right text-sm bg-xeflow-bg border border-xeflow-border rounded p-2 outline-none focus:border-xeflow-brand transition-colors text-xeflow-text"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2 text-right relative justify-end">
                    <span className="text-[10px] font-bold text-xeflow-muted uppercase md:hidden">
                      Amount
                    </span>
                    <div className="text-sm font-bold text-xeflow-text flex items-center justify-end gap-2 h-[38px] md:h-auto">
                      {formatMoney(item.amount)}
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="text-xeflow-muted hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        title="Remove Item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
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

        {/*  BOTTOM SUMMARY SECTION  */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Payment Instructions / Bank Details */}
          <div className="w-full space-y-4 bg-xeflow-bg p-6 md:p-8 rounded-2xl border border-xeflow-border flex flex-col animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-xeflow-muted uppercase tracking-wider border-b border-xeflow-border pb-2">
              Payment Instructions
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-xeflow-border/40">
                <span className="text-xeflow-muted font-semibold">Account Holder</span>
                <span className="font-bold text-xeflow-text">{BANK.accountName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-xeflow-border/40">
                <span className="text-xeflow-muted font-semibold">Bank Name</span>
                <span className="font-bold text-xeflow-text">{BANK.bankName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-xeflow-border/40">
                <span className="text-xeflow-muted font-semibold">Account Number</span>
                <span className="font-bold text-xeflow-text">{BANK.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-xeflow-border/40">
                <span className="text-xeflow-muted font-semibold">IFSC Code</span>
                <span className="font-bold text-xeflow-text">{BANK.ifsc}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-xeflow-border/40">
                <span className="text-xeflow-muted font-semibold">Branch</span>
                <span className="font-bold text-xeflow-text">{BANK.branch}</span>
              </div>
              <div className="pt-2 text-xs text-xeflow-muted leading-relaxed">
                <p className="font-semibold text-xeflow-text mb-1">Terms &amp; Conditions:</p>
                <p>Payment is due within 15 days of the invoice issue date. Please share the transaction receipt once payment is processed.</p>
              </div>
            </div>
          </div>

          {/*  TOTALS ENGINE  */}

          <div className="w-full space-y-4 bg-xeflow-bg p-6 md:p-8 rounded-2xl border border-xeflow-border flex flex-col justify-center animate-in fade-in duration-200">
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

            <div className="flex justify-between items-center text-sm">
              <span className="text-xeflow-muted font-bold uppercase tracking-wide">
                Tax Type
              </span>
              <CustomSelect
                value={taxType}
                onChange={setTaxType}
                options={taxTypeOptions}
                placeholder="Select Tax Type"
                align="right"
                buttonClassName="w-32 bg-xeflow-surface border border-xeflow-border rounded-md p-1.5 outline-none font-bold focus:border-xeflow-brand text-xeflow-text text-xs text-left"
                dropdownClassName="w-48 right-0 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-2xl p-1.5"
              />
            </div>

            {taxType === "GST" && (
              <>
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
              </>
            )}

            {taxType === "IGST" && (
              <div className="flex justify-between items-center text-sm pb-3 border-b border-xeflow-border">
                <span className="text-xeflow-muted font-bold uppercase tracking-wide flex items-center gap-2">
                  IGST (%)
                  <input
                    type="number"
                    min="0"
                    value={igstRate}
                    onChange={(e) => setIgstRate(e.target.value)}
                    className="w-14 bg-xeflow-surface border border-xeflow-border rounded-md p-1.5 text-center outline-none focus:border-xeflow-brand transition-colors text-xeflow-text font-bold"
                  />
                </span>
                <span className="font-bold text-xeflow-text">
                  {formatMoney(igstAmount)}
                </span>
              </div>
            )}

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
      <SendEmailModal
        isOpen={!!emailInvoice}
        onClose={() => {
          setEmailInvoice(null);
          navigate("/invoice/view");
        }}
        invoice={emailInvoice}
        formatDate={formatDate}
        formatMoney={formatMoney}
      />
    </div>
  );
};

export default NewInvoice;
