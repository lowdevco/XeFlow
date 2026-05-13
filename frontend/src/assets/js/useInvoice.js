/**
 * useInvoice.js
 * All state and business logic for the NewInvoice form.
 * Import { useInvoice } into NewInvoice.jsx.
 */

import { useState, useRef } from "react";

export function useInvoice() {
  /* ── Header ─────────────────────────────────────────────────────── */
  const [logo, setLogoUrl] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [from, setFrom] = useState("");
  const [billTo, setBillTo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [date, setDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [poNumber, setPoNumber] = useState("");

  /* ── Line items ─────────────────────────────────────────────────── */
  const [items, setItems] = useState([
    { id: 1, description: "", quantity: "", rate: "" },
  ]);

  /* ── Adjustments ────────────────────────────────────────────────── */
  const [discount, setDiscount] = useState({
    show: false,
    type: "percent",
    value: "",
  });
  const [tax, setTax] = useState({ show: false, type: "percent", value: "" });
  const [shipping, setShipping] = useState({ show: false, value: "" });

  /* ── Footer ─────────────────────────────────────────────────────── */
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  /* ── UI state ───────────────────────────────────────────────────── */
  const [showSend, setShowSend] = useState(false);
  const logoRef = useRef(null);

  /* ── Logo upload ────────────────────────────────────────────────── */
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setLogoUrl(URL.createObjectURL(file));
  };

  /* ── Line item CRUD ─────────────────────────────────────────────── */
  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: Date.now(), description: "", quantity: "", rate: "" },
    ]);

  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id, field, val) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: val } : i)),
    );

  /* ── Calculations ───────────────────────────────────────────────── */
  const subtotal = items.reduce(
    (s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0),
    0,
  );

  const discountAmt = discount.show
    ? discount.type === "percent"
      ? (subtotal * (parseFloat(discount.value) || 0)) / 100
      : parseFloat(discount.value) || 0
    : 0;

  const taxAmt = tax.show
    ? tax.type === "percent"
      ? ((subtotal - discountAmt) * (parseFloat(tax.value) || 0)) / 100
      : parseFloat(tax.value) || 0
    : 0;

  const shippingAmt = shipping.show ? parseFloat(shipping.value) || 0 : 0;
  const total = subtotal - discountAmt + taxAmt + shippingAmt;
  const balanceDue = total - (parseFloat(amountPaid) || 0);

  /* ── Format helper ──────────────────────────────────────────────── */
  const fmt = (n) =>
    `₹ ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  /* ── Actions ────────────────────────────────────────────────────── */
  const handleDownload = () => window.print();

  return {
    /* refs */
    logoRef,
    /* logo */
    logo,
    handleLogoUpload,
    /* header fields */
    invoiceNumber,
    setInvoiceNumber,
    from,
    setFrom,
    billTo,
    setBillTo,
    shipTo,
    setShipTo,
    date,
    setDate,
    paymentTerms,
    setPaymentTerms,
    dueDate,
    setDueDate,
    poNumber,
    setPoNumber,
    /* items */
    items,
    addItem,
    removeItem,
    updateItem,
    /* adjustments */
    discount,
    setDiscount,
    tax,
    setTax,
    shipping,
    setShipping,
    /* footer */
    notes,
    setNotes,
    terms,
    setTerms,
    amountPaid,
    setAmountPaid,
    /* totals */
    subtotal,
    discountAmt,
    taxAmt,
    shippingAmt,
    total,
    balanceDue,
    fmt,
    /* ui */
    showSend,
    setShowSend,
    handleDownload,
  };
}
