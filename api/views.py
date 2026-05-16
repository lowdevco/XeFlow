from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Menu_Module, Customer, Service, Invoice
from .serializers import ModuleSerializer, CustomerSerializer, ServiceSerializer, InvoiceSerializer
from rest_framework import generics 
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from .models import Invoice

# --------------Module Views--------------#

class SidebarMenuView(APIView):
    def get(self, request):
        modules = Menu_Module.objects.all()
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

    permission_classes = [IsAuthenticated]

# --------------Customer Views--------------#

class CustomerListCreateView(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]


#---------------Service Views--------------#

class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


#--------------Invoice Views--------------#


class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


#----------------------------------------------------------------#



















#------------------PDF generation and Download Views---------------#

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice_pdf(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return HttpResponse("Invoice not found", status=404)

    response = HttpResponse(content_type='application/pdf')
    filename = f"Invoice_{invoice.invoice_number}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    doc = SimpleDocTemplate(response, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(name='CustomTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#06b6d4'), spaceAfter=20)
    normal_style = styles['Normal']

    elements.append(Paragraph("INVOICE", title_style))
    
    header_data = [
        [
            Paragraph("<b>Xeventure Technologies</b><br/>123 Tech Park, Cyber Hub<br/>Kerala, India 673592<br/>GSTIN: 32ABCDE1234F1Z5", normal_style),
            Paragraph(f"<b>Invoice #:</b> {invoice.invoice_number}<br/><b>Issue Date:</b> {invoice.issue_date}<br/><b>Due Date:</b> {invoice.due_date}<br/><b>Status:</b> {invoice.status}", normal_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[260, 240])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(header_table)
    elements.append(Spacer(1, 20))

    if invoice.customer:
        customer = invoice.customer
        customer_info = f"<b>Billed To:</b><br/>{customer.company_name}<br/>Attn: {customer.rep_name}<br/>{customer.email}<br/>{customer.phone}"
        elements.append(Paragraph(customer_info, normal_style))
    else:
        elements.append(Paragraph("<b>Billed To:</b><br/>Unknown Customer", normal_style))
        
    elements.append(Spacer(1, 30))
    table_data = [['Description', 'Qty', 'Rate', 'Amount']] 
    for item in invoice.items.all():
        table_data.append([
            item.description, 
            str(item.quantity), 
            f"Rs. {item.rate}", 
            f"Rs. {item.amount}"
        ])

    table_data.append(['', '', 'Subtotal:', f"Rs. {invoice.subtotal}"])
    if invoice.discount_amount > 0:
        table_data.append(['', '', 'Discount:', f"-Rs. {invoice.discount_amount}"])
    table_data.append(['', '', f'CGST ({invoice.cgst_rate}%):', f"Rs. {invoice.cgst_amount}"])
    table_data.append(['', '', f'SGST ({invoice.sgst_rate}%):', f"Rs. {invoice.sgst_amount}"])
    table_data.append(['', '', 'Total:', f"Rs. {invoice.total_amount}"])
    table_data.append(['', '', 'Balance Due:', f"Rs. {invoice.balance_due}"])
    
    t = Table(table_data, colWidths=[230, 50, 110, 110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')), 
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke), 
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'), 
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('FONTNAME', (2, -6), (-1, -1), 'Helvetica-Bold'),
        ('LINEABOVE', (2, -1), (-1, -1), 1.5, colors.HexColor('#06b6d4')), 
    ]))
    elements.append(t)
    elements.append(Spacer(1, 40))

    if invoice.notes:
        elements.append(Paragraph("<b>Notes:</b>", normal_style))
        elements.append(Paragraph(invoice.notes, normal_style))
        elements.append(Spacer(1, 10))
    if invoice.terms:
        elements.append(Paragraph("<b>Terms & Conditions:</b>", normal_style))
        elements.append(Paragraph(invoice.terms, normal_style))

    doc.build(elements)
    return response