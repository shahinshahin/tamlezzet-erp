import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
  loading?: boolean;
}

export default function StatCard({ title, value, icon, color = '#1a5f3c', subtitle, loading }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={120} height={36} />
            ) : (
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              backgroundColor: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: color, flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
