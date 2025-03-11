import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getUserReports, deleteReport } from '../../services/mongoDb';

function SavedReports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    // If no user, redirect to login
    if (!currentUser || !currentUser.uid) {
      showNotification('You must be logged in to view saved reports', 'error');
      navigate('/login');
      return;
    }
    
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Loading reports for user:", currentUser.uid);
        
        // Get reports from MongoDB
        const userReports = await getUserReports(currentUser.uid);
        
        console.log("Reports loaded:", userReports);
        
        setReports(userReports);
        setLoading(false);
      } catch (error) {
        console.error('Error loading reports:', error);
        setError(error.message || "Failed to load reports");
        showNotification('Failed to load reports: ' + error.message, 'error');
        setLoading(false);
      }
    };
    
    loadReports();
  }, [currentUser, navigate, showNotification]);
  
  const handleViewReport = (reportId) => {
    if (!reportId) {
      showNotification('Invalid report ID', 'error');
      return;
    }
    navigate(`/reports/${reportId}`);
  };
  
  const handleDeleteReport = async (reportId) => {
    if (!reportId) {
      showNotification('Invalid report ID', 'error');
      return;
    }
    
    try {
      await deleteReport(currentUser.uid, reportId);
      
      // Remove the deleted report from the state
      setReports(reports.filter(report => report._id !== reportId));
      
      showNotification('Report deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting report:', error);
      showNotification('Failed to delete report: ' + error.message, 'error');
    }
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading saved reports...
        </Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Failed to load reports
          </Typography>
          <Typography variant="body1" paragraph>
            We encountered an error while loading your saved reports. Please try again later.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Saved Reports</Typography>
        <Button variant="contained" onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>
      </Box>
      
      {reports.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No saved reports
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't saved any reports yet. Complete a job compatibility analysis to save a report.
          </Typography>
          <Button variant="contained" onClick={handleBackToDashboard}>
            Go to Dashboard
          </Button>
        </Paper>
      ) : (
        <Box sx={{ mb: 4 }}>
          {reports.map((report, index) => {
            // Extract job description safely
            const jobDesc = report.jobDescription || 'No job description';
            const jobDescShort = typeof jobDesc === 'string' ? 
              (jobDesc.length > 100 ? jobDesc.substring(0, 100) + '...' : jobDesc) : 
              'Invalid job description';
            
            // Format date safely
            const createdDate = report.createdAt ? 
              new Date(report.createdAt).toLocaleString() : 
              'Unknown date';
            
            return (
              <Card key={report._id || index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Job Analysis Report
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Created: {createdDate}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {jobDescShort}
                  </Typography>
                  {report.analysis?.skillsMatchPercentage && (
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Match: {report.analysis.skillsMatchPercentage}%
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleViewReport(report._id)}
                    disabled={!report._id}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteReport(report._id)}
                    disabled={!report._id}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
}

export default SavedReports;