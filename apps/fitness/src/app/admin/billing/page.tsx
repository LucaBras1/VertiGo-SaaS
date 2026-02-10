'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@vertigo/ui';
import { DollarSign, CreditCard, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface BillingStats {
  totalRevenue: number;
  pendingPayments: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export default function BillingPage() {
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing/invoices');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const invoices = data.invoices || [];

      const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + inv.total, 0);

      const pendingPayments = invoices
        .filter((inv: any) => inv.status === 'sent')
        .reduce((sum: number, inv: any) => sum + inv.total, 0);

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
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Revenue',
      value: `€${stats.totalRevenue.toFixed(2)}`,
      change: `${stats.paidInvoices} paid invoices`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Payments',
      value: `€${stats.pendingPayments.toFixed(2)}`,
      change: 'awaiting payment',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Overdue',
      value: stats.overdueInvoices.toString(),
      change: 'requires attention',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Monthly Growth',
      value: '+12%',
      change: 'vs last month',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Billing</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage invoices, payments, and bank accounts
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/billing/bank-accounts">
              Bank Accounts
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/billing/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stat.value}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
