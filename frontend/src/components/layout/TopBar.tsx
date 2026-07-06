import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu,
  MenuItem, ListItemIcon, Divider, Tooltip, Badge, Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockResetIcon from '@mui/icons-material/LockReset';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { authApi } from '../../api/endpoints';

export default function TopBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const sidebarOpen = useAppSelector(s => s.ui.sidebarOpen);
  const pageTitle = useAppSelector(s => s.ui.pageTitle);
  const user = useAppSelector(s => s.auth.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) { /* ignore */ }
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        color: 'text.primary',
        zIndex: 1100,
        left: sidebarOpen ? 260 : 64,
        width: `calc(100% - ${sidebarOpen ? 260 : 64}px)`,
        transition: 'left 0.2s ease, width 0.2s ease',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: 2 }}>
        <IconButton onClick={() => dispatch(toggleSidebar())} edge="start" sx={{ mr: 2 }}>
          {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1, color: 'text.primary' }}>
          {pageTitle}
        </Typography>

        {/* Role badge */}
        {user?.role && (
          <Chip
            label={user.role.replace('_', ' ')}
            size="small"
            sx={{ mr: 2, bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 11 }}
          />
        )}

        {/* Notifications placeholder */}
        <Tooltip title="Notifications">
          <IconButton sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Avatar Menu */}
        <Tooltip title="Account">
          <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography fontWeight={600} fontSize={14}>{user?.fullName}</Typography>
            <Typography fontSize={12} color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
            <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => { navigate('/profile?tab=security'); setAnchorEl(null); }}>
            <ListItemIcon><LockResetIcon fontSize="small" /></ListItemIcon>
            Change Password
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
