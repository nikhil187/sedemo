import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { saveReport } from '../../services/mongoDb';

function Results() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  // Extract data from location state
  const { resumeData, jobDescription, quizResults, analysis } = location.state || {};
  
  useEffect(() => {
    // If no analysis data, redirect to dashboard
    if (!analysis) {
      showNotification('No analysis data available', 'error');
      navigate('/dashboard');
    }
  }, [analysis, navigate, showNotification]);
  
  // Function to strip HTML tags from text
  const stripHtml = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };
  
  const handleSaveReport = async () => {
    if (!currentUser || !currentUser.uid) {
      showNotification('You must be logged in to save reports', 'error');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Make sure analysis is not null
      if (!analysis) {
        throw new Error('No analysis data available to save');
      }
      
      console.log("Saving report with analysis:", analysis);
      
      // Prepare the report data with proper structure matching the schema
      // Strip HTML tags from text fields
      const reportData = {
        resumeData: {
          text: resumeData?.text || '',
          fileName: resumeData?.fileName || 'resume.pdf'
        },
        jobDescription: jobDescription || '',
        quizResults: {
          score: quizResults?.score || 0,
          totalQuestions: quizResults?.totalQuestions || 0,
          answers: quizResults?.answers || {}
        },
        analysis: {
          summary: stripHtml(analysis?.summary || ''),
          analysis: stripHtml(analysis?.analysis || ''),
          recommendations: stripHtml(analysis?.recommendations || ''),
          learningResources: stripHtml(analysis?.learningResources || ''),
          learningRoadmap: stripHtml(analysis?.learningRoadmap || ''),
          skillsMatchPercentage: analysis?.skillsMatchPercentage || 0,
          score: analysis?.score || 0
        }
      };
      
      console.log("Formatted report data:", reportData);
      
      // Save the report to MongoDB
      const reportId = await saveReport(currentUser.uid, reportData);
      
      console.log("Report saved with ID:", reportId);
      
      showNotification('Report saved successfully', 'success');
      
      // Navigate to saved reports page
      navigate('/reports');
      
    } catch (error) {
      console.error('Error saving report:', error);
      setError(error.message || "Failed to save report");
      showNotification('Failed to save report: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (!analysis) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading analysis...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Analysis Results</Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleBackToDashboard} 
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveReport}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Report'}
          </Button>
        </Box>
      </Box>
      
      {/* Quiz Results Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Quiz Results</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">
          Score: {quizResults?.score || 0} / {quizResults?.totalQuestions || 0}
        </Typography>
      </Paper>
      
      {/* Skills Match Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Skills Match</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1">
            <strong>Match Percentage:</strong> {analysis.skillsMatchPercentage || 0}%
          </Typography>
          <Typography variant="body1">
            <strong>Overall Score:</strong> {analysis.score || 0}/100
          </Typography>
        </Box>
      </Paper>
      
      {/* Summary Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Summary</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <div dangerouslySetInnerHTML={{ __html: analysis.summary }} />
      </Paper>
      
      {/* Detailed Analysis Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Detailed Analysis</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <div dangerouslySetInnerHTML={{ __html: analysis.analysis }} />
      </Paper>
      
      {/* Recommendations Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Recommendations</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <div dangerouslySetInnerHTML={{ __html: analysis.recommendations }} />
      </Paper>
      
      {/* Learning Resources Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Learning Resources</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <div dangerouslySetInnerHTML={{ __html: analysis.learningResources }} />
      </Paper>
      
      {/* Learning Roadmap Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>Learning Roadmap</Typography>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <div dangerouslySetInnerHTML={{ __html: analysis.learningRoadmap }} />
      </Paper>
    </Container>
  );
}

export default Results;