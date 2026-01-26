import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { sendInvoiceEmail } from '@/lib/email';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { tenantId: user.tenantId },
      include: {
        client: true,
        order: true,
        payments: true,
        bankTransactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      clientId,
      orderId,
      dueDate,
      subtotal,
      tax = 0,
      notes,
    } = body;

    const total = subtotal + tax;

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { tenantId: user.tenantId },
    });
    const invoiceNumber = `FIT-${new Date().getFullYear()}-${String(
      invoiceCount + 1
    ).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: user.tenantId,
        clientId,
        orderId,
        invoiceNumber,
        dueDate: new Date(dueDate),
        subtotal,
        tax,
        total,
        notes,
        status: 'draft',
      },
      include: {
        client: true,
        order: true,
      },
    });

    // Send invoice email to client if status is 'sent'
    if (invoice.client?.email) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3006'
        await sendInvoiceEmail({
          to: invoice.client.email,
          clientName: invoice.client.name,
          invoiceNumber: invoice.invoiceNumber,
          amount: `${invoice.total.toLocaleString('cs-CZ')} Kč`,
          dueDate: format(new Date(invoice.dueDate), 'd. MMMM yyyy', { locale: cs }),
          invoiceUrl: `${baseUrl}/dashboard/invoices/${invoice.id}`,
        });
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
      }
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
