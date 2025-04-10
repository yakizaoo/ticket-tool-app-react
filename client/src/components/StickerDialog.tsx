import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

interface StickerDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const StickerDialog: React.FC<StickerDialogProps> = ({ 
  open, 
  onClose, 
  message = 'не надо дядя' 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <video 
            autoPlay 
            loop 
            muted
            style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
          >
            <source src="/src/utils/sticker.webm" type="video/webm" />
            Ваш браузер не поддерживает видео
          </video>
        </Box>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', fontSize: '24px' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          size="large"
        >
          Понятно
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StickerDialog; 