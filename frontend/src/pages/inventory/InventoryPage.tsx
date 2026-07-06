import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, IconButton, Tooltip, Grid, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, Typography, Chip, Tab, Tabs, MenuItem, Select,
  FormControl, InputLabel, InputAdornment, LinearProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import TuneIcon from '@mui/icons-material/Tune';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { inventoryApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import { usePageTitle } from '../../hooks/usePageTitle';

const ITEM_TYPES = ['RAW_MATERIAL', 'FINISHED_GOODS', 'PACKAGING', 'SEMI_FINISHED'];
const MOVEMENT_TYPES = ['INWARD', 'OUTWARD', 'ADJUSTMENT'];

export default function InventoryPage() {
  usePageTitle('Inventory');
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adjustDialog, setAdjustDialog] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<any>();
  const { register: ar, handleSubmit: as2, reset: areset, formState: { errors: ae } } = useForm<any>({
    defaultValues: { type: 'INWARD' },
  });

  const load = useCallback(async () => {
    try {
      if (tab === 1) {
        const res = await inventoryApi.lowStock();
        setRows(res.data.data); setTotal(res.data.data.length);
      } else if (tab === 2) {
        const res = await inventoryApi.expiringSoon(30);
        setRows(res.data.data); setTotal(res.data.data.length);
      } else {
        const res = await inventoryApi.list(page, 20);
        setRows(res.data.data.content); setTotal(res.data.data.totalElements);
      }
    } catch { setError('Failed to load inventory'); }
  }, [page, tab]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); reset({}); setDialogOpen(true); };
  const openEdit = (row: any) => { setEditing(row); reset(row); setDialogOpen(true); };

  const onSubmit = async (data: any) => {
    try {
      editing ? await inventoryApi.update(editing.id, data) : await inventoryApi.create(data);
      enqueueSnackbar(editing ? 'Item updated' : 'Item created', { variant: 'success' });
      setDialogOpen(false); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' }); }
  };

  const onAdjust = async (data: any) => {
    try {
      await inventoryApi.adjustStock(adjustDialog.id, data);
      enqueueSnackbar('Stock adjusted', { variant: 'success' });
      setAdjustDialog(null); areset({ type: 'INWARD' }); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Adjustment failed', { variant: 'error' }); }
  };

  const filtered = rows.filter(r =>
    r.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    r.sku?.toLowerCase().includes(search.toLowerCase()) ||
    r.warehouse?.toLowerCase().includes(search.toLowerCase())
  );

  const stockPct = (item: any) => {
    if (!item.reorderLevel || item.reorderLevel === 0) return 100;
    return Math.min((item.quantity / (item.reorderLevel * 3)) * 100, 100);
  };

  return (
    <Box>
      <PageHeader title="Inventory" subtitle="Raw materials, finished goods, and packaging" onAdd={openAdd} addLabel="Add Item" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ mb: 2 }}>
        <Tab label="All Items" />
        <Tab label={<Box display="flex" alignItems="center" gap={0.5}><WarningAmberIcon fontSize="small" color="warning" /> Low Stock</Box>} />
        <Tab label="Expiring Soon" />
      </Tabs>

      <Box mb={2}>
        <TextField
          placeholder="Search by name, SKU or warehouse…"
          size="small" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 340 }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Item Name','Type','SKU','Batch','Warehouse','Quantity','Unit','Reorder Lvl','Expiry','Stock Level','Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row.id} hover sx={{ bgcolor: row.lowStock ? '#fff8e1' : 'inherit' }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {row.lowStock && <WarningAmberIcon fontSize="small" color="warning" sx={{ mr: 0.5, verticalAlign: 'middle' }} />}
                    {row.itemName}
                  </TableCell>
                  <TableCell><Chip label={row.itemType?.replace('_',' ')} size="small" /></TableCell>
                  <TableCell>{row.sku ?? '—'}</TableCell>
                  <TableCell>{row.batchNumber ?? '—'}</TableCell>
                  <TableCell>{row.warehouse ?? '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: row.lowStock ? 'error.main' : 'text.primary' }}>{row.quantity}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.reorderLevel ?? '—'}</TableCell>
                  <TableCell sx={{ color: row.expiryDate && new Date(row.expiryDate) < new Date() ? 'error.main' : 'text.primary' }}>
                    {row.expiryDate ?? '—'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <LinearProgress
                      variant="determinate" value={stockPct(row)}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#f5f5f5',
                        '& .MuiLinearProgress-bar': { bgcolor: row.lowStock ? '#f44336' : '#4caf50' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Adjust Stock"><IconButton size="small" color="primary" onClick={() => { setAdjustDialog(row); areset({ type: 'INWARD' }); }}><TuneIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary' }}>No items found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {tab === 0 && <TablePagination component="div" count={total} page={page} rowsPerPage={20} onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]} />}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField label="Item Name" fullWidth size="small" {...register('itemName', { required: 'Required' })} error={!!errors.itemName} helperText={errors.itemName?.message as string} /></Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="itemType" control={control} rules={{ required: 'Required' }} render={({ field }) => (
                  <FormControl fullWidth size="small"><InputLabel>Item Type</InputLabel>
                    <Select label="Item Type" {...field}>{ITEM_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace(/_/g,' ')}</MenuItem>)}</Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid item xs={12} sm={4}><TextField label="SKU" fullWidth size="small" {...register('sku')} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Batch Number" fullWidth size="small" {...register('batchNumber')} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Warehouse" fullWidth size="small" {...register('warehouse')} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Quantity" type="number" fullWidth size="small" {...register('quantity')} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Unit" fullWidth size="small" {...register('unit', { required: 'Required' })} error={!!errors.unit} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Reorder Level" type="number" fullWidth size="small" {...register('reorderLevel')} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Cost/Unit (₹)" type="number" fullWidth size="small" {...register('costPerUnit')} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Manufacture Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} {...register('manufactureDate')} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Expiry Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} {...register('expiryDate')} /></Grid>
              <Grid item xs={12}><TextField label="Notes" fullWidth size="small" multiline rows={2} {...register('notes')} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={!!adjustDialog} onClose={() => setAdjustDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Adjust Stock — {adjustDialog?.itemName}</DialogTitle>
        <form onSubmit={as2(onAdjust)} noValidate>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={2}>Current: <strong>{adjustDialog?.quantity} {adjustDialog?.unit}</strong></Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Movement Type</InputLabel>
                  <Select label="Movement Type" defaultValue="INWARD" {...ar('type')}>
                    {MOVEMENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}><TextField label="Quantity" type="number" fullWidth size="small" {...ar('quantity', { required: 'Required' })} error={!!ae.quantity} /></Grid>
              <Grid item xs={12}><TextField label="Reference Number" fullWidth size="small" {...ar('reference')} /></Grid>
              <Grid item xs={12}><TextField label="Remarks" fullWidth size="small" {...ar('remarks')} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAdjustDialog(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Apply</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
