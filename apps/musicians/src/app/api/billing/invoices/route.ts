import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { InvoiceService } from '@vertigo/billing/services';

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
        customer: true,
        gig: true,
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
      customerId,
      gigId,
      dueDate,
      items,
      notes,
      taxRate = 0,
    } = body;

    // Calculate amounts
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.total,
      0
    );
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { tenantId: user.tenantId },
    });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      invoiceCount + 1
    ).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: user.tenantId,
        customerId,
        gigId,
        invoiceNumber,
        dueDate: new Date(dueDate),
        items,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        notes,
        status: 'draft',
      },
      include: {
        customer: true,
        gig: true,
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
