import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Stripe webhook handler for payment processing
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // TODO: Verify Stripe webhook signature
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const { id, amount, currency, metadata } = paymentIntent;

  if (!metadata.invoiceId) {
    console.warn('Payment without invoice ID:', id);
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Update payment record
    const payment = await tx.invoicePayment.findFirst({
      where: {
        gatewayPaymentId: id,
      },
    });

    if (payment) {
      await tx.invoicePayment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    // Update invoice
    const invoice = await tx.invoice.findUnique({
      where: { id: metadata.invoiceId },
    });

    if (invoice) {
      const paidAmount = amount / 100; // Convert from cents
      const newTotal = invoice.paidAmount + paidAmount;

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newTotal,
          status: newTotal >= invoice.totalAmount ? 'paid' : 'sent',
          paidDate: newTotal >= invoice.totalAmount ? new Date() : null,
        },
      });
    }
  });
}

async function handlePaymentFailure(paymentIntent: any) {
  const { id, metadata } = paymentIntent;

  await prisma.invoicePayment.updateMany({
    where: {
      gatewayPaymentId: id,
    },
    data: {
      status: 'FAILED',
    },
  });
}

async function handleRefund(charge: any) {
  const { payment_intent, amount_refunded } = charge;

  await prisma.invoicePayment.updateMany({
    where: {
      gatewayPaymentId: payment_intent,
    },
    data: {
      status: 'REFUNDED',
    },
  });
}
