import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Grid, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Chip, Rating,
  CardContent, CardActions, InputAdornment, IconButton, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FactoryIcon from '@mui/icons-material/Factory';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { manufacturerApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import { usePageTitle } from '../../hooks/usePageTitle';

const fmt = (v: any) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

export default function ManufacturersPage() {
  usePageTitle('Manufacturers');
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  const load = useCallback(async () => {
    try {
      const res = await manufacturerApi.list(0, 100);
      setRows(res.data.data.content);
    } catch { setError('Failed to load manufacturers'); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); reset({}); setDialogOpen(true); };
  const openEdit = (row: any) => { setEditing(row); reset(row); setDialogOpen(true); };

  const onSubmit = async (data: any) => {
    try {
      editing ? await manufacturerApi.update(editing.id, data) : await manufacturerApi.create(data);
      enqueueSnackbar(editing ? 'Updated' : 'Added', { variant: 'success' });
      setDialogOpen(false); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' }); }
  };

  const filtered = rows.filter(r =>
    r.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <PageHeader title="Manufacturer Module" subtitle="Manage supplier and manufacturer profiles" onAdd={openAdd} addLabel="Add Manufacturer" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box mb={3}>
        <TextField
          placeholder="Search by company or city…"
          size="small" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 320 }}
        />
      </Box>

      <Grid container spacing={2.5}>
        {filtered.map(m => (
          <Grid item xs={12} sm={6} md={4} key={m.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FactoryIcon color="primary" />
                    <Typography fontWeight={700} fontSize={14}>{m.companyName}</Typography>
                  </Box>
                  <Chip label={m.active ? 'Active' : 'Inactive'} size="small"
                    sx={{ bgcolor: m.active ? '#e8f5e9' : '#f5f5f5', color: m.active ? '#2e7d32' : '#757575', fontWeight: 600, fontSize: 11 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">{m.city}{m.state ? `, ${m.state}` : ''}</Typography>
                {m.contactPerson && <Typography variant="body2" color="text.secondary">👤 {m.contactPerson}</Typography>}
                {m.email && <Typography variant="body2" color="text.secondary">✉ {m.email}</Typography>}
                {m.phone && <Typography variant="body2" color="text.secondary">📞 {m.phone}</Typography>}

                <Box mt={1.5} display="flex" gap={1} flexWrap="wrap">
                  {m.pricePerKg && <Chip label={`${fmt(m.pricePerKg)}/kg`} size="small" color="primary" variant="outlined" />}
                  {m.moqKg && <Chip label={`MOQ: ${m.moqKg} kg`} size="small" variant="outlined" />}
                  {m.leadTimeDays && <Chip label={`${m.leadTimeDays}d lead`} size="small" variant="outlined" />}
                </Box>

                {m.qualityScore && (
                  <Box mt={1} display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary">Quality:</Typography>
                    <Rating value={Number(m.qualityScore)} precision={0.5} size="small" readOnly />
                  </Box>
                )}

                {m.certifications?.length > 0 && (
                  <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                    {m.certifications.map((c: string) => (
                      <Chip key={c} icon={<VerifiedIcon />} label={c} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontSize: 10 }} />
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ px: 2, pb: 1.5 }}>
                <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(m)}>Edit</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No manufacturers found</Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Manufacturer' : 'Add Manufacturer'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              {[
                { name: 'companyName', label: 'Company Name', required: true, xs: 12 },
                { name: 'contactPerson', label: 'Contact Person' },
                { name: 'email', label: 'Email' },
                { name: 'phone', label: 'Phone' },
                { name: 'address', label: 'Address', xs: 12 },
                { name: 'city', label: 'City' },
                { name: 'state', label: 'State' },
                { name: 'gstNumber', label: 'GST Number' },
                { name: 'pricePerKg', label: 'Price/kg (₹)', type: 'number' },
                { name: 'moqKg', label: 'MOQ (kg)', type: 'number' },
                { name: 'leadTimeDays', label: 'Lead Time (days)', type: 'number' },
                { name: 'qualityScore', label: 'Quality Score (1-5)', type: 'number' },
              ].map(f => (
                <Grid item xs={12} sm={f.xs === 12 ? 12 : 6} key={f.name}>
                  <TextField
                    label={f.label} fullWidth size="small" type={f.type ?? 'text'}
                    {...register(f.name, f.required ? { required: 'Required' } : {})}
                    error={!!errors[f.name]} helperText={errors[f.name]?.message as string}
                  />
                </Grid>
              ))}
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
