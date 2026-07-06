import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Alert, Skeleton,
  ToggleButtonGroup, ToggleButton, Divider, Table, TableBody,
  TableCell, TableHead, TableRow,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { financeApi } from '../../api/endpoints';
import StatCard from '../../components/common/StatCard';
import { usePageTitle } from '../../hooks/usePageTitle';

const COLORS = ['#1a5f3c','#f4a824','#0277bd','#7b1fa2','#e65100','#c62828','#00695c','#4527a0'];
const fmt = (v: number) => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${v.toLocaleString('en-IN')}`;
const fmtFull = (v: any) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

export default function FinancePage() {
  usePageTitle('Finance Dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    financeApi.getDashboard(months)
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load finance data'))
      .finally(() => setLoading(false));
  }, [months]);

  const cashFlowData = data?.cashFlowTrend?.map((t: any) => ({
    month: t.month,
    Inflow: Number(t.inflow),
    Outflow: Number(t.outflow),
    Net: Number(t.net),
  })) ?? [];

  const expenseData = data?.expenseBreakdown
    ? Object.entries(data.expenseBreakdown).map(([k, v]) => ({ name: k.replace(/_/g,' '), value: Number(v) }))
    : [];

  const pnlData = data?.profitLossMonthly?.map((p: any) => ({
    month: p.month,
    Revenue: Number(p.revenue),
    Expenses: Number(p.opex),
    Profit: Number(p.profit),
  })) ?? [];

  const KPI = [
    { title: 'Total Revenue', value: loading ? '…' : fmt(data?.totalRevenue ?? 0), icon: <TrendingUpIcon />, color: '#2e7d32' },
    { title: 'Total Expenses', value: loading ? '…' : fmt(data?.totalExpenses ?? 0), icon: <TrendingDownIcon />, color: '#c62828' },
    { title: 'Net Profit', value: loading ? '…' : fmt(data?.netProfit ?? 0), icon: <AccountBalanceIcon />, color: data?.netProfit >= 0 ? '#2e7d32' : '#c62828' },
    { title: 'Total Receivables', value: loading ? '…' : fmt(data?.totalReceivables ?? 0), icon: <ReceiptLongIcon />, color: '#e65100' },
    { title: 'GST Paid', value: loading ? '…' : fmtFull(data?.gstPaid ?? 0), icon: <AccountBalanceIcon />, color: '#7b1fa2' },
    { title: 'Net Cash Flow', value: loading ? '…' : fmt(data?.netCashFlow ?? 0), icon: <TrendingUpIcon />, color: '#0277bd' },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Finance Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Cash flow, P&L, and financial analytics</Typography>
        </Box>
        <ToggleButtonGroup value={months} exclusive onChange={(_, v) => v && setMonths(v)} size="small">
          {[3, 6, 12].map(m => <ToggleButton key={m} value={m}>{m}M</ToggleButton>)}
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3}>
        {KPI.map(k => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={k.title}>
            <StatCard {...k} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Cash Flow Bar Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Cash Flow — {months} Months</Typography>
              {loading ? <Skeleton variant="rectangular" height={300} /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="Inflow" fill="#1a5f3c" radius={[4,4,0,0]} />
                    <Bar dataKey="Outflow" fill="#f4a824" radius={[4,4,0,0]} />
                    <Bar dataKey="Net" fill="#0277bd" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Pie */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Expenses by Category</Typography>
              {loading ? <Skeleton variant="circular" width={220} height={220} sx={{ mx: 'auto' }} /> : (
                expenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={expenseData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {expenseData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmtFull(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <Typography variant="body2" color="text.secondary">No expense data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* P&L Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Profit & Loss Trend</Typography>
              {loading ? <Skeleton variant="rectangular" height={280} /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={pnlData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="Revenue" stroke="#1a5f3c" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Expenses" stroke="#f4a824" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Profit" stroke="#0277bd" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Country */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Sales by Country</Typography>
              {loading ? [1,2,3,4].map(i => <Skeleton key={i} height={40} sx={{ mb: 0.5 }} />) : (
                data?.salesByCountry?.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Amount (USD)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.salesByCountry.map((r: any) => (
                        <TableRow key={r.country} hover>
                          <TableCell>{r.country}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>${Number(r.amount).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <Typography variant="body2" color="text.secondary">No export data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
