import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListItemIcon, Menu, MenuItem, IconButton } from '@mui/material';
import { ConfirmationNumber, Dashboard, People, Menu as MenuIcon } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = { role: 'admin' }; // Replace with actual user data

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem component={Link} to="/tickets" onClick={handleClose}>
          <ListItemIcon>
            <ConfirmationNumber fontSize="small" />
          </ListItemIcon>
          Заявки
        </MenuItem>
        <MenuItem component={Link} to="/dashboard" onClick={handleClose}>
          <ListItemIcon>
            <Dashboard fontSize="small" />
          </ListItemIcon>
          Дашборд
        </MenuItem>
        {user?.role === 'admin' && (
          <MenuItem component={Link} to="/users" onClick={handleClose}>
            <ListItemIcon>
              <People fontSize="small" />
            </ListItemIcon>
            Пользователи
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Navbar; 