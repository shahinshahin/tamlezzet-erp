import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Chip, Divider,
  IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel,
  List, ListItem, ListItemText, Tab, Tabs,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { meetingApi, aiApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { usePageTitle } from '../../hooks/usePageTitle';

const STATUSES = ['SCHEDULED','COMPLETED','CANCELLED','POSTPONED'];

export default function MeetingsPage() {
  usePageTitle('Meeting Management');
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<any>({
    defaultValues: { scheduledAt: dayjs(), status: 'SCHEDULED' },
  });

  const load = useCallback(async () => {
    try {
      const res = tab === 1 ? await meetingApi.upcoming(14) : await meetingApi.list(0, 50);
      setRows(tab === 1 ? res.data.data : res.data.data.content);
    } catch { setError('Failed to load meetings'); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); reset({ scheduledAt: dayjs(), status: 'SCHEDULED' }); setDialogOpen(true); };
  const openEdit = (row: any) => { setEditing(row); reset({ ...row, scheduledAt: dayjs(row.scheduledAt) }); setDialogOpen(true); };

  const onSubmit = async (data: any) => {
    const payload = { ...data, scheduledAt: data.scheduledAt?.toISOString() };
    try {
      editing ? await meetingApi.update(editing.id, payload) : await meetingApi.create(payload);
      enqueueSnackbar(editing ? 'Meeting updated' : 'Meeting created', { variant: 'success' });
      setDialogOpen(false); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' }); }
  };

  const handleAiSummarize = async (minutes: string) => {
    if (!minutes?.trim()) { enqueueSnackbar('No minutes to summarize', { variant: 'warning' }); return; }
    setAiLoading(true);
    try {
      const res = await aiApi.summarizeMeeting(minutes);
      setAiSummary(res.data.data);
    } catch { enqueueSnackbar('AI summarization failed', { variant: 'error' }); }
    finally { setAiLoading(false); }
  };

  const minutes = watch('minutes');

  const statusColor: Record<string, string> = {
    SCHEDULED: '#1565c0', COMPLETED: '#2e7d32', CANCELLED: '#c62828', POSTPONED: '#f57c00',
  };

  return (
    <Box>
      <PageHeader title="Meeting Management" subtitle="Schedule, track, and summarize meetings" onAdd={openAdd} addLabel="New Meeting" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All Meetings" />
        <Tab label="Upcoming (14 days)" />
      </Tabs>

      <Grid container spacing={2}>
        {rows.map(m => (
          <Grid item xs={12} md={6} lg={4} key={m.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography fontWeight={700} fontSize={14}>{m.title}</Typography>
                  <StatusChip status={m.status} />
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(m.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    {m.durationMinutes ? ` (${m.durationMinutes} min)` : ''}
                  </Typography>
                </Box>
                {m.location && <Typography variant="body2" color="text.secondary">📍 {m.location}</Typography>}
                {m.agenda && (
                  <Box mt={1}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">AGENDA</Typography>
                    <Typography variant="body2" sx={{ mt: 0.3, whiteSpace: 'pre-line', fontSize: 12 }}>{m.agenda.slice(0, 150)}{m.agenda.length > 150 ? '…' : ''}</Typography>
                  </Box>
                )}
                {m.attendees?.length > 0 && (
                  <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                    {m.attendees.map((a: string) => <Chip key={a} label={a} size="small" sx={{ fontSize: 10 }} />)}
                  </Box>
                )}
                {m.followUp && (
                  <Box mt={1} p={1} bgcolor="#fff8e1" borderRadius={1}>
                    <Typography variant="caption" fontWeight={600} color="warning.main">FOLLOW UP</Typography>
                    <Typography variant="body2" sx={{ fontSize: 12 }}>{m.followUp}</Typography>
                  </Box>
                )}
              </CardContent>
              <Divider />
              <Box display="flex" justifyContent="flex-end" p={1}>
                <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(m)}><EditIcon fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
        {rows.length === 0 && (
          <Grid item xs={12}><Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No meetings found</Typography></Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Meeting' : 'New Meeting'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField label="Title" fullWidth size="small" {...register('title', { required: 'Required' })} error={!!errors.title} helperText={errors.title?.message as string} /></Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="scheduledAt" control={control} rules={{ required: true }} render={({ field }) => (
                  <DateTimePicker label="Scheduled At" {...field} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}><TextField label="Duration (minutes)" type="number" fullWidth size="small" {...register('durationMinutes')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Location" fullWidth size="small" {...register('location')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Meeting Link" fullWidth size="small" {...register('meetingLink')} /></Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="status" control={control} render={({ field }) => (
                  <FormControl fullWidth size="small"><InputLabel>Status</InputLabel>
                    <Select label="Status" {...field}>{STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid item xs={12}><TextField label="Agenda" fullWidth size="small" multiline rows={3} {...register('agenda')} /></Grid>
              <Grid item xs={12}>
                <TextField label="Minutes of Meeting" fullWidth size="small" multiline rows={4} {...register('minutes')} />
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Button
                    size="small" variant="outlined" startIcon={<SmartToyIcon />}
                    onClick={() => handleAiSummarize(minutes)}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Summarizing…' : 'AI Summarize'}
                  </Button>
                  {aiSummary && <Typography variant="caption" color="success.main">Summary ready ✓</Typography>}
                </Box>
                {aiSummary && (
                  <Box mt={1} p={1.5} bgcolor="#f1f8e9" borderRadius={1}>
                    <Typography variant="caption" fontWeight={600}>AI Summary:</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize: 12, mt: 0.5 }}>{aiSummary}</Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}><TextField label="Follow-Up Actions" fullWidth size="small" multiline rows={2} {...register('followUp')} /></Grid>
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
