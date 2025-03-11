import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import ResumeForm from './ResumeForm';

function Dashboard() {
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const steps = ['Upload Resume', 'Enter Job Description', 'Analysis'];

  const handleResumeSubmit = (data) => {
    console.log("Resume data received:", data);
    setResumeData(data);
    setActiveStep(1);
  };

  const handleJobDescriptionSubmit = () => {
    if (!jobDescription.trim()) {
      showNotification('Please enter a job description', 'error');
      return;
    }
    
    console.log("Navigating to quiz with data:", { resumeData, jobDescription });
    
    // Make sure resumeData has a text property
    const formattedResumeData = resumeData && !resumeData.text 
      ? { ...resumeData, text: resumeData.fileName || 'Resume' }
      : resumeData;
    
    // Navigate to Quiz page with resume and job description data
    navigate('/quiz', { 
      state: { 
        resumeData: formattedResumeData, 
        jobDescription 
      } 
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Resume Job Matcher
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && (
          <ResumeForm onSubmit={handleResumeSubmit} />
        )}
        
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enter Job Description
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Paste the job description you want to match your resume against.
            </Typography>
            
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'inherit',
                fontSize: '16px',
                marginBottom: '16px'
              }}
              placeholder="Paste job description here..."
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setActiveStep(0)}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                onClick={handleJobDescriptionSubmit}
                disabled={!jobDescription.trim()}
              >
                Analyze
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard;