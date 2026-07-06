import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, IconButton, Tooltip, Grid, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, Typography, Chip, Tab, Tabs, MenuItem, Select,
  FormControl, InputLabel, InputAdornment, Stepper, Step, StepLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { shipmentApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { usePageTitle } from '../../hooks/usePageTitle';

const SHIPMENT_STATUSES = ['DRAFT','BOOKED','LOADING','SHIPPED','IN_TRANSIT','ARRIVED','DELIVERED','CANCELLED'];
const PAYMENT_STATUSES = ['PENDING','PARTIAL','RECEIVED','OVERDUE'];
const STEPS = ['DRAFT','BOOKED','LOADING','SHIPPED','IN_TRANSIT','ARRIVED','DELIVERED'];

export default function ShipmentsPage() {
  usePageTitle('Export Shipments');
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: { status: 'DRAFT', paymentStatus: 'PENDING' },
  });

  const load = useCallback(async () => {
    try {
      if (tab === 1) {
        const res = await shipmentApi.byStatus('SHIPPED');
        const res2 = await shipmentApi.byStatus('IN_TRANSIT');
        setRows([...res.data.data, ...res2.data.data]);
        setTotal(res.data.data.length + res2.data.data.length);
      } else if (tab === 2) {
        const res = await shipmentApi.upcomingArrivals(30);
        setRows(res.data.data); setTotal(res.data.data.length);
      } else {
        const res = await shipmentApi.list(page, 20);
        setRows(res.data.data.content); setTotal(res.data.data.totalElements);
      }
    } catch { setError('Failed to load shipments'); }
  }, [page, tab]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); reset({ status: 'DRAFT', paymentStatus: 'PENDING' }); setDialogOpen(true); };
  const openEdit = (row: any) => { setEditing(row); reset(row); setDialogOpen(true); };

  const onSubmit = async (data: any) => {
    try {
      editing ? await shipmentApi.update(editing.id, data) : await shipmentApi.create(data);
      enqueueSnackbar(editing ? 'Shipment updated' : 'Shipment created', { variant: 'success' });
      setDialogOpen(false); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' }); }
  };

  const filtered = rows.filter(r =>
    r.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.buyerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.destinationCountry?.toLowerCase().includes(search.toLowerCase()) ||
    r.containerNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtUsd = (v: any) => v ? `$${Number(v).toLocaleString()}` : '—';

  return (
    <Box>
      <PageHeader title="Export Module" subtitle="Track shipments, containers, and buyer payments" onAdd={openAdd} addLabel="New Shipment" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ mb: 2 }}>
        <Tab label="All Shipments" />
        <Tab label="In Transit" />
        <Tab label="Arriving (30 days)" />
      </Tabs>

      <Box mb={2}>
        <TextField
          placeholder="Search by shipment#, buyer, destination, container…"
          size="small" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 420 }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Shipment #','Buyer','Destination','Container','Vessel','ETD','ETA','Invoice (USD)','Status','Payment','Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocalShippingIcon fontSize="small" color="action" />
                      {row.shipmentNumber}
                    </Box>
                  </TableCell>
                  <TableCell>{row.buyerName}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography fontSize={12} fontWeight={500}>{row.destinationCountry}</Typography>
                      {row.destinationPort && <Typography fontSize={11} color="text.secondary">{row.destinationPort}</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell>{row.containerNumber ?? '—'}</TableCell>
                  <TableCell>{row.vesselName ?? '—'}</TableCell>
                  <TableCell>{row.etd ?? '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: row.eta && new Date(row.eta) < new Date() ? 'warning.main' : 'text.primary' }}>
                    {row.eta ?? '—'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{fmtUsd(row.invoiceValueUsd)}</TableCell>
                  <TableCell><StatusChip status={row.status} /></TableCell>
                  <TableCell><StatusChip status={row.paymentStatus} /></TableCell>
                  <TableCell>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary' }}>No shipments found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {tab === 0 && <TablePagination component="div" count={total} page={page} rowsPerPage={20} onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]} />}
      </Card>

      {/* Shipment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Shipment' : 'New Shipment'}</DialogTitle>
        {editing && (
          <Box px={3} pb={1}>
            <Stepper activeStep={STEPS.indexOf(editing.status)} alternativeLabel>
              {STEPS.map(s => <Step key={s}><StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: 10 } }}>{s}</StepLabel></Step>)}
            </Stepper>
          </Box>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField label="Shipment Number" fullWidth size="small" {...register('shipmentNumber', { required: 'Required' })} error={!!errors.shipmentNumber} helperText={errors.shipmentNumber?.message as string} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Buyer Name" fullWidth size="small" {...register('buyerName', { required: 'Required' })} error={!!errors.buyerName} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Buyer Code" fullWidth size="small" {...register('buyerCode')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Destination Country" fullWidth size="small" {...register('destinationCountry', { required: 'Required' })} error={!!errors.destinationCountry} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Destination Port" fullWidth size="small" {...register('destinationPort')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Origin Port" fullWidth size="small" {...register('originPort')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Container Number" fullWidth size="small" {...register('containerNumber')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Vessel Name" fullWidth size="small" {...register('vesselName')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Voyage Number" fullWidth size="small" {...register('voyageNumber')} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="Shipment Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} {...register('shipmentDate')} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="ETD" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} {...register('etd')} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="ETA" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} {...register('eta')} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="Actual Arrival" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} {...register('actualArrival')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Invoice Number" fullWidth size="small" {...register('invoiceNumber')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Shipping Bill Number" fullWidth size="small" {...register('shippingBillNumber')} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="Net Weight (kg)" type="number" fullWidth size="small" {...register('netWeightKg')} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="Gross Weight (kg)" type="number" fullWidth size="small" {...register('grossWeightKg')} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="Invoice Value (USD)" type="number" fullWidth size="small" {...register('invoiceValueUsd')} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="Freight Cost (₹)" type="number" fullWidth size="small" {...register('freightCost')} /></Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="status" control={control} render={({ field }) => (
                  <FormControl fullWidth size="small"><InputLabel>Shipment Status</InputLabel>
                    <Select label="Shipment Status" {...field}>{SHIPMENT_STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace('_',' ')}</MenuItem>)}</Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="paymentStatus" control={control} render={({ field }) => (
                  <FormControl fullWidth size="small"><InputLabel>Payment Status</InputLabel>
                    <Select label="Payment Status" {...field}>{PAYMENT_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
                  </FormControl>
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
    </Box>
  );
}
