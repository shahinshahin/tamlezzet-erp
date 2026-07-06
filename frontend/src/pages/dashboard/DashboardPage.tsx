import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Skeleton, Chip,
  List, ListItem, ListItemText, ListItemIcon, Divider, Alert,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EventIcon from '@mui/icons-material/Event';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { dashboardApi } from '../../api/endpoints';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import { usePageTitle } from '../../hooks/usePageTitle';

const fmt = (v: number) =>
  v >= 100000
    ? `₹${(v / 100000).toFixed(1)}L`
    : `₹${v.toLocaleString('en-IN')}`;

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.get()
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = data?.revenueExpenseTrend?.map((t: any) => ({
    month: t.month,
    Revenue: Number(t.revenue),
    Expenses: Number(t.expenses),
    Profit: Number(t.profit),
  })) ?? [];

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { title: "Today's Sales", value: loading ? '…' : fmt(data?.todaySales ?? 0), icon: <TrendingUpIcon />, color: '#2e7d32' },
          { title: "Today's Purchases", value: loading ? '…' : fmt(data?.todayPurchases ?? 0), icon: <ShoppingCartIcon />, color: '#1565c0' },
          { title: 'Outstanding', value: loading ? '…' : fmt(data?.totalOutstandingReceivable ?? 0), icon: <AccountBalanceWalletIcon />, color: '#e65100' },
          { title: 'Monthly Profit', value: loading ? '…' : fmt(data?.monthlyProfit ?? 0), icon: <TrendingUpIcon />, color: '#6a1b9a' },
          { title: 'Active Shipments', value: loading ? '…' : data?.activeShipmentsCount ?? 0, icon: <LocalShippingIcon />, color: '#0277bd' },
          { title: 'Pending Tasks', value: loading ? '…' : data?.pendingTaskCount ?? 0, icon: <TaskAltIcon />, color: '#f57c00' },
          { title: 'Upcoming Meetings', value: loading ? '…' : data?.upcomingMeetingCount ?? 0, icon: <EventIcon />, color: '#7b1fa2' },
          { title: 'Expiring Docs', value: loading ? '…' : data?.expiringDocumentsCount ?? 0, icon: <FolderOffIcon />, color: '#c62828' },
        ].map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Revenue vs Expenses Chart */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Revenue vs Expenses (6 months)</Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a5f3c" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1a5f3c" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f4a824" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f4a824" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="Revenue" stroke="#1a5f3c" fill="url(#revGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Expenses" stroke="#f4a824" fill="url(#expGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Profit" stroke="#7b1fa2" fill="none" strokeWidth={2} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Meetings */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={1}>Upcoming Meetings</Typography>
              {loading ? (
                [1,2,3].map(i => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)
              ) : data?.upcomingMeetings?.length ? (
                <List dense disablePadding>
                  {data.upcomingMeetings.map((m: any) => (
                    <React.Fragment key={m.id}>
                      <ListItem disablePadding sx={{ py: 0.8 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <EventIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={m.title}
                          secondary={new Date(m.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: 11 }}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No upcoming meetings</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Tasks */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={1}>Overdue Tasks</Typography>
              {loading ? (
                [1,2,3].map(i => <Skeleton key={i} height={44} sx={{ mb: 0.5 }} />)
              ) : data?.pendingTasks?.length ? (
                <List dense disablePadding>
                  {data.pendingTasks.map((t: any) => (
                    <React.Fragment key={t.id}>
                      <ListItem disablePadding sx={{ py: 0.8 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <WarningAmberIcon fontSize="small" color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={t.title}
                          secondary={`Due: ${t.dueDate} · ${t.assignedTo}`}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: 11 }}
                        />
                        <StatusChip status={t.priority} />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No overdue tasks</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Shipments */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={1}>Active Shipments</Typography>
              {loading ? (
                [1,2,3].map(i => <Skeleton key={i} height={44} sx={{ mb: 0.5 }} />)
              ) : data?.activeShipments?.length ? (
                <List dense disablePadding>
                  {data.activeShipments.map((s: any) => (
                    <React.Fragment key={s.id}>
                      <ListItem disablePadding sx={{ py: 0.8 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <LocalShippingIcon fontSize="small" color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${s.shipmentNumber} → ${s.destination}`}
                          secondary={`Buyer: ${s.buyer} · ETA: ${s.eta || 'TBD'}`}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: 11 }}
                        />
                        <StatusChip status={s.status} />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No active shipments</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
