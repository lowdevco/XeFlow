export const generateInvoicePDF = (invoice, formatDate, formatMoney, toast) => {
  const loadingToast = toast.loading("Generating PDF...");
  try {

    import("html2pdf.js")
      .then((html2pdfModule) => {
        const html2pdf = html2pdfModule.default || html2pdfModule;

        // Format dates and currency

        const dateStr = formatDate(invoice.issue_date);
        const dueStr = formatDate(invoice.due_date);
        const totalStr = formatMoney(invoice.total_amount);
        const subtotalStr = formatMoney(invoice.subtotal);
        const balanceStr = formatMoney(invoice.balance_due);
        const paidStr = formatMoney(invoice.amount_paid);
        const discountStr = formatMoney(invoice.discount_amount);



        const itemsRows =
          invoice.items && invoice.items.length > 0
            ? invoice.items
                .map(
                  (item) => `
            <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
              <td style="padding: 12px 8px; font-weight: 600; color: #0F172A;">${item.description}</td>
              <td style="padding: 12px 8px; text-align: right; color: #475569;">${parseFloat(item.quantity)}</td>
              <td style="padding: 12px 8px; text-align: right; color: #475569;">${formatMoney(item.rate)}</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #0F172A;">${formatMoney(item.amount)}</td>
            </tr>
          `,
                )
                .join("")
            : `<tr><td colspan="4" style="padding: 12px 8px; text-align: center; color: #94A3B8;">No line items.</td></tr>`;

        
        // Render tax block dynamically

        let taxBlock = "";
        if (invoice.tax_type === "GST") {
          taxBlock = `
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569;">
            <span style="font-weight: 600;">CGST (${parseFloat(invoice.cgst_rate)}%)</span>
            <span style="font-weight: 700; color: #0F172A;">${formatMoney(invoice.cgst_amount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;">
            <span style="font-weight: 600;">SGST (${parseFloat(invoice.sgst_rate)}%)</span>
            <span style="font-weight: 700; color: #0F172A;">${formatMoney(invoice.sgst_amount)}</span>
          </div>
        `;
        } else if (invoice.tax_type === "IGST") {
          taxBlock = `
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;">
            <span style="font-weight: 600;">IGST (${parseFloat(invoice.igst_rate)}%)</span>
            <span style="font-weight: 700; color: #0F172A;">${formatMoney(invoice.igst_amount)}</span>
          </div>
        `;
        }

        // A4 PDF 

        const element = document.createElement("div");
        element.style.padding = "40px";
        element.style.fontFamily = "'Inter', sans-serif";
        element.style.color = "#0F172A";
        element.style.backgroundColor = "#FFFFFF";
        element.style.width = "794px";
        element.style.boxSizing = "border-box";

        element.innerHTML = `
        <!-- Decorative brand top accent bar -->
        <div style="background-color: #1B4FD8; height: 6px; width: 100%; border-radius: 4px; margin-bottom: 30px;"></div>

        <!-- Header Section -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 35px; align-items: flex-start;">
          <div>
            <h2 style="font-size: 26px; font-weight: 900; margin: 0; color: #0D2247; letter-spacing: -0.5px;">Xeventure IT Solutions</h2>
            <div style="font-size: 12px; color: #64748B; line-height: 1.6; margin-top: 8px;">
              <p style="margin: 0;">Bathery Opp to Issacs Residency</p>
              <p style="margin: 0;">Sulthan Bathery, Wayanad, Kerala, India 673592</p>
              <p style="margin: 0; font-weight: 700; color: #0F172A; margin-top: 4px;">GSTIN: 32ABCDE1234F1Z5</p>
            </div>
          </div>
          <div style="text-align: right;">
            <h1 style="font-size: 38px; font-weight: 950; color: #E2E8F0; text-transform: uppercase; margin: 0; letter-spacing: 2px;">INVOICE</h1>
            <p style="font-size: 14px; font-weight: 800; color: #64748B; margin: 6px 0 0 0;">#: ${invoice.invoice_number}</p>
          </div>
        </div>

        <!-- Billed To & Summary Cards Block -->
        <div style="display: flex; gap: 20px; margin-bottom: 40px;">
          <div style="flex: 1; background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 16px;">
            <h3 style="font-size: 11px; font-weight: 800; color: #1B4FD8; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 0.5px;">Billed To</h3>
            ${
              invoice.customer
                ? `
              <p style="font-size: 16px; font-weight: 900; margin: 0 0 6px 0; color: #0F172A;">${invoice.customer.company_name}</p>
              <p style="font-size: 13px; color: #475569; margin: 0 0 4px 0;">Attn: ${invoice.customer.rep_name}</p>
              <p style="font-size: 13px; color: #475569; margin: 0 0 4px 0;">Email: ${invoice.customer.email}</p>
              <p style="font-size: 13px; color: #475569; margin: 0;">Phone: ${invoice.customer.phone}</p>
              ${invoice.customer.address ? `<p style="font-size: 12px; color: #64748B; margin: 6px 0 0 0; line-height: 1.4; border-top: 1px dashed #E2E8F0; padding-top: 6px;"><b>Address:</b> ${invoice.customer.address}</p>` : ""}
            `
                : `<p style="font-size: 13px; color: #DC2626; margin: 0;">Customer details missing.</p>`
            }
          </div>
          <div style="flex: 1; background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 16px;">
            <h3 style="font-size: 11px; font-weight: 800; color: #1B4FD8; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 0.5px;">Invoice Summary</h3>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between;"><span style="font-weight: 600;">Issue Date:</span><span style="font-weight: 700; color: #0F172A;">${dateStr}</span></div>
              <div style="display: flex; justify-content: space-between;"><span style="font-weight: 600;">Due Date:</span><span style="font-weight: 700; color: #0F172A;">${dueStr}</span></div>
              <div style="display: flex; justify-content: space-between; border-top: 1px dashed #E2E8F0; padding-top: 6px; margin-top: 2px;">
                <span style="font-weight: 600;">Status:</span>
                <span style="font-weight: 800; text-transform: uppercase; color: ${invoice.status === "Paid" ? "#10B981" : invoice.status === "Overdue" ? "#EF4444" : "#1B4FD8"}">${invoice.status}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 45px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #0F172A; font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 10px 8px;">Description</th>
                <th style="padding: 10px 8px; text-align: right; width: 60px;">Qty</th>
                <th style="padding: 10px 8px; text-align: right; width: 110px;">Rate</th>
                <th style="padding: 10px 8px; text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </div>

        <!-- Notes & Terms -->
        <div style="display: flex; gap: 40px; align-items: flex-start; margin-bottom: 25px;">
          <div style="flex: 1.1; display: flex; flex-direction: column; gap: 16px;">
            ${
              invoice.notes
                ? `
              <div style="background-color: #F8FAFC; border-left: 3px solid #1B4FD8; padding: 12px 16px; border-radius: 0 12px 12px 0;">
                <h4 style="font-size: 10px; font-weight: 800; color: #1B4FD8; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px;">Notes</h4>
                <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.5;">${invoice.notes}</p>
              </div>
            `
                : ""
            }
            ${
              invoice.terms
                ? `
              <div style="background-color: #F8FAFC; border-left: 3px solid #1B4FD8; padding: 12px 16px; border-radius: 0 12px 12px 0;">
                <h4 style="font-size: 10px; font-weight: 800; color: #1B4FD8; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px;">Terms & Conditions</h4>
                <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.5;">${invoice.terms}</p>
              </div>
            `
                : ""
            }
          </div>

          <!-- Totals Box -->
          <div style="flex: 0.9; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; padding: 22px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569;">
              <span style="font-weight: 600;">Subtotal</span>
              <span style="font-weight: 700; color: #0F172A;">${subtotalStr}</span>
            </div>
            
            ${
              parseFloat(invoice.discount_amount) > 0
                ? `
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #1B4FD8; font-weight: 600;">
                <span>Discount</span>
                <span>-${discountStr}</span>
              </div>
            `
                : ""
            }

            ${taxBlock}

            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #0F172A; padding-top: 6px; margin-top: 4px; border-top: 1.5px solid #0F172A;">
              <span>Total</span>
              <span style="color: #1B4FD8;">${totalStr}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; padding-top: 4px;">
              <span style="font-weight: 600;">Amount Paid</span>
              <span style="font-weight: 700; color: #10B981;">${paidStr}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 850; color: #0F172A; border-top: 1px dashed #E2E8F0; padding-top: 10px; margin-top: 2px;">
              <span>Balance Due</span>
              <span style="color: #1B4FD8; font-size: 16px;">${balanceStr}</span>
            </div>
          </div>
        </div>
      `;

        const opt = {
          margin: 0,
          filename: `Invoice_${invoice.invoice_number}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        html2pdf()
          .from(element)
          .set(opt)
          .save()
          .then(() => {
            toast.success("Download started!", { id: loadingToast });
          })
          .catch((err) => {
            console.error("PDF html2pdf compilation error:", err);
            toast.error("Failed to render PDF document.", { id: loadingToast });
          });
      })
      .catch((err) => {
        console.error("Failed to dynamically import html2pdf.js:", err);
        toast.error("Missing html2pdf.js module.", { id: loadingToast });
      });
  } catch (error) {
    console.error("PDF Download Error:", error);
    toast.error("Failed to generate PDF.", { id: loadingToast });
  }
};