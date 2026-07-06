import React from 'react';
import { Chip } from '@mui/material';

const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  // Generic
  ACTIVE:    { bg: '#e8f5e9', color: '#2e7d32' },
  INACTIVE:  { bg: '#f5f5f5', color: '#757575' },
  // Approval
  PENDING:   { bg: '#fff8e1', color: '#f57c00' },
  APPROVED:  { bg: '#e8f5e9', color: '#2e7d32' },
  REJECTED:  { bg: '#ffebee', color: '#c62828' },
  // Invoice
  UNPAID:    { bg: '#fff8e1', color: '#f57c00' },
  PARTIAL:   { bg: '#e3f2fd', color: '#1565c0' },
  PAID:      { bg: '#e8f5e9', color: '#2e7d32' },
  OVERDUE:   { bg: '#ffebee', color: '#c62828' },
  CANCELLED: { bg: '#f5f5f5', color: '#757575' },
  // Shipment
  DRAFT:     { bg: '#f5f5f5', color: '#757575' },
  BOOKED:    { bg: '#e3f2fd', color: '#1565c0' },
  LOADING:   { bg: '#fff3e0', color: '#e65100' },
  SHIPPED:   { bg: '#e8eaf6', color: '#3949ab' },
  IN_TRANSIT:{ bg: '#e1f5fe', color: '#0277bd' },
  ARRIVED:   { bg: '#e8f5e9', color: '#2e7d32' },
  DELIVERED: { bg: '#e8f5e9', color: '#1b5e20' },
  // Task
  TODO:      { bg: '#f5f5f5', color: '#616161' },
  IN_PROGRESS:{ bg: '#e3f2fd', color: '#1565c0' },
  REVIEW:    { bg: '#fff8e1', color: '#f57c00' },
  DONE:      { bg: '#e8f5e9', color: '#2e7d32' },
  // Priority
  LOW:       { bg: '#e8f5e9', color: '#388e3c' },
  MEDIUM:    { bg: '#fff8e1', color: '#f57c00' },
  HIGH:      { bg: '#fff3e0', color: '#e64a19' },
  CRITICAL:  { bg: '#ffebee', color: '#c62828' },
  // CRM Stage
  LEAD:      { bg: '#f3e5f5', color: '#7b1fa2' },
  PROSPECT:  { bg: '#e8eaf6', color: '#3949ab' },
  SAMPLE_SENT:{ bg: '#e1f5fe', color: '#0277bd' },
  NEGOTIATION:{ bg: '#fff8e1', color: '#f57c00' },
  BUYER:     { bg: '#e8f5e9', color: '#2e7d32' },
};

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const colors = COLOR_MAP[status] ?? { bg: '#f5f5f5', color: '#616161' };
  const label = status.replace(/_/g, ' ');
  return (
    <Chip
      label={label}
      size={size}
      sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 600, fontSize: 11 }}
    />
  );
}
