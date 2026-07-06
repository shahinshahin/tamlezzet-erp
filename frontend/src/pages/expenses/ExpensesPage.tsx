import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, IconButton, Tooltip, Button, Chip,
  TextField, MenuItem, Select, FormControl, InputLabel, Grid, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { expenseApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAppSelector } from '../../hooks/useAppDispatch';

const CATEGORIES = ['TRAVEL','FUEL','HOTEL','PACKAGING','FREIGHT','MANUFACTURER','FARMER',
  'OFFICE','MARKETING','SALARY','CA','BANK_CHARGES','MISCELLANEOUS'];
const PAYMENT_MODES = ['CASH','BANK_TRANSFER','UPI','CHEQUE','CARD','CREDIT'];

const fmt = (v: any) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

export default function ExpensesPage() {
  usePageTitle('Expense Management');
  const { enqueueSnackbar } = useSnackbar();
  const user = useAppSelector(s => s.auth.user);
  const canApprove = ['ADMIN','MANAGER'].includes(user?.role ?? '');

  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: { expenseDate: dayjs(), gstAmount: 0, approvalStatus: 'PENDING' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expenseApi.list(page, rowsPerPage);
      setRows(res.data.data.content);
      setTotal(res.data.data.totalElements);
    } catch { setError('Failed to load expenses'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    reset({ expenseDate: dayjs(), gstAmount: 0 });
    setDialogOpen(true);
  };
  const openEdit = (row: any) => {
    setEditing(row);
    reset({ ...row, expenseDate: dayjs(row.expenseDate) });
    setDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    const payload = { ...data, expenseDate: data.expenseDate?.format('YYYY-MM-DD') };
    try {
      if (editing) {
        await expenseApi.update(editing.id, payload);
        enqueueSnackbar('Expense updated', { variant: 'success' });
      } else {
        await expenseApi.create(payload);
        enqueueSnackbar('Expense created', { variant: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await expenseApi.delete(deleteTarget);
      enqueueSnackbar('Expense deleted', { variant: 'success' });
      setDeleteTarget(null);
      load();
    } catch { enqueueSnackbar('Delete failed', { variant: 'error' }); }
  };

  const handleApprove = async (id: number) => {
    try {
      await expenseApi.approve(id);
      enqueueSnackbar('Approved', { variant: 'success' });
      load();
    } catch { enqueueSnackbar('Approval failed', { variant: 'error' }); }
  };

  const handleReject = async (id: number) => {
    try {
      await expenseApi.reject(id);
      enqueueSnackbar('Rejected', { variant: 'warning' });
      load();
    } catch { enqueueSnackbar('Rejection failed', { variant: 'error' }); }
  };

  const filtered = rows.filter(r =>
    r.vendor?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Expense Management"
        subtitle="Track and manage all business expenses"
        onAdd={openAdd}
        addLabel="Add Expense"
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search */}
      <Box mb={2}>
        <TextField
          placeholder="Search by vendor or category…"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 320 }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Date','Category','Vendor','Amount','GST','Payment Mode','Status','Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.expenseDate}</TableCell>
                  <TableCell><Chip label={row.category?.replace('_',' ')} size="small" /></TableCell>
                  <TableCell>{row.vendor}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{fmt(row.amount)}</TableCell>
                  <TableCell>{row.gstAmount > 0 ? fmt(row.gstAmount) : '—'}</TableCell>
                  <TableCell>{row.paymentMode?.replace('_',' ') ?? '—'}</TableCell>
                  <TableCell><StatusChip status={row.approvalStatus} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    {canApprove && row.approvalStatus === 'PENDING' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton size="small" color="success" onClick={() => handleApprove(row.id)}><CheckCircleIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" color="error" onClick={() => handleReject(row.id)}><CancelIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(row.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No expenses found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={total} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]}
        />
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="expenseDate" control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <DatePicker label="Expense Date" {...field} slotProps={{ textField: { fullWidth: true, size: 'small', error: !!errors.expenseDate } }} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category" control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select label="Category" {...field}>
                        {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c.replace('_',' ')}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Vendor" fullWidth size="small" {...register('vendor', { required: 'Required' })} error={!!errors.vendor} helperText={errors.vendor?.message as string} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Amount (₹)" type="number" fullWidth size="small" {...register('amount', { required: 'Required', min: { value: 0.01, message: 'Must be positive' } })} error={!!errors.amount} helperText={errors.amount?.message as string} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="GST Amount (₹)" type="number" fullWidth size="small" {...register('gstAmount')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="paymentMode" control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Payment Mode</InputLabel>
                      <Select label="Payment Mode" {...field}>
                        {PAYMENT_MODES.map(m => <MenuItem key={m} value={m}>{m.replace('_',' ')}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Reference No." fullWidth size="small" {...register('referenceNumber')} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Notes" fullWidth size="small" multiline rows={2} {...register('notes')} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
