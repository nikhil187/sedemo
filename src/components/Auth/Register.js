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

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup, updateUserProfile, signInWithGoogle, signInWithGithub } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      const userCredential = await signup(email, password);
      
      // Update display name if provided
      if (displayName) {
        await updateUserProfile(displayName);
      }
      
      showNotification('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to create an account');
      showNotification('Failed to create account: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      showNotification('Successfully registered with Google!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google registration error:', error);
      setError(error.message || 'Failed to register with Google');
      showNotification('Failed to register with Google: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGithubSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGithub();
      showNotification('Successfully registered with GitHub!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('GitHub registration error:', error);
      setError(error.message || 'Failed to register with GitHub');
      showNotification('Failed to register with GitHub: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create Account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            fullWidth
            id="displayName"
            label="Display Name (optional)"
            name="displayName"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
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
            Sign up with Google
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={handleGithubSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Sign up with GitHub
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Log In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;