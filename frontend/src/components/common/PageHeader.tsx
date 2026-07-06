import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, onAdd, addLabel = 'Add New', actions }: PageHeaderProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
      <Box>
        <Typography variant="h5" fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" mt={0.3}>{subtitle}</Typography>}
      </Box>
      <Box display="flex" gap={1} alignItems="center">
        {actions}
        {onAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} size="small">
            {addLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
