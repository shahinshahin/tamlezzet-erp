import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, IconButton, Tooltip, Grid, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, Typography, Chip, Rating, InputAdornment, Drawer,
  List, ListItem, ListItemText, Divider, Tab, Tabs,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { farmerApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import { usePageTitle } from '../../hooks/usePageTitle';

const fmt = (v: any) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

export default function FarmersPage() {
  usePageTitle('Farmer Database');
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detailFarmer, setDetailFarmer] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [detailTab, setDetailTab] = useState(0);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();
  const { register: pr, handleSubmit: ps, reset: preset, formState: { errors: pe } } = useForm<any>();

  const load = useCallback(async () => {
    try {
      const res = await farmerApi.list(page, 20);
      setRows(res.data.data.content);
      setTotal(res.data.data.totalElements);
    } catch { setError('Failed to load farmers'); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); reset({}); setDialogOpen(true); };
  const openEdit = (row: any) => { setEditing(row); reset(row); setDialogOpen(true); };

  const openDetail = async (row: any) => {
    setDetailFarmer(row);
    try {
      const res = await farmerApi.getPurchases(row.id);
      setPurchases(res.data.data);
    } catch { setPurchases([]); }
  };

  const onSubmit = async (data: any) => {
    try {
      editing ? await farmerApi.update(editing.id, data) : await farmerApi.create(data);
      enqueueSnackbar(editing ? 'Farmer updated' : 'Farmer added', { variant: 'success' });
      setDialogOpen(false); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' }); }
  };

  const onPurchase = async (data: any) => {
    if (!detailFarmer) return;
    try {
      await farmerApi.recordPurchase(detailFarmer.id, data);
      enqueueSnackbar('Purchase recorded', { variant: 'success' });
      setPurchaseDialog(false); preset({});
      const res = await farmerApi.getPurchases(detailFarmer.id);
      setPurchases(res.data.data);
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Failed', { variant: 'error' }); }
  };

  const filtered = rows.filter(r =>
    r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.village?.toLowerCase().includes(search.toLowerCase()) ||
    r.mobile?.includes(search)
  );

  return (
    <Box>
      <PageHeader title="Farmer Database" subtitle="Manage farmer profiles, crops, and purchases" onAdd={openAdd} addLabel="Add Farmer" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box mb={2}>
        <TextField
          placeholder="Search by name, village or mobile…"
          size="small" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 360 }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name','Village','Mobile','Crop','Variety','Harvest','Quality','Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.fullName}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOnIcon fontSize="small" color="action" />
                      {row.village}
                    </Box>
                  </TableCell>
                  <TableCell>{row.mobile}</TableCell>
                  <TableCell>{row.cropName ?? '—'}</TableCell>
                  <TableCell>{row.cropVariety ?? '—'}</TableCell>
                  <TableCell>{row.harvestMonth ? `${row.harvestMonth} ${row.harvestYear ?? ''}` : '—'}</TableCell>
                  <TableCell>
                    {row.qualityRating ? <Rating value={Number(row.qualityRating)} precision={0.5} size="small" readOnly /> : '—'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="View Details"><IconButton size="small" onClick={() => openDetail(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No farmers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page} rowsPerPage={20} onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]} />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Farmer' : 'Add Farmer'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              {[
                { name: 'fullName', label: 'Full Name', required: true },
                { name: 'village', label: 'Village', required: true },
                { name: 'taluka', label: 'Taluka' },
                { name: 'district', label: 'District' },
                { name: 'state', label: 'State' },
                { name: 'mobile', label: 'Mobile' },
                { name: 'alternateMobile', label: 'Alternate Mobile' },
                { name: 'cropName', label: 'Crop Name' },
                { name: 'cropVariety', label: 'Crop Variety' },
                { name: 'harvestMonth', label: 'Harvest Month (e.g. JAN)' },
                { name: 'harvestYear', label: 'Harvest Year', type: 'number' },
                { name: 'qualityRating', label: 'Quality Rating (1-5)', type: 'number' },
                { name: 'latitude', label: 'Latitude', type: 'number' },
                { name: 'longitude', label: 'Longitude', type: 'number' },
              ].map(f => (
                <Grid item xs={12} sm={6} key={f.name}>
                  <TextField
                    label={f.label} fullWidth size="small" type={f.type ?? 'text'}
                    {...register(f.name, f.required ? { required: 'Required' } : {})}
                    error={!!errors[f.name]}
                    helperText={errors[f.name]?.message as string}
                  />
                </Grid>
              ))}
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

      {/* Farmer Detail Drawer */}
      <Drawer anchor="right" open={!!detailFarmer} onClose={() => setDetailFarmer(null)} PaperProps={{ sx: { width: 480 } }}>
        {detailFarmer && (
          <Box p={3}>
            <Typography variant="h6" fontWeight={700} mb={0.5}>{detailFarmer.fullName}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{detailFarmer.village}, {detailFarmer.district}</Typography>
            <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }}>
              <Tab label="Profile" />
              <Tab label={`Purchases (${purchases.length})`} />
            </Tabs>
            {detailTab === 0 && (
              <List dense>
                {[
                  ['Mobile', detailFarmer.mobile],
                  ['Crop', detailFarmer.cropName],
                  ['Variety', detailFarmer.cropVariety],
                  ['Harvest', `${detailFarmer.harvestMonth ?? ''} ${detailFarmer.harvestYear ?? ''}`],
                  ['Quality', detailFarmer.qualityRating],
                  ['GPS', detailFarmer.latitude ? `${detailFarmer.latitude}, ${detailFarmer.longitude}` : '—'],
                  ['Notes', detailFarmer.notes],
                ].map(([k, v]) => (
                  <React.Fragment key={String(k)}>
                    <ListItem disablePadding>
                      <ListItemText primary={String(v || '—')} secondary={String(k)} primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
            {detailTab === 1 && (
              <Box>
                <Button size="small" variant="outlined" startIcon={<ShoppingBagIcon />} onClick={() => setPurchaseDialog(true)} sx={{ mb: 2 }}>
                  Record Purchase
                </Button>
                {purchases.map(p => (
                  <Card key={p.id} sx={{ mb: 1.5, p: 1.5 }}>
                    <Typography fontWeight={600} fontSize={13}>{p.cropName} {p.cropVariety ? `(${p.cropVariety})` : ''}</Typography>
                    <Typography fontSize={12} color="text.secondary">{p.purchaseDate} · {p.quantityKg} kg @ {fmt(p.pricePerKg)}/kg</Typography>
                    <Typography fontSize={12} fontWeight={600} color="primary.main">Total: {fmt(p.totalAmount)}</Typography>
                  </Card>
                ))}
                {purchases.length === 0 && <Typography variant="body2" color="text.secondary">No purchases recorded</Typography>}
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* Record Purchase Dialog */}
      <Dialog open={purchaseDialog} onClose={() => setPurchaseDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record Purchase — {detailFarmer?.fullName}</DialogTitle>
        <form onSubmit={ps(onPurchase)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField label="Purchase Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} {...pr('purchaseDate', { required: 'Required' })} error={!!pe.purchaseDate} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Crop Name" fullWidth size="small" {...pr('cropName', { required: 'Required' })} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Variety" fullWidth size="small" {...pr('cropVariety')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Quantity (kg)" type="number" fullWidth size="small" {...pr('quantityKg', { required: 'Required' })} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Price/kg (₹)" type="number" fullWidth size="small" {...pr('pricePerKg', { required: 'Required' })} /></Grid>
              <Grid item xs={12}><TextField label="Notes" fullWidth size="small" {...pr('notes')} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPurchaseDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
