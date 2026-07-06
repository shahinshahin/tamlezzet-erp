import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Chip, Divider,
  IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel,
  Tab, Tabs, LinearProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonIcon from '@mui/icons-material/Person';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { taskApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAppSelector } from '../../hooks/useAppDispatch';

const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const STATUSES = ['TODO','IN_PROGRESS','REVIEW','DONE','CANCELLED'];
const STATUS_COLS = ['TODO','IN_PROGRESS','REVIEW','DONE'];

const PRIORITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function TasksPage() {
  usePageTitle('Task Management');
  const { enqueueSnackbar } = useSnackbar();
  const user = useAppSelector(s => s.auth.user);
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: { priority: 'MEDIUM', assignedTo: user?.email ?? '' },
  });

  const load = useCallback(async () => {
    try {
      if (tab === 1) {
        const res = await taskApi.overdue();
        setRows(res.data.data);
      } else if (tab === 2) {
        const res = await taskApi.listByAssignee(user?.email ?? '');
        setRows(res.data.data);
      } else {
        const res = await taskApi.list(0, 100);
        setRows(res.data.data.content);
      }
    } catch { setError('Failed to load tasks'); }
  }, [tab, user?.email]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); reset({ priority: 'MEDIUM', assignedTo: user?.email ?? '' }); setDialogOpen(true); };
  const openEdit = (row: any) => { setEditing(row); reset(row); setDialogOpen(true); };

  const onSubmit = async (data: any) => {
    try {
      editing ? await taskApi.update(editing.id, data) : await taskApi.create(data);
      enqueueSnackbar(editing ? 'Task updated' : 'Task created', { variant: 'success' });
      setDialogOpen(false); load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Save failed', { variant: 'error' }); }
  };

  const moveStatus = async (id: number, status: string) => {
    try {
      await taskApi.updateStatus(id, status);
      enqueueSnackbar('Status updated', { variant: 'success' });
      load();
    } catch { enqueueSnackbar('Failed', { variant: 'error' }); }
  };

  const colTasks = (col: string) =>
    rows.filter(r => r.status === col).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const overallProgress = rows.length
    ? Math.round((rows.filter(r => r.status === 'DONE').length / rows.length) * 100)
    : 0;

  return (
    <Box>
      <PageHeader title="Task Management" subtitle="Assign, track, and complete tasks" onAdd={openAdd} addLabel="New Task" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Progress bar */}
      {rows.length > 0 && (
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="text.secondary">{rows.length} total tasks</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">{overallProgress}% complete</Typography>
          </Box>
          <LinearProgress variant="determinate" value={overallProgress} sx={{ height: 8, borderRadius: 4 }} color="success" />
        </Box>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Kanban Board" />
        <Tab label={<Box display="flex" alignItems="center" gap={0.5}><WarningAmberIcon fontSize="small" color="warning" /> Overdue</Box>} />
        <Tab label="My Tasks" />
      </Tabs>

      {tab === 0 ? (
        /* Kanban columns */
        <Grid container spacing={2}>
          {STATUS_COLS.map(col => (
            <Grid item xs={12} sm={6} md={3} key={col}>
              <Box sx={{ bgcolor: '#f5f7f5', borderRadius: 2, p: 1.5, minHeight: 400 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Typography fontWeight={700} fontSize={12} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                    {col.replace('_',' ')}
                  </Typography>
                  <Chip label={colTasks(col).length} size="small" sx={{ fontSize: 10, height: 18 }} />
                </Box>
                {colTasks(col).map(task => {
                  const isOverdue = task.status !== 'DONE' && task.dueDate && new Date(task.dueDate) < new Date();
                  return (
                    <Card key={task.id} sx={{ mb: 1.5, cursor: 'pointer', border: isOverdue ? '1px solid #f44336' : undefined }}
                      onClick={() => openEdit(task)}>
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <StatusChip status={task.priority} />
                          {isOverdue && <Chip label="OVERDUE" size="small" color="error" sx={{ fontSize: 9, height: 16 }} />}
                        </Box>
                        <Typography fontWeight={600} fontSize={13} mt={0.5}>{task.title}</Typography>
                        {task.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, mt: 0.3 }}>
                            {task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}
                          </Typography>
                        )}
                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <PersonIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">{task.assignedTo?.split('@')[0]}</Typography>
                          </Box>
                          <Typography variant="caption" color={isOverdue ? 'error.main' : 'text.secondary'}>{task.dueDate}</Typography>
                        </Box>
                        {/* Move buttons */}
                        <Box display="flex" gap={0.5} mt={1} onClick={e => e.stopPropagation()}>
                          {STATUS_COLS.filter(s => s !== col).slice(0, 2).map(ns => (
                            <Chip key={ns} label={`→ ${ns.replace('_',' ')}`} size="small"
                              onClick={() => moveStatus(task.id, ns)}
                              sx={{ cursor: 'pointer', fontSize: 9, height: 18 }} variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* List view */
        <Card>
          {rows.map((task, idx) => {
            const isOverdue = task.status !== 'DONE' && task.dueDate && new Date(task.dueDate) < new Date();
            return (
              <React.Fragment key={task.id}>
                <Box display="flex" alignItems="center" px={2} py={1.5} sx={{ bgcolor: isOverdue ? '#fff8e1' : 'inherit' }}>
                  <Box flexGrow={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.3}>
                      <StatusChip status={task.priority} />
                      <StatusChip status={task.status} />
                      <Typography fontWeight={600} fontSize={13}>{task.title}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Due: {task.dueDate} · Assigned to: {task.assignedTo}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(task)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    {task.status !== 'DONE' && (
                      <Tooltip title="Mark Done">
                        <IconButton size="small" color="success" onClick={() => moveStatus(task.id, 'DONE')}><CheckCircleIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                {idx < rows.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
          {rows.length === 0 && <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No tasks found</Typography>}
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Task' : 'New Task'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField label="Title" fullWidth size="small" {...register('title', { required: 'Required' })} error={!!errors.title} helperText={errors.title?.message as string} /></Grid>
              <Grid item xs={12}><TextField label="Description" fullWidth size="small" multiline rows={2} {...register('description')} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Assigned To (email)" fullWidth size="small" {...register('assignedTo', { required: 'Required' })} error={!!errors.assignedTo} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Due Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} {...register('dueDate', { required: 'Required' })} error={!!errors.dueDate} /></Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="priority" control={control} render={({ field }) => (
                  <FormControl fullWidth size="small"><InputLabel>Priority</InputLabel>
                    <Select label="Priority" {...field}>{PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}</Select>
                  </FormControl>
                )} />
              </Grid>
              {editing && (
                <Grid item xs={12} sm={6}>
                  <Controller name="status" control={control} render={({ field }) => (
                    <FormControl fullWidth size="small"><InputLabel>Status</InputLabel>
                      <Select label="Status" {...field}>{STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace('_',' ')}</MenuItem>)}</Select>
                    </FormControl>
                  )} />
                </Grid>
              )}
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
