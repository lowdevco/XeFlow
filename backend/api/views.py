from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Menu_Module, Customer, Service, Invoice
from django.contrib.auth.models import User, Group, Permission
from .serializers import ModuleSerializer, CustomerSerializer, ServiceSerializer, InvoiceSerializer, UserRegistrationSerializer, GroupSerializer, PermissionSerializer, CurrentUserSerializer, UserAdminSerializer
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics , permissions
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

#--------------User Group Views--------------#


class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

class GroupListView(generics.ListAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]

class GroupUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]

class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]

#---------------User View ------------------------#

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAuthenticated]

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

class UserAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_destroy(self, instance):
        if instance.is_superuser and not self.request.user.is_superuser:
            raise PermissionDenied("Only superusers can delete superuser accounts.")
        instance.delete()


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
    
    doc = SimpleDocTemplate(
        response, 
        pagesize=A4, 
        rightMargin=35, 
        leftMargin=35, 
        topMargin=35, 
        bottomMargin=35
    )
    elements = []
    styles = getSampleStyleSheet()

    brand_color = colors.HexColor('#1B4FD8')    
    dark_navy = colors.HexColor('#0D2247')      
    muted_slate = colors.HexColor('#64748B')  
    bg_light = colors.HexColor('#F8FAFC')       
    border_color = colors.HexColor('#E2E8F0')   

    normal_style = styles['Normal']
    
    header_meta_style = ParagraphStyle(
        name='XeMeta',
        parent=normal_style,
        fontSize=9,
        leading=13,
        textColor=muted_slate
    )
    
    card_title_style = ParagraphStyle(
        name='XeCardTitle',
        parent=normal_style,
        fontSize=8,
        leading=11,
        textColor=brand_color,
        fontName='Helvetica-Bold',
        spaceAfter=4
    )
    
    body_text_style = ParagraphStyle(
        name='XeBody',
        parent=normal_style,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    table_header_style = ParagraphStyle(
        name='XeTableHeader',
        parent=normal_style,
        fontSize=8,
        leading=11,
        textColor=colors.whitesmoke,
        fontName='Helvetica-Bold'
    )
    
    table_cell_style = ParagraphStyle(
        name='XeTableCell',
        parent=normal_style,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    # Top Brand Bar

    bar_data = [['']]
    bar_table = Table(bar_data, colWidths=[525], rowHeights=[4])
    bar_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), brand_color),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(bar_table)
    elements.append(Spacer(1, 15))

    # Header Grid (Company info left, INVOICE title right)
    header_data = [
        [
            Paragraph("<b>Xeventure IT Solutions</b><br/>"
                      "<font size=8 color='#64748B'>Bathery Opp to Issacs Residency  <br/>"
                      "Sulthan Bathery, Wayanad<br/>"
                      "Kerala, India 673592<br/>"
                      "<b>GSTIN:</b> 32ABCDE1234F1Z5</font>", header_meta_style),
            Paragraph("<font size=24><b>INVOICE</b></font><br/>"
                      f"<font size=10 color='#64748B'><b>#:</b> {invoice.invoice_number}</font>", ParagraphStyle(
                          name='RightHeader',
                          parent=normal_style,
                          alignment=2,
                          leading=26,
                          textColor=dark_navy,
                          fontName='Helvetica-Bold'
                      ))
        ]
    ]
    header_table = Table(header_data, colWidths=[260, 265])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 20))

    # Client & Invoice details cards 
    if invoice.customer:
        customer = invoice.customer
        billed_to_content = (
            f"<b>{customer.company_name}</b><br/>"
            f"<font size=8 color='#475569'>"
            f"Attn: {customer.rep_name}<br/>"
            f"Email: {customer.email}<br/>"
            f"Phone: {customer.phone}"
            f"</font>"
        )
    else:
        billed_to_content = "<b>Unknown Customer</b>"

    details_content = (
        f"<b>Issue Date:</b> {invoice.issue_date}<br/>"
        f"<b>Due Date:</b> {invoice.due_date}<br/>"
        f"<b>Status:</b> <font color='#1B4FD8'><b>{invoice.status.upper()}</b></font>"
    )

    card_data = [
        [
            Paragraph("BILLED TO", card_title_style),
            Paragraph("INVOICE SUMMARY", card_title_style)
        ],
        [
            Paragraph(billed_to_content, body_text_style),
            Paragraph(details_content, body_text_style)
        ]
    ]
    
    card_table = Table(card_data, colWidths=[255, 270])
    card_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(card_table)
    elements.append(Spacer(1, 25))

    # Alternating-row stylized Table

    table_data = [[
        Paragraph("Description", table_header_style), 
        Paragraph("Qty", table_header_style), 
        Paragraph("Rate", table_header_style), 
        Paragraph("Amount", table_header_style)
    ]] 
    
    for item in invoice.items.all():
        qty_formatted = f"{item.quantity:.0f}" if item.quantity % 1 == 0 else f"{item.quantity:.2f}"
        table_data.append([
            Paragraph(item.description, table_cell_style), 
            Paragraph(qty_formatted, table_cell_style), 
            Paragraph(f"Rs. {item.rate:,.2f}", table_cell_style), 
            Paragraph(f"Rs. {item.amount:,.2f}", table_cell_style)
        ])

    # End calculations styles

    sum_style_label = ParagraphStyle(name='SumLabel', parent=normal_style, fontName='Helvetica-Bold', fontSize=9, leading=12, alignment=2, textColor=muted_slate)
    sum_style_val = ParagraphStyle(name='SumVal', parent=normal_style, fontName='Helvetica-Bold', fontSize=9, leading=12, alignment=2, textColor=dark_navy)

    table_data.append([
        '', '', 
        Paragraph("Subtotal:", sum_style_label), 
        Paragraph(f"Rs. {invoice.subtotal:,.2f}", sum_style_val)
    ])
    
    if invoice.discount_amount > 0:
        table_data.append([
            '', '', 
            Paragraph("Discount:", sum_style_label), 
            Paragraph(f"-Rs. {invoice.discount_amount:,.2f}", ParagraphStyle(name='DiscVal', parent=sum_style_val, textColor=colors.HexColor('#DC2626')))
        ])
    
    if invoice.tax_type == 'GST':
        cgst_rate_str = f"{invoice.cgst_rate:.0f}" if invoice.cgst_rate % 1 == 0 else f"{invoice.cgst_rate:.1f}"
        sgst_rate_str = f"{invoice.sgst_rate:.0f}" if invoice.sgst_rate % 1 == 0 else f"{invoice.sgst_rate:.1f}"
        table_data.append([
            '', '', 
            Paragraph(f"CGST ({cgst_rate_str}%):", sum_style_label), 
            Paragraph(f"Rs. {invoice.cgst_amount:,.2f}", sum_style_val)
        ])
        table_data.append([
            '', '', 
            Paragraph(f"SGST ({sgst_rate_str}%):", sum_style_label), 
            Paragraph(f"Rs. {invoice.sgst_amount:,.2f}", sum_style_val)
        ])
    elif invoice.tax_type == 'IGST':
        igst_rate_str = f"{invoice.igst_rate:.0f}" if invoice.igst_rate % 1 == 0 else f"{invoice.igst_rate:.1f}"
        table_data.append([
            '', '', 
            Paragraph(f"IGST ({igst_rate_str}%):", sum_style_label), 
            Paragraph(f"Rs. {invoice.igst_amount:,.2f}", sum_style_val)
        ])
        
    grand_total_style_label = ParagraphStyle(name='GrandLabel', parent=normal_style, fontName='Helvetica-Bold', fontSize=10, leading=14, alignment=2, textColor=dark_navy)
    grand_total_style_val = ParagraphStyle(name='GrandVal', parent=normal_style, fontName='Helvetica-Bold', fontSize=11, leading=14, alignment=2, textColor=brand_color)

    table_data.append([
        '', '', 
        Paragraph("Total Amount:", grand_total_style_label), 
        Paragraph(f"Rs. {invoice.total_amount:,.2f}", grand_total_style_val)
    ])
    table_data.append([
        '', '', 
        Paragraph("Balance Due:", grand_total_style_label), 
        Paragraph(f"Rs. {invoice.balance_due:,.2f}", grand_total_style_val)
    ])
    
    t = Table(table_data, colWidths=[245, 50, 115, 115])
    
    # Alternating row colors

    t_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), brand_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -6), 0.5, border_color),
    ]
    
    num_items = invoice.items.count()
    for idx in range(1, num_items + 1):
        bg = bg_light if idx % 2 == 0 else colors.white
        t_styles.append(('BACKGROUND', (0, idx), (-1, idx), bg))
        t_styles.append(('TOPPADDING', (0, idx), (-1, idx), 7))
        t_styles.append(('BOTTOMPADDING', (0, idx), (-1, idx), 7))

    totals_start_row = num_items + 1
    t_styles.extend([
        ('SPAN', (0, totals_start_row), (1, -1)),
        ('ALIGN', (2, totals_start_row), (-1, -1), 'RIGHT'),
        ('TOPPADDING', (2, totals_start_row), (-1, -1), 4),
        ('BOTTOMPADDING', (2, totals_start_row), (-1, -1), 4),
        ('LINEABOVE', (2, -2), (3, -2), 1.5, brand_color),
    ])
    
    t.setStyle(TableStyle(t_styles))
    elements.append(t)
    elements.append(Spacer(1, 30))

    #  Stylized Card Callout for Notes & Terms
    if invoice.notes:
        notes_box_data = [[
            Paragraph("<font size=8 color='#1B4FD8'><b>NOTES</b></font><br/>"
                      f"<font size=8.5 color='#334155'>{invoice.notes}</font>", body_text_style)
        ]]
        notes_box = Table(notes_box_data, colWidths=[525])
        notes_box.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_light),
            ('LINELEFT', (0, 0), (0, -1), 3, brand_color),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(notes_box)
        elements.append(Spacer(1, 12))
        
    if invoice.terms:
        terms_box_data = [[
            Paragraph("<font size=8 color='#1B4FD8'><b>TERMS & CONDITIONS</b></font><br/>"
                      f"<font size=8.5 color='#334155'>{invoice.terms}</font>", body_text_style)
        ]]
        terms_box = Table(terms_box_data, colWidths=[525])
        terms_box.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_light),
            ('LINELEFT', (0, 0), (0, -1), 3, brand_color),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(terms_box)

    doc.build(elements)
    return response