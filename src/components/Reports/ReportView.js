import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getReport } from '../../services/mongoDb';

function ReportView() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      showNotification('You must be logged in to view reports', 'error');
      navigate('/login');
      return;
    }
    
    if (!reportId) {
      showNotification('No report ID specified', 'error');
      navigate('/reports');
      return;
    }
    
    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const reportData = await getReport(currentUser.uid, reportId);
        setReport(reportData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading report:', error);
        setError(error.message || "Failed to load report");
        showNotification('Failed to load report: ' + error.message, 'error');
        setLoading(false);
      }
    };
    
    loadReport();
  }, [reportId, currentUser, navigate, showNotification]);
  
  const handleBackToReports = () => {
    navigate('/reports');
  };
  
  // Format text to display properly
  const formatText = (text) => {
    if (!text) return '';
    
    // Remove section titles that might be prepended
    const possibleTitles = [
      'Professional Summary',
      'Detailed Analysis',
      'Recommendations for Improvement',
      'Learning Resources'
    ];
    
    let cleanedText = text;
    possibleTitles.forEach(title => {
      if (cleanedText.startsWith(title)) {
        cleanedText = cleanedText.substring(title.length).trim();
      }
    });
    
    return cleanedText;
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading report...
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
            Failed to load report
          </Typography>
          <Typography variant="body1" paragraph>
            We encountered an error while loading your report. Please try again later.
          </Typography>
          <Button variant="contained" onClick={handleBackToReports}>
            Back to Reports
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (!report) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Report not found
        </Alert>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Report not found
          </Typography>
          <Typography variant="body1" paragraph>
            The requested report could not be found. It may have been deleted or you may not have permission to view it.
          </Typography>
          <Button variant="contained" onClick={handleBackToReports}>
            Back to Reports
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Analysis Results</Typography>
        <Button 
          variant="contained" 
          onClick={handleBackToReports}
        >
          Back to Reports
        </Button>
      </Box>
      
      {/* Summary Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Summary</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1">
          {formatText(report.analysis?.summary)}
        </Typography>
      </Paper>
      
      {/* Detailed Analysis Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Detailed Analysis</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1">
          {formatText(report.analysis?.analysis)}
        </Typography>
      </Paper>
      
      {/* Recommendations Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Recommendations</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1">
          {formatText(report.analysis?.recommendations)}
        </Typography>
      </Paper>
      
      {/* Learning Resources Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Learning Resources</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1">
          {formatText(report.analysis?.learningResources)}
        </Typography>
      </Paper>
      
      {/* Skills Match Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Skills Match</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1">
            <strong>Match Percentage:</strong> {report.analysis?.skillsMatchPercentage || 0}%
          </Typography>
          <Typography variant="body1">
            <strong>Score:</strong> {report.analysis?.score || 0}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default ReportView;