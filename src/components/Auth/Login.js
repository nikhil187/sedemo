import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Link, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signInWithGoogle, signInWithGithub } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      showNotification('Successfully logged in!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in');
      showNotification('Failed to log in: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      showNotification('Successfully logged in with Google!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to log in with Google');
      showNotification('Failed to log in with Google: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGithubSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGithub();
      showNotification('Successfully logged in with GitHub!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('GitHub login error:', error);
      setError(error.message || 'Failed to log in with GitHub');
      showNotification('Failed to log in with GitHub: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Log In
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
          
          <Divider sx={{ my: 3 }}>OR</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Sign in with Google
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={handleGithubSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Sign in with GitHub
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;