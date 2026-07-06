import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Divider, Tooltip, Collapse,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import FactoryIcon from '@mui/icons-material/Factory';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import TaskIcon from '@mui/icons-material/Task';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FolderIcon from '@mui/icons-material/Folder';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAppSelector } from '../../hooks/useAppDispatch';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      path: '/dashboard',      icon: <DashboardIcon /> },
  { label: 'Expenses',       path: '/expenses',        icon: <ReceiptIcon /> },
  { label: 'Sales & Income', path: '/sales',           icon: <AttachMoneyIcon /> },
  { label: 'Farmers',        path: '/farmers',         icon: <AgricultureIcon /> },
  { label: 'Manufacturers',  path: '/manufacturers',   icon: <FactoryIcon /> },
  { label: 'Inventory',      path: '/inventory',       icon: <Inventory2Icon /> },
  { label: 'Customers (CRM)',path: '/customers',       icon: <PeopleIcon /> },
  { label: 'Meetings',       path: '/meetings',        icon: <EventIcon /> },
  { label: 'Tasks',          path: '/tasks',            icon: <TaskIcon /> },
  { label: 'Shipments',      path: '/shipments',       icon: <LocalShippingIcon /> },
  { label: 'Documents',      path: '/documents',       icon: <FolderIcon /> },
  { label: 'Finance',        path: '/finance',         icon: <AccountBalanceIcon /> },
  { label: 'AI Assistant',   path: '/ai-assistant',    icon: <SmartToyIcon /> },
];

interface SidebarProps { drawerWidth: number }

export default function Sidebar({ drawerWidth }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarOpen = useAppSelector(s => s.ui.sidebarOpen);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarOpen ? drawerWidth : 64,
        flexShrink: 0,
        position: 'fixed',
        height: '100vh',
        zIndex: 1200,
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? drawerWidth : 64,
          boxSizing: 'border-box',
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
          background: 'linear-gradient(180deg, #1a5f3c 0%, #0f3d25 100%)',
          color: 'white',
          borderRight: 'none',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', minHeight: 64, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f4a824', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Typography fontWeight={800} color="#1a5f3c" fontSize={14}>T</Typography>
        </Box>
        {sidebarOpen && (
          <Box ml={1.5}>
            <Typography fontWeight={700} fontSize={13} color="white" lineHeight={1.2}>TamLezzet</Typography>
            <Typography fontSize={10} color="rgba(255,255,255,0.6)" lineHeight={1}>Export LLP</Typography>
          </Box>
        )}
      </Box>

      {/* Nav Items */}
      <List sx={{ px: 1, py: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Tooltip key={item.path} title={!sidebarOpen ? item.label : ''} placement="right" arrow>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: sidebarOpen ? 1.5 : 1,
                    backgroundColor: active ? 'rgba(244,168,36,0.2)' : 'transparent',
                    borderLeft: active ? '3px solid #f4a824' : '3px solid transparent',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  <ListItemIcon sx={{ color: active ? '#f4a824' : 'rgba(255,255,255,0.7)', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        color: active ? '#f4a824' : 'rgba(255,255,255,0.85)',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Drawer>
  );
}
