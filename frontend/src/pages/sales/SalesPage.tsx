import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, IconButton, Tooltip, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Alert, Typography,
  Tabs, Tab, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PaymentIcon from '@mui/icons-material/Payment';
import WarningIcon from '@mui/icons-material/Warning';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { salesApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { usePageTitle } from '../../hooks/usePageTitle';

const CURRENCIES = ['USD','EUR','GBP','AED','SGD','JPY','INR'];
const fmt = (v: any) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';
const fmtFx = (v: any, cur: string) => v ? `${cur} ${Number(v).toLocaleString()}` : '—';

export default function SalesPage() {
  usePageTitle('Sales & Income');
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<any>({
    defaultValues: { invoiceDate: dayjs(), dueDate: dayjs().add(30, 'day'), currency: 'USD', exchangeRate: 84 },
  });
  const { register: preg, handleSubmit: pSubmit, reset: preset, formState: { errors: perrors } } = useForm<any>({
    defaultValues: { receiptDate: dayjs(), exchangeRate: 84 },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = tab === 1 ? salesApi.overdue() : salesApi.list(page, 20);
      const res = await endpoint;
      if (tab === 1) {
        setRows(res.data.data);
        setTotal(res.data.data.length);
      } else {
        setRows(res.data.data.content);
        setTotal(res.data.data.totalElements);
      }
    } catch { setError('Failed to load invoices'); }
    finally { setLoading(false); }
  }, [page, tab]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); reset({ invoiceDate: dayjs(), dueDate: dayjs().add(30,'day'), currency: 'USD', exchangeRate: 84 }); setDialogOpen(true); };
  const openEdit = (row: any) => { setEditing(row); reset({ ...row, invoiceDate: dayjs(row.invoiceDate), dueDate: dayjs(row.dueDate) }); setDialogOpen(true); };

  const onSubmit = async (data: any) => {
    const payload = { ...data, invoiceDate: data.invoiceDate?.format('YYYY-MM-DD'), dueDate: data.dueDate?.format('YYYY-MM-DD') };
    try {
      editing ? await salesApi.update(editing.id, payload) : await salesApi.create(payload);
      enqueueSnackbar(editing ? 'Invoice updated' : 'Invoice created', { variant: 'success' });
      setDialogOpen(false); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' }); }
  };

  const onPayment = async (data: any) => {
    const payload = { ...data, receiptDate: data.receiptDate?.format('YYYY-MM-DD') };
    try {
      await salesApi.addPayment(paymentDialog.id, payload);
      enqueueSnackbar('Payment recorded', { variant: 'success' });
      setPaymentDialog(null); preset({}); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Failed', { variant: 'error' }); }
  };

  return (
    <Box>
      <PageHeader title="Sales & Income" subtitle="Manage export invoices and payments" onAdd={openAdd} addLabel="New Invoice" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ mb: 2 }}>
        <Tab label="All Invoices" />
        <Tab label={<Box display="flex" alignItems="center" gap={0.5}><WarningIcon fontSize="small" /> Overdue</Box>} />
      </Tabs>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Invoice #','Customer','Date','Due Date','Currency','Amount (Foreign)','Amount (INR)','Received','Outstanding','Status','Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.invoiceNumber}</TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{row.invoiceDate}</TableCell>
                  <TableCell>{row.dueDate}</TableCell>
                  <TableCell><Chip label={row.currency} size="small" variant="outlined" /></TableCell>
                  <TableCell>{fmtFx(row.amountForeign, row.currency)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{fmt(row.amountInr)}</TableCell>
                  <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{fmt(row.receivedAmount)}</TableCell>
                  <TableCell sx={{ color: Number(row.outstandingAmount) > 0 ? 'error.main' : 'text.secondary', fontWeight: 600 }}>
                    {fmt(row.outstandingAmount)}
                  </TableCell>
                  <TableCell><StatusChip status={row.status} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    {row.status !== 'PAID' && row.status !== 'CANCELLED' && (
                      <Tooltip title="Record Payment">
                        <IconButton size="small" color="success" onClick={() => { setPaymentDialog(row); preset({ receiptDate: dayjs(), exchangeRate: 84 }); }}>
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary' }}>No invoices found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {tab === 0 && <TablePagination component="div" count={total} page={page} rowsPerPage={20} onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]} />}
      </Card>

      {/* Invoice Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Invoice' : 'New Sales Invoice'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField label="Invoice Number" fullWidth size="small" {...register('invoiceNumber', { required: 'Required' })} error={!!errors.invoiceNumber} helperText={errors.invoiceNumber?.message as string} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Customer Name" fullWidth size="small" {...register('customerName', { required: 'Required' })} error={!!errors.customerName} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Customer Code" fullWidth size="small" {...register('customerCode')} /></Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="currency" control={control} render={({ field }) => (
                  <FormControl fullWidth size="small"><InputLabel>Currency</InputLabel>
                    <Select label="Currency" {...field}>{CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}><TextField label="Amount (Foreign)" type="number" fullWidth size="small" {...register('amountForeign', { required: 'Required' })} error={!!errors.amountForeign} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Exchange Rate (₹)" type="number" fullWidth size="small" {...register('exchangeRate', { required: 'Required' })} /></Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="invoiceDate" control={control} rules={{ required: true }} render={({ field }) => (
                  <DatePicker label="Invoice Date" {...field} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="dueDate" control={control} rules={{ required: true }} render={({ field }) => (
                  <DatePicker label="Due Date" {...field} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                )} />
              </Grid>
              <Grid item xs={12}><TextField label="Notes" fullWidth size="small" multiline rows={2} {...register('notes')} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialog} onClose={() => setPaymentDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Record Payment — {paymentDialog?.invoiceNumber}</DialogTitle>
        <form onSubmit={pSubmit(onPayment)} noValidate>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={1}>Outstanding: {fmt(paymentDialog?.outstandingAmount)}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller name="receiptDate" control={control} render={({ field }) => (
                  <DatePicker label="Payment Date" {...field} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}><TextField label="Amount Received (Foreign)" type="number" fullWidth size="small" {...preg('amountForeign', { required: 'Required' })} error={!!perrors.amountForeign} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Exchange Rate (₹)" type="number" fullWidth size="small" {...preg('exchangeRate', { required: 'Required' })} /></Grid>
              <Grid item xs={12}><TextField label="Bank Reference" fullWidth size="small" {...preg('bankReference')} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPaymentDialog(null)}>Cancel</Button>
            <Button type="submit" variant="contained" color="success">Record Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
