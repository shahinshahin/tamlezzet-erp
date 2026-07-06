import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAppSelector } from '../../hooks/useAppDispatch';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const sidebarOpen = useAppSelector(s => s.ui.sidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar drawerWidth={DRAWER_WIDTH} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: sidebarOpen ? `${DRAWER_WIDTH}px` : '64px',
          transition: 'margin 0.2s ease',
          minHeight: '100vh',
        }}
      >
        <TopBar />
        <Box sx={{ p: 3, flexGrow: 1, mt: '64px' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
