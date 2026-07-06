import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Grid, Typography, Button, Alert, Chip,
  CardContent, CardActions, InputAdornment, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, Tab, Tabs,
  IconButton, Tooltip, LinearProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useSnackbar } from 'notistack';
import { documentApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { usePageTitle } from '../../hooks/usePageTitle';

const CATEGORIES = ['LLP','GST','FSSAI','IEC','TRADEMARK','CONTRACT','INVOICE','LAB_REPORT','BANK','INSURANCE','OTHER'];

const CAT_COLORS: Record<string, string> = {
  LLP: '#7b1fa2', GST: '#1565c0', FSSAI: '#2e7d32', IEC: '#e65100',
  TRADEMARK: '#c62828', CONTRACT: '#00695c', INVOICE: '#f57c00',
  LAB_REPORT: '#0277bd', BANK: '#4527a0', INSURANCE: '#558b2f', OTHER: '#616161',
};

const fmtSize = (bytes: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export default function DocumentsPage() {
  usePageTitle('Document Vault');
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMeta, setUploadMeta] = useState({
    title: '', category: 'OTHER', issueDate: '', expiryDate: '',
    referenceNumber: '', description: '',
  });

  const load = useCallback(async () => {
    try {
      if (tab === 1) {
        const res = await documentApi.expiringSoon(30);
        setRows(res.data.data);
      } else if (search.trim().length > 1) {
        const res = await documentApi.search(search);
        setRows(res.data.data);
      } else if (catFilter !== 'ALL') {
        const res = await documentApi.byCategory(catFilter);
        setRows(res.data.data);
      } else {
        const res = await documentApi.list(0, 100);
        setRows(res.data.data.content);
      }
    } catch { setError('Failed to load documents'); }
  }, [tab, search, catFilter]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async () => {
    if (!uploadFile) { enqueueSnackbar('Please select a file', { variant: 'warning' }); return; }
    if (!uploadMeta.title.trim()) { enqueueSnackbar('Title is required', { variant: 'warning' }); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', uploadFile);
      form.append('title', uploadMeta.title);
      form.append('category', uploadMeta.category);
      if (uploadMeta.issueDate) form.append('issueDate', uploadMeta.issueDate);
      if (uploadMeta.expiryDate) form.append('expiryDate', uploadMeta.expiryDate);
      if (uploadMeta.referenceNumber) form.append('referenceNumber', uploadMeta.referenceNumber);
      if (uploadMeta.description) form.append('description', uploadMeta.description);
      await documentApi.upload(form);
      enqueueSnackbar('Document uploaded', { variant: 'success' });
      setUploadOpen(false);
      setUploadFile(null);
      setUploadMeta({ title: '', category: 'OTHER', issueDate: '', expiryDate: '', referenceNumber: '', description: '' });
      load();
    } catch (e: any) { enqueueSnackbar(e?.response?.data?.message ?? 'Upload failed', { variant: 'error' }); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await documentApi.delete(deleteTarget);
      enqueueSnackbar('Document deleted', { variant: 'success' });
      setDeleteTarget(null); load();
    } catch { enqueueSnackbar('Delete failed', { variant: 'error' }); }
  };

  const daysUntilExpiry = (d: string) => {
    if (!d) return null;
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  };

  return (
    <Box>
      <PageHeader
        title="Document Vault"
        subtitle="Store and manage all compliance and business documents"
        onAdd={() => setUploadOpen(true)}
        addLabel="Upload Document"
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All Documents" />
        <Tab label={<Box display="flex" alignItems="center" gap={0.5}><WarningAmberIcon fontSize="small" color="warning" /> Expiring Soon</Box>} />
      </Tabs>

      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        <TextField
          placeholder="Search documents…"
          size="small" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 300 }}
        />
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select value={catFilter} label="Category" onChange={e => setCatFilter(e.target.value)}>
            <MenuItem value="ALL">All Categories</MenuItem>
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Category chips summary */}
      {tab === 0 && catFilter === 'ALL' && (
        <Box mb={2} display="flex" gap={1} flexWrap="wrap">
          {CATEGORIES.map(cat => {
            const count = rows.filter(r => r.category === cat).length;
            if (!count) return null;
            return (
              <Chip
                key={cat} label={`${cat} (${count})`} size="small"
                onClick={() => setCatFilter(cat)}
                sx={{ bgcolor: `${CAT_COLORS[cat]}18`, color: CAT_COLORS[cat], fontWeight: 600, fontSize: 11 }}
              />
            );
          })}
        </Box>
      )}

      <Grid container spacing={2}>
        {rows.map(doc => {
          const days = daysUntilExpiry(doc.expiryDate);
          const expired = days !== null && days < 0;
          const expiringSoon = days !== null && days >= 0 && days <= 30;
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: expired ? '1px solid #f44336' : expiringSoon ? '1px solid #ff9800' : undefined }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FolderIcon sx={{ color: CAT_COLORS[doc.category] ?? '#616161' }} />
                      <Chip
                        label={doc.category}
                        size="small"
                        sx={{ bgcolor: `${CAT_COLORS[doc.category]}18`, color: CAT_COLORS[doc.category], fontWeight: 700, fontSize: 10 }}
                      />
                    </Box>
                    {expired && <Chip label="EXPIRED" color="error" size="small" sx={{ fontSize: 9 }} />}
                    {expiringSoon && <Chip label={`${days}d left`} color="warning" size="small" sx={{ fontSize: 9 }} />}
                  </Box>
                  <Typography fontWeight={700} fontSize={13} mb={0.5}>{doc.title}</Typography>
                  {doc.originalFileName && (
                    <Typography variant="caption" color="text.secondary" display="block">{doc.originalFileName}</Typography>
                  )}
                  {doc.referenceNumber && (
                    <Typography variant="body2" color="text.secondary" fontSize={12}>Ref: {doc.referenceNumber}</Typography>
                  )}
                  <Box mt={1} display="flex" gap={2}>
                    {doc.issueDate && <Typography variant="caption" color="text.secondary">Issued: {doc.issueDate}</Typography>}
                    {doc.expiryDate && (
                      <Typography variant="caption" color={expired ? 'error.main' : expiringSoon ? 'warning.main' : 'text.secondary'}>
                        Expires: {doc.expiryDate}
                      </Typography>
                    )}
                  </Box>
                  {doc.fileSizeBytes && (
                    <Typography variant="caption" color="text.secondary">{fmtSize(doc.fileSizeBytes)}</Typography>
                  )}
                </CardContent>
                <CardActions sx={{ px: 2, pb: 1.5, justifyContent: 'space-between' }}>
                  <Tooltip title="Download">
                    <IconButton size="small" color="primary" component="a" href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(doc.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        {rows.length === 0 && (
          <Grid item xs={12}><Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No documents found</Typography></Grid>
        )}
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}
                sx={{ py: 2, border: '2px dashed', borderColor: uploadFile ? 'success.main' : 'grey.400' }}>
                {uploadFile ? uploadFile.name : 'Click to select file'}
                <input type="file" hidden onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
              </Button>
            </Grid>
            <Grid item xs={12}><TextField label="Document Title" fullWidth size="small" value={uploadMeta.title} onChange={e => setUploadMeta(p => ({ ...p, title: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={uploadMeta.category} label="Category" onChange={e => setUploadMeta(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Reference Number" fullWidth size="small" value={uploadMeta.referenceNumber} onChange={e => setUploadMeta(p => ({ ...p, referenceNumber: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Issue Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={uploadMeta.issueDate} onChange={e => setUploadMeta(p => ({ ...p, issueDate: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Expiry Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={uploadMeta.expiryDate} onChange={e => setUploadMeta(p => ({ ...p, expiryDate: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth size="small" multiline rows={2} value={uploadMeta.description} onChange={e => setUploadMeta(p => ({ ...p, description: e.target.value }))} /></Grid>
          </Grid>
          {uploading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={uploading} startIcon={<UploadFileIcon />}>Upload</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Document"
        message="This will permanently delete the document from S3. Are you sure?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
