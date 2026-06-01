import { useState, useEffect } from "react";
import { FiX, FiSend, FiMail, FiPaperclip } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../js/api";
import { generateInvoicePDFBase64 } from "../js/pdfGenerator";

export default function SendEmailModal({
  isOpen,
  onClose,
  invoice,
  formatDate,
  formatMoney,
}) {
  const [toEmail, setToEmail] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (invoice && isOpen) {
      const customer = invoice.customer || {};
      setToEmail(customer.email || "");
      setCcEmail("");
      setBccEmail("");
      
      const invNum = invoice.invoice_number || "Draft";
      setSubject(`Invoice ${invNum} from Xeventure IT Solutions`);
      
      const clientName = customer.rep_name || customer.company_name || "Valued Client";
      const totalStr = formatMoney ? formatMoney(invoice.total_amount) : `INR ${invoice.total_amount}`;
      const dueDateStr = formatDate ? formatDate(invoice.due_date) : invoice.due_date;
      
      setMessage(
        `Dear ${clientName},\n\n` +
        `We hope you are doing well. Please find attached invoice ${invNum} for the recent services rendered.\n\n` +
        `Summary:\n` +
        `· Invoice Number: ${invNum}\n` +
        `· Total Amount: ${totalStr}\n` +
        `· Due Date: ${dueDateStr}\n\n` +
        `Please let us know if you have any questions or require further assistance.\n\n` +
        `Thank you for your business!\n\n` +
        `Best regards,\n` +
        `Xeventure Billing Department`
      );
    }
  }, [invoice, isOpen, formatDate, formatMoney]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toEmail) {
      toast.error("Recipient email (To) is required.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Preparing invoice PDF...");

    try {
      setStatusText("Compiling PDF attachment...");
      const pdfBase64 = await generateInvoicePDFBase64(
        invoice,
        formatDate,
        formatMoney
      );

      setStatusText("Sending email via SMTP...");
      toast.loading("Sending email...", { id: toastId });

      const response = await fetchWithAuth("/send-email/", {
        method: "POST",
        body: JSON.stringify({
          email: toEmail,
          cc: ccEmail,
          bcc: bccEmail,
          subject: subject,
          message: message,
          pdf: pdfBase64,
          filename: `Invoice_${invoice.invoice_number || "Draft"}.pdf`,
        }),
      });

      if (response.ok) {
        toast.success(`Invoice sent successfully to ${toEmail}!`, { id: toastId });
        onClose();
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Failed to send invoice email.", { id: toastId });
      }
    } catch (err) {
      console.error("Email send error:", err);
      toast.error("An error occurred while sending the email.", { id: toastId });
    } finally {
      setIsProcessing(false);
      setStatusText("");
    }
  };

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-xeflow-bg/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-xeflow-surface border border-xeflow-border rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden text-xeflow-text animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-xeflow-border bg-xeflow-bg/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-xeflow-brand/10 text-xeflow-brand flex items-center justify-center">
              <FiMail size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Send Invoice via Email</h3>
              <p className="text-xs text-xeflow-muted mt-0.5">Attach A4 invoice PDF automatically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-xeflow-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all border border-xeflow-border"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">Recipient Email (To) *</label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm outline-none focus:border-xeflow-brand text-xeflow-text transition-all font-semibold"
                required
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">CC</label>
              <input
                type="text"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="manager@company.com"
                className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm outline-none focus:border-xeflow-brand text-xeflow-text transition-all"
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">BCC</label>
              <input
                type="text"
                value={bccEmail}
                onChange={(e) => setBccEmail(e.target.value)}
                placeholder="audit@xeventure.com"
                className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm outline-none focus:border-xeflow-brand text-xeflow-text transition-all"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm outline-none focus:border-xeflow-brand text-xeflow-text transition-all font-semibold"
              required
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">Message Body</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              placeholder="Write your message here..."
              className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm outline-none focus:border-xeflow-brand text-xeflow-text transition-all custom-scrollbar resize-none font-medium leading-relaxed"
              required
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-xeflow-bg/50 border border-xeflow-border rounded-2xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
              <FiPaperclip size={18} />
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <p className="text-sm font-bold truncate">Invoice_${invoice.invoice_number || "Draft"}.pdf</p>
              <p className="text-[10.5px] text-xeflow-muted mt-0.5 font-medium">Automatic high-fidelity print template</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-black uppercase text-green-500 bg-green-500/10 border border-green-500/20 rounded-md">Attached</span>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-xeflow-border bg-xeflow-bg/30 flex items-center justify-between shrink-0">
          <div className="text-xs font-semibold text-xeflow-muted">
            {isProcessing && (
              <span className="flex items-center gap-2 animate-pulse text-xeflow-brand">
                <div className="w-2.5 h-2.5 bg-xeflow-brand rounded-full animate-ping"></div>
                {statusText}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-3 rounded-xl border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/5 font-bold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-xeflow-brand hover:opacity-90 text-white font-bold text-sm transition-all shadow-md shadow-xeflow-brand/20 disabled:opacity-50 cursor-pointer"
            >
              <FiSend size={16} />
              {isProcessing ? "Processing..." : "Send Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
