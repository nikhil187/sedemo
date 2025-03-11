import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import WorkIcon from '@mui/icons-material/Work';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const isDashboardPage = location.pathname === '/dashboard';
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
    handleClose();
  };
  
  const handleReports = () => {
    navigate('/reports');
    handleClose();
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    handleClose();
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        borderRadius: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      <Toolbar>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            flexGrow: 1 
          }}
          onClick={goToHome}
        >
          <WorkIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="div">
            ResumeFit
          </Typography>
        </Box>
        
        {currentUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isDashboardPage && (
              <Button 
                color="inherit" 
                onClick={handleDashboard}
                sx={{ mr: 2, borderRadius: 0 }}
              >
                Dashboard
              </Button>
            )}
            <Typography variant="body1" sx={{ mr: 2 }}>
              {currentUser.displayName || currentUser.email}
            </Typography>
            <Avatar 
              onClick={handleMenu}
              sx={{ cursor: 'pointer' }}
            >
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: { borderRadius: 0 }
              }}
            >
              {isDashboardPage ? null : (
                <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
              )}
              <MenuItem onClick={handleReports}>My Reports</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{ mr: 1, borderRadius: 0 }}
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              color="inherit"
              onClick={() => navigate('/register')}
              sx={{ borderRadius: 0 }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;