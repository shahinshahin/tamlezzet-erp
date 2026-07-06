import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Grid, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Chip,
  CardContent, CardActions, InputAdornment, MenuItem,
  Select, FormControl, InputLabel, Tab, Tabs, Avatar,
  Tooltip, IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { customerApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { usePageTitle } from '../../hooks/usePageTitle';

const STAGES = ['LEAD','PROSPECT','SAMPLE_SENT','NEGOTIATION','BUYER','INACTIVE'];
const STAGE_COLORS: Record<string, string> = {
  LEAD: '#9c27b0', PROSPECT: '#3f51b5', SAMPLE_SENT: '#0277bd',
  NEGOTIATION: '#f57c00', BUYER: '#2e7d32', INACTIVE: '#757575',
};

export default function CustomersPage() {
  usePageTitle('Customers (CRM)');
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: { stage: 'LEAD' },
  });

  const load = useCallback(async () => {
    try {
      const res = stageFilter !== 'ALL'
        ? await customerApi.byStage(stageFilter)
        : await customerApi.list(0, 100);
      setRows(stageFilter !== 'ALL' ? res.data.data : res.data.data.content);
    } catch { setError('Failed to load customers'); }
  }, [stageFilter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); reset({ stage: 'LEAD' }); setDialogOpen(true); };
  const openEdit = (row: any) => { setEditing(row); reset(row); setDialogOpen(true); };

  const onSubmit = async (data: any) => {
    try {
      editing ? await customerApi.update(editing.id, data) : await customerApi.create(data);
      enqueueSnackbar(editing ? 'Customer updated' : 'Customer added', { variant: 'success' });
      setDialogOpen(false); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' }); }
  };

  const moveStage = async (id: number, stage: string) => {
    try {
      await customerApi.updateStage(id, stage);
      enqueueSnackbar('Stage updated', { variant: 'success' });
      load();
    } catch { enqueueSnackbar('Failed to update stage', { variant: 'error' }); }
  };

  const filtered = rows.filter(r =>
    r.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    r.country?.toLowerCase().includes(search.toLowerCase()) ||
    r.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = rows.filter(r => r.stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box>
      <PageHeader title="Customer CRM" subtitle="Leads, buyers, and relationship management" onAdd={openAdd} addLabel="Add Customer" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stage Pipeline Summary */}
      <Grid container spacing={1.5} mb={3}>
        {STAGES.map(s => (
          <Grid item xs={6} sm={4} md={2} key={s}>
            <Card
              sx={{ cursor: 'pointer', border: stageFilter === s ? `2px solid ${STAGE_COLORS[s]}` : '2px solid transparent', transition: 'all 0.15s' }}
              onClick={() => setStageFilter(stageFilter === s ? 'ALL' : s)}
            >
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h5" fontWeight={700} color={STAGE_COLORS[s]}>{stageCounts[s] ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.replace('_',' ')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mb={2} display="flex" gap={2} alignItems="center">
        <TextField
          placeholder="Search by company, country or contact…"
          size="small" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 360 }}
        />
        {stageFilter !== 'ALL' && (
          <Chip label={`Stage: ${stageFilter}`} onDelete={() => setStageFilter('ALL')} color="primary" size="small" />
        )}
      </Box>

      <Grid container spacing={2}>
        {filtered.map(c => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={c.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: STAGE_COLORS[c.stage] ?? '#9e9e9e', fontSize: 13, fontWeight: 700 }}>
                      {c.companyName?.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700} fontSize={13} lineHeight={1.2}>{c.companyName}</Typography>
                      <Typography fontSize={11} color="text.secondary">{c.country}</Typography>
                    </Box>
                  </Box>
                  <StatusChip status={c.stage} />
                </Box>

                {c.contactPerson && <Typography variant="body2" color="text.secondary">👤 {c.contactPerson}</Typography>}

                <Box display="flex" gap={0.5} mt={1}>
                  {c.whatsapp && (
                    <Tooltip title={`WhatsApp: ${c.whatsapp}`}>
                      <IconButton size="small" color="success" component="a" href={`https://wa.me/${c.whatsapp.replace(/\D/g,'')}`} target="_blank">
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {c.email && (
                    <Tooltip title={c.email}>
                      <IconButton size="small" color="primary" component="a" href={`mailto:${c.email}`}>
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {c.interestedProducts?.length > 0 && (
                  <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                    {c.interestedProducts.map((p: string) => <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: 10 }} />)}
                  </Box>
                )}

                {/* Stage Advance */}
                {c.stage !== 'BUYER' && c.stage !== 'INACTIVE' && (
                  <Box mt={1.5}>
                    <Typography variant="caption" color="text.secondary">Move to:</Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                      {STAGES.slice(STAGES.indexOf(c.stage) + 1, STAGES.indexOf(c.stage) + 3).map(ns => (
                        <Chip
                          key={ns} label={ns.replace('_',' ')} size="small"
                          onClick={() => moveStage(c.id, ns)}
                          sx={{ cursor: 'pointer', bgcolor: `${STAGE_COLORS[ns]}18`, color: STAGE_COLORS[ns], fontWeight: 600, fontSize: 10 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ px: 2, pb: 1.5 }}>
                <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(c)}>Edit</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}><Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No customers found</Typography></Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField label="Company Name" fullWidth size="small" {...register('companyName', { required: 'Required' })} error={!!errors.companyName} helperText={errors.companyName?.message as string} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Contact Person" fullWidth size="small" {...register('contactPerson')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Country" fullWidth size="small" {...register('country', { required: 'Required' })} error={!!errors.country} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="City" fullWidth size="small" {...register('city')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Email" type="email" fullWidth size="small" {...register('email')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="WhatsApp" fullWidth size="small" {...register('whatsapp')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Phone" fullWidth size="small" {...register('phone')} /></Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="stage" control={control} render={({ field }) => (
                  <FormControl fullWidth size="small"><InputLabel>Stage</InputLabel>
                    <Select label="Stage" {...field}>{STAGES.map(s => <MenuItem key={s} value={s}>{s.replace('_',' ')}</MenuItem>)}</Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid item xs={12}><TextField label="Address" fullWidth size="small" multiline rows={2} {...register('address')} /></Grid>
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
