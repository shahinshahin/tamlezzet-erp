import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, Divider, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setCredentials, setMfaRequired } from '../../store/slices/authSlice';
import { authApi } from '../../api/endpoints';

interface LoginForm {
  email: string;
  password: string;
  totpCode?: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { data: body } = res.data;

      if (body.mfaRequired) {
        setMfaStep(true);
        dispatch(setMfaRequired());
        setLoading(false);
        return;
      }

      dispatch(setCredentials({
        user: body.user,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
      }));
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a5f3c 0%, #0f3d25 50%, #f4a824 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo / Brand */}
          <Box textAlign="center" mb={3}>
            <Box
              sx={{
                width: 64, height: 64, borderRadius: '50%',
                bgcolor: 'primary.main', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', mb: 2,
              }}
            >
              <LockOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">TamLezzet ERP</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {mfaStep ? 'Enter your authenticator code' : 'Sign in to your account'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {!mfaStep ? (
              <>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  margin="normal"
                  autoComplete="email"
                  autoFocus
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <TextField
                label="Authenticator Code"
                type="text"
                fullWidth
                margin="normal"
                autoFocus
                inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                {...register('totpCode', {
                  required: 'Code is required',
                  minLength: { value: 6, message: 'Must be 6 digits' },
                })}
                error={!!errors.totpCode}
                helperText={errors.totpCode?.message ?? 'Enter the 6-digit code from your authenticator app'}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 1, height: 48 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : mfaStep ? 'Verify' : 'Sign In'}
            </Button>

            {mfaStep && (
              <Button fullWidth onClick={() => setMfaStep(false)} sx={{ mt: 1 }}>
                ← Back to login
              </Button>
            )}
          </form>

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            TamLezzet Export LLP © {new Date().getFullYear()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
