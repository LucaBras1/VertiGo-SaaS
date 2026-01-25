import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { PaymentService } from '@vertigo/billing/services';

export async function GET(req: NextRequest) {
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

    const payments = await prisma.invoicePayment.findMany({
      where: { tenantId: user.tenantId },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
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
      invoiceId,
      amount,
      currency = 'CZK',
      method,
      reference,
    } = body;

    // Create payment record
    const payment = await prisma.invoicePayment.create({
      data: {
        tenantId: user.tenantId,
        invoiceId,
        amount,
        currency,
        method,
        reference,
        status: 'PENDING',
      },
      include: {
        invoice: true,
      },
    });

    // Update invoice paid amount
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (invoice) {
      const newPaidAmount = invoice.paidAmount + amount;
      const newStatus =
        newPaidAmount >= invoice.totalAmount ? 'paid' : 'sent';

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
          paidDate: newStatus === 'paid' ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
