import { useState, useEffect } from "react";
import { FiX, FiSend, FiMail, FiPaperclip } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../js/api";
import { generateInvoicePDFBase64 } from "../js/PDF_template";
import { COMPANY } from "../info/company";

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

  const customer = invoice?.customer || {};
  const invNum = invoice?.invoice_number || "Draft";
  const clientName =
    customer.rep_name || customer.company_name || "Valued Client";

  const totalStr =
    invoice && formatMoney
      ? formatMoney(invoice.total_amount)
      : invoice
        ? `INR ${invoice.total_amount}`
        : "";

  const paidStr =
    invoice && formatMoney
      ? formatMoney(invoice.amount_paid)
      : invoice
        ? `INR ${invoice.amount_paid}`
        : "";

  const balanceDueStr =
    invoice && formatMoney
      ? formatMoney(invoice.balance_due)
      : invoice
        ? `INR ${invoice.balance_due}`
        : "";

  const dueDateStr =
    invoice && formatDate
      ? formatDate(invoice.due_date)
      : invoice
        ? invoice.due_date
        : "";

  useEffect(() => {
    if (invoice && isOpen) {
      setToEmail(customer.email || "");
      setCcEmail("");
      setBccEmail("");
      setSubject(`Invoice ${invNum} from ${COMPANY.name}`);
      setMessage(
        `Dear ${clientName},\n\n` +
          `We hope you are doing well. Please find attached invoice ${invNum} for the recent services rendered.\n\n` +
          `Please let us know if you have any questions or require further assistance.\n\n` +
          `Thank you for your business!\n\n` +
          `Best regards,\n` +
          `${COMPANY.name}`,
      );
    }
  }, [invoice, isOpen]);

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
        formatMoney,
      );

      const formattedUserMessage = message.replace(/\n/g, "<br/>");
      const balanceDueNum = parseFloat(invoice.balance_due || 0);
      const isPaid = balanceDueNum <= 0;
      const balanceColor = isPaid ? "#22c55e" : "#ef4444";
      const balanceBg = isPaid ? "#f0fdf4" : "#fef2f2";
      const balanceText = isPaid ? "Paid" : "Outstanding";

      const htmlEmailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f1f5f9;
              padding: 40px 20px;
              margin: 0;
            }
            .max-w-xl { max-width: 540px; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .bg-white { background-color: #ffffff; }
            .border { border: 1px solid #cbd5e1; }
            .border-slate-200 { border-color: #cbd5e1; }
            .rounded-2xl { border-radius: 16px; }
            .shadow-sm { box-shadow: 0 4px 20px -2px rgba(13, 34, 71, 0.08), 0 2px 8px -1px rgba(13, 34, 71, 0.04); }
            .p-8 { padding: 32px; }
            .mb-8 { margin-bottom: 32px; }
            .text-base { font-size: 16px; }
            .font-bold { font-weight: 700; }
            .text-slate-900 { color: #0f172a; }
            .tracking-tight { letter-spacing: -0.025em; }
            .text-center { text-align: center; }
            .my-6 { margin-top: 24px; margin-bottom: 24px; }
            .text-xs { font-size: 11px; }
            .uppercase { text-transform: uppercase; }
            .tracking-widest { letter-spacing: 0.1em; }
            .text-slate-400 { color: #64748b; }
            .text-4xl { font-size: 36px; }
            .font-black { font-weight: 900; }
            .my-2 { margin-top: 8px; margin-bottom: 8px; }
            .text-sm { font-size: 14px; }
            .text-slate-500 { color: #475569; }
            .border-t { border-top: 1px solid #cbd5e1; }
            .border-slate-100 { border-color: #cbd5e1; }
            .my-8 { margin-top: 32px; margin-bottom: 32px; }
            .leading-relaxed { line-height: 1.625; }
            .text-slate-600 { color: #1e293b; }
            .w-full { width: 100%; }
            .border-collapse { border-collapse: collapse; }
            .border-b { border-bottom: 1px solid #cbd5e1; }
            .py-3 { padding-top: 12px; padding-bottom: 12px; }
            .text-right { text-align: right; }
            .font-semibold { font-weight: 600; }
            .border-t-2 { border-top: 2px solid #0f172a; }
            .pt-4 { padding-top: 16px; }
            .py-4 { padding-top: 16px; padding-bottom: 16px; }
            .font-extrabold { font-weight: 800; }
            .mt-8 { margin-top: 32px; }
            .leading-normal { line-height: 1.5; }
            .text-indigo-600 { color: #1b4fd8; }
            .no-underline { text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm" style="overflow: hidden;">
          
            <!-- XeFlow Accent Bar -->

            <div style="height: 4px; background-color: #1b4fd8; width: 100%;"></div>

            <div class="p-8">
              <!-- Header/Logo -->
              <div class="text-base font-bold text-slate-900 tracking-tight mb-8">
                <span style="color: #1b4fd8;">Xeventure IT Solutions</span>
              </div>

              <!-- Hero Amount Due -->
              <div class="text-center my-6">
                <div class="text-xs font-bold uppercase tracking-widest text-slate-400">Amount Due</div>
                <div class="text-4xl font-black text-slate-900 my-2">${balanceDueStr}</div>
                <div class="text-sm text-slate-500">Due by ${dueDateStr}</div>
              </div>

              <hr class="border-t border-slate-200 my-8" />

              <!-- User Message -->
              <div class="text-sm leading-relaxed text-slate-600 mb-8">
                ${formattedUserMessage}
              </div>

              <!-- Invoice Summary Table -->
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th colspan="2" style="text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; padding-bottom: 8px; border-bottom: 1px solid #cbd5e1;">
                      Invoice Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-slate-200">
                    <td class="py-3 text-slate-500">Invoice Number</td>
                    <td class="py-3 text-right font-semibold text-slate-900">${invNum}</td>
                  </tr>
                  <tr class="border-b border-slate-200">
                    <td class="py-3 text-slate-500">Total Amount</td>
                    <td class="py-3 text-right font-semibold text-slate-900">${totalStr}</td>
                  </tr>
                  <tr class="border-b border-slate-200">
                    <td class="py-3 text-slate-500">Amount Paid</td>
                    <td class="py-3 text-right font-semibold text-slate-900">${paidStr}</td>
                  </tr>
                  <tr>
                    <td class="py-4 font-bold text-slate-900" style="padding-top: 16px;">Outstanding Balance</td>
                    <td class="py-4 text-right font-extrabold" style="padding-top: 16px; color: ${balanceColor};">
                      ${balanceDueStr}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer (Outside the card to prevent any border-radius/overflow clipping issues) -->
          <div class="max-w-xl mx-auto mt-8 text-center text-xs text-slate-400 leading-normal">
            <p>This is an automated billing notification from ${COMPANY.name}.</p>
            <p class="mt-1">
              For support, email 
              <a href="mailto:${COMPANY.email}" class="text-indigo-600 no-underline">${COMPANY.email}</a> 
              or visit 
              <a href="${COMPANY.website.startsWith("http") ? COMPANY.website : "https://" + COMPANY.website}" class="text-indigo-600 no-underline">${COMPANY.website}</a>.
            </p>
          </div>
        </body>
        </html>
      `;

      setStatusText("Sending email via SMTP...");
      toast.loading("Sending email...", { id: toastId });

      const response = await fetchWithAuth("/send-email/", {
        method: "POST",
        body: JSON.stringify({
          email: toEmail,
          cc: ccEmail,
          bcc: bccEmail,
          subject: subject,
          message: htmlEmailBody,
          pdf: pdfBase64,
          filename: `Invoice_${invNum}.pdf`,
        }),
      });

      if (response.ok) {
        toast.success(`Invoice sent successfully to ${toEmail}!`, {
          id: toastId,
        });
        onClose();
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Failed to send invoice email.", {
          id: toastId,
        });
      }
    } catch (err) {
      console.error("Email send error:", err);
      toast.error("An error occurred while sending the email.", {
        id: toastId,
      });
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
              <p className="text-xs text-xeflow-muted mt-0.5">
                Attach A4 invoice PDF automatically
              </p>
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

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          {/* Invoice Summary Card */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-xeflow-surface2 border border-xeflow-border rounded-2xl mb-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-xeflow-muted">
                Invoice Number
              </span>
              <p className="text-sm font-bold text-xeflow-text">{invNum}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-xeflow-muted">
                Total Amount
              </span>
              <p className="text-sm font-bold text-xeflow-text">{totalStr}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-xeflow-muted">
                Amount Paid
              </span>
              <p className="text-sm font-bold text-xeflow-text">{paidStr}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-xeflow-muted">
                Outstanding Balance
              </span>
              <p
                className={`text-sm font-black ${parseFloat(invoice.balance_due || 0) <= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {balanceDueStr}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">
                Recipient Email (To) *
              </label>
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
              <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">
                CC
              </label>
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
              <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">
                BCC
              </label>
              <input
                type="text"
                value={bccEmail}
                onChange={(e) => setBccEmail(e.target.value)}
                placeholder={`audit@${COMPANY.website.replace(/^www\./, "")}`}
                className="w-full px-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm outline-none focus:border-xeflow-brand text-xeflow-text transition-all"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">
              Subject
            </label>
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
            <label className="text-xs font-bold uppercase tracking-wider text-xeflow-muted">
              Message Body
            </label>
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
              <p className="text-sm font-bold truncate">
                Invoice_${invoice.invoice_number || "Draft"}.pdf
              </p>
              <p className="text-[10.5px] text-xeflow-muted mt-0.5 font-medium">
                Automatic high-fidelity print template
              </p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-black uppercase text-green-500 bg-green-500/10 border border-green-500/20 rounded-md">
              Attached
            </span>
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
