'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BillingStats {
  totalRevenue: number;
  pendingPayments: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export default function BillingDashboardPage() {
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [invoicesRes, paymentsRes] = await Promise.all([
        fetch('/api/billing/invoices'),
        fetch('/api/billing/payments'),
      ]);

      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : { invoices: [] };
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : { payments: [] };

      const invoices = invoicesData.invoices || [];
      const payments = paymentsData.payments || [];

      // Calculate stats
      const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);

      const pendingPayments = invoices
        .filter((inv: any) => inv.status === 'sent')
        .reduce((sum: number, inv: any) => sum + (inv.totalAmount - inv.paidAmount), 0);

      const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid').length;

      const overdueInvoices = invoices.filter(
        (inv: any) =>
          inv.status !== 'paid' &&
          inv.status !== 'draft' &&
          new Date(inv.dueDate) < new Date()
      ).length;

      setStats({
        totalRevenue,
        pendingPayments,
        paidInvoices,
        overdueInvoices,
      });

      setRecentInvoices(invoices.slice(0, 5));
      setRecentPayments(payments.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Celkové příjmy',
      value: formatCurrency(stats.totalRevenue / 100),
      change: `${stats.paidInvoices} zaplacených faktur`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Čekající platby',
      value: formatCurrency(stats.pendingPayments / 100),
      change: 'očekávané příjmy',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Po splatnosti',
      value: stats.overdueInvoices.toString(),
      change: 'vyžaduje pozornost',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Měsíční trend',
      value: '+12%',
      change: 'oproti minulému měsíci',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'danger' }> = {
    draft: { label: 'Koncept', variant: 'default' },
    sent: { label: 'Odesláno', variant: 'warning' },
    paid: { label: 'Zaplaceno', variant: 'success' },
    overdue: { label: 'Po splatnosti', variant: 'danger' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-1">
            Správa faktur, plateb a bankovních účtů
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/billing/bank-accounts">
              Bankovní účty
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/billing/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              Nová faktura
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nejnovější faktury</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/billing/invoices">
                  Zobrazit vše
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Žádné faktury</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/dashboard/billing/invoices/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Vytvořit fakturu
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status] || statusConfig.draft;
                  return (
                    <Link
                      key={invoice.id}
                      href={`/dashboard/billing/invoices/${invoice.id}`}
                      className="block p-4 border rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                              {invoice.invoiceNumber}
                            </h4>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {invoice.customer?.firstName} {invoice.customer?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Splatnost: {formatDate(new Date(invoice.dueDate))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(invoice.totalAmount / 100)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Poslední platby</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/billing/payments">
                  Zobrazit vše
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Žádné platby</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {payment.invoice?.invoiceNumber}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.invoice?.customer?.firstName}{' '}
                          {payment.invoice?.customer?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(new Date(payment.createdAt))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          +{formatCurrency(Number(payment.amount) / 100)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {payment.method}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
