import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button, Alert, Divider, Avatar, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { authApi } from '../../api/endpoints';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function ProfilePage() {
  usePageTitle('Profile');
  const user = useAppSelector(s => s.auth.user);
  const { enqueueSnackbar } = useSnackbar();
  const [pwLoading, setPwLoading] = useState(false);
  const [mfaQr, setMfaQr] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    oldPassword: string; newPassword: string; confirmPassword: string;
  }>();

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword(data.oldPassword, data.newPassword);
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      reset();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? 'Failed to change password', { variant: 'error' });
    } finally {
      setPwLoading(false);
    }
  };

  const setupMfa = async () => {
    try {
      const res = await authApi.mfaSetup();
      setMfaQr(res.data.data);
    } catch {
      enqueueSnackbar('Failed to generate MFA QR', { variant: 'error' });
    }
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  return (
    <Grid container spacing={3} maxWidth={800}>
      {/* Profile Info */}
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 22, fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{user?.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  {user?.role?.replace('_', ' ')}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                MFA Status: <strong>{user?.mfaEnabled ? 'Enabled ✓' : 'Disabled'}</strong>
              </Typography>
              {!user?.mfaEnabled && (
                <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={setupMfa}>
                  Enable MFA
                </Button>
              )}
              {mfaQr && (
                <Box mt={2}>
                  <Typography variant="body2" mb={1}>Scan with your authenticator app:</Typography>
                  <img src={mfaQr} alt="MFA QR Code" style={{ width: 200, height: 200 }} />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Change Password */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Change Password</Typography>
            <form onSubmit={handleSubmit(onChangePassword)} noValidate>
              <TextField
                label="Current Password" type="password" fullWidth margin="normal"
                {...register('oldPassword', { required: 'Required' })}
                error={!!errors.oldPassword} helperText={errors.oldPassword?.message}
              />
              <TextField
                label="New Password" type="password" fullWidth margin="normal"
                {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                error={!!errors.newPassword} helperText={errors.newPassword?.message}
              />
              <TextField
                label="Confirm New Password" type="password" fullWidth margin="normal"
                {...register('confirmPassword', { required: 'Required' })}
                error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={pwLoading}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
