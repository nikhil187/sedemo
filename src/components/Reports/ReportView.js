import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  LinearProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getReport, deleteReport } from '../../services/mongoDb';
import { Radar, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
} from 'chart.js';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
);

function ReportView() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [skillsData, setSkillsData] = useState(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUser || !currentUser.uid) {
          throw new Error('You must be logged in to view reports');
        }
        
        const reportData = await getReport(currentUser.uid, reportId);
        setReport(reportData);
        
        // Extract skills data and strengths/weaknesses
        if (reportData.analysis) {
          extractSkillsData(reportData.analysis);
          extractStrengthsWeaknesses(reportData.analysis);
          
          // If skillsAnalysis is available, prepare chart data
          if (reportData.analysis.skillsAnalysis) {
            prepareSkillsChartData(reportData.analysis);
          }
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        setError(error.message || 'Failed to load report');
        showNotification('Failed to load report: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [reportId, currentUser, showNotification]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleBackToReports = () => {
    navigate('/reports');
  };
  
  const handleDeleteReport = async () => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        setDeleting(true);
        await deleteReport(currentUser.uid, reportId);
        showNotification('Report deleted successfully', 'success');
        navigate('/reports');
      } catch (error) {
        console.error('Error deleting report:', error);
        showNotification('Failed to delete report: ' + error.message, 'error');
        setDeleting(false);
      }
    }
  };
  
  // Function to extract skills data from analysis text
  const extractSkillsData = (analysis) => {
    if (!analysis || !analysis.analysis) return;
    
    // Use AI-generated analysis to extract skills
    const analysisText = analysis.analysis;
    
    // Example skills extraction
    const skillsRegex = /skills?|technologies?|languages?|frameworks?|tools?/gi;
    const paragraphs = analysisText.split('</p>');
    
    let skillsList = [];
    let skillScores = [];
    
    paragraphs.forEach(para => {
      if (para.match(skillsRegex)) {
        // Extract skills mentioned in this paragraph
        const skills = para.match(/\b([A-Za-z]+(?:\.[A-Za-z]+)*)\b/g);
        if (skills) {
          skills.forEach(skill => {
            // Filter out common words and HTML tags
            if (skill.length > 2 && 
                !['the', 'and', 'for', 'with', 'has', 'div', 'span', 'class'].includes(skill.toLowerCase())) {
              if (!skillsList.includes(skill)) {
                skillsList.push(skill);
                // Generate a score between 60-100 for demonstration
                skillScores.push(Math.floor(Math.random() * 40) + 60);
              }
            }
          });
        }
      }
    });
    
    // Limit to top 8 skills for better visualization
    if (skillsList.length > 8) {
      skillsList = skillsList.slice(0, 8);
      skillScores = skillScores.slice(0, 8);
    }
    
    setSkillsData({
      labels: skillsList,
      datasets: [
        {
          label: 'Skill Proficiency',
          data: skillScores,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });
  };
  
  // Function to prepare skills chart data from skillsAnalysis
  const prepareSkillsChartData = (analysis) => {
    if (!analysis.skillsAnalysis) return;
    
    // Prepare data for radar chart
    setSkillsData({
      labels: analysis.skillsAnalysis.map(item => item.skill),
      datasets: [
        {
          label: 'Job Relevance',
          data: analysis.skillsAnalysis.map(item => item.relevance),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Candidate Match',
          data: analysis.skillsAnalysis.map(item => item.match),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }
      ],
    });
  };
  
  // Function to extract strengths and weaknesses
  const extractStrengthsWeaknesses = (analysis) => {
    if (!analysis) return;
    
    // Use the strengths and areasForGrowth directly from the API response if available
    if (analysis.strengths && analysis.areasForGrowth) {
      setStrengthsWeaknesses({
        strengths: analysis.strengths,
        weaknesses: analysis.areasForGrowth
      });
      return;
    }
    
    // Fallback to text extraction if the direct fields aren't available
    const analysisText = analysis.analysis || '';
    
    // Extract strengths
    const strengthsRegex = /<strong>Strengths:<\/strong>|<h4>Strengths:<\/h4>|<h3>Strengths:<\/h3>/i;
    const strengthsMatch = analysisText.split(strengthsRegex);
    
    let strengths = [];
    if (strengthsMatch && strengthsMatch.length > 1) {
      const strengthsSection = strengthsMatch[1].split(/<\/ul>|<\/ol>|<h3>|<h4>/)[0];
      const strengthItems = strengthsSection.match(/<li>(.*?)<\/li>/g);
      if (strengthItems) {
        strengths = strengthItems.map(item => 
          item.replace(/<li>/, '').replace(/<\/li>/, '').trim()
        );
      }
    }
    
    // Extract weaknesses/areas for growth
    const weaknessesRegex = /<strong>Areas for Growth:<\/strong>|<strong>Weaknesses:<\/strong>|<h4>Areas for Growth:<\/h4>|<h4>Weaknesses:<\/h4>|<h3>Areas for Growth:<\/h3>|<h3>Weaknesses:<\/h3>/i;
    const weaknessesMatch = analysisText.split(weaknessesRegex);
    
    let weaknesses = [];
    if (weaknessesMatch && weaknessesMatch.length > 1) {
      const weaknessesSection = weaknessesMatch[1].split(/<\/ul>|<\/ol>|<h3>|<h4>/)[0];
      const weaknessItems = weaknessesSection.match(/<li>(.*?)<\/li>/g);
      if (weaknessItems) {
        weaknesses = weaknessItems.map(item => 
          item.replace(/<li>/, '').replace(/<\/li>/, '').trim()
        );
      }
    }
    
    setStrengthsWeaknesses({ strengths, weaknesses });
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
        <Button variant="contained" onClick={handleBackToReports}>
          Back to Reports
        </Button>
      </Container>
    );
  }
  
  if (!report) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Report not found
        </Alert>
        <Button variant="contained" onClick={handleBackToReports}>
          Back to Reports
        </Button>
      </Container>
    );
  }
  
  // Prepare data for the compatibility score gauge
  const compatibilityData = {
    labels: ['Compatible', 'Gap'],
    datasets: [
      {
        data: [report.analysis?.score || 0, 100 - (report.analysis?.score || 0)],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(211, 211, 211, 0.5)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(211, 211, 211, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for quiz results chart
  const quizData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [
          report.quizResults?.score || 0, 
          (report.quizResults?.totalQuestions || 0) - (report.quizResults?.score || 0)
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Options for doughnut charts
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Report Details</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToReports} 
            sx={{ mr: 2 }}
          >
            Back to Reports
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteReport}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Report'}
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>Quiz Performance</Typography>
              <Box sx={{ height: 150, width: 150, position: 'relative' }}>
                <Doughnut data={quizData} options={doughnutOptions} />
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" color="primary">
                    {report.quizResults?.score || 0}/{report.quizResults?.totalQuestions || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>Compatibility Score</Typography>
              <Box sx={{ height: 150, width: 150, position: 'relative' }}>
                <Doughnut data={compatibilityData} options={doughnutOptions} />
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" color="primary">
                    {report.analysis?.score || 0}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>Skills Match</Typography>
              <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={report.analysis?.skillsMatchPercentage || 0} 
                      sx={{ height: 20, borderRadius: 5 }} 
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {report.analysis?.skillsMatchPercentage || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab icon={<StarIcon />} label="Summary" />
          <Tab icon={<CodeIcon />} label="Skills Analysis" />
          <Tab icon={<SchoolIcon />} label="Quiz Results" />
          <Tab icon={<TrendingUpIcon />} label="Learning Resources" />
        </Tabs>
      </Box>
      
      {activeTab === 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Executive Summary</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <div dangerouslySetInnerHTML={{ __html: report.analysis?.summary }} />
          
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {strengthsWeaknesses && (
              <>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1 }} /> Strengths
                    </Typography>
                    <List dense>
                      {strengthsWeaknesses.strengths.map((strength, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <TrendingDownIcon sx={{ mr: 1 }} /> Areas for Growth
                    </Typography>
                    <List dense>
                      {strengthsWeaknesses.weaknesses.map((weakness, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CancelIcon color="error" />
                          </ListItemIcon>
                          <ListItemText primary={weakness} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Skills Analysis</Typography>
          <Divider sx={{ mb: 3 }} />
          
          {skillsData && (
            <Box sx={{ height: 300, mb: 4 }}>
              <Radar 
                data={skillsData} 
                options={{
                  scales: {
                    r: {
                      min: 0,
                      max: 100,
                      ticks: {
                        stepSize: 20
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            </Box>
          )}
          
          <div dangerouslySetInnerHTML={{ __html: report.analysis?.analysis }} />
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Quiz Results</Typography>
          <Divider sx={{ mb: 3 }} />
          
          {report.quizResults?.questions?.map((question, index) => {
            const feedback = report.quizResults.feedback[index];
            const selectedAnswer = feedback.selectedAnswer;
            const correctAnswer = feedback.correctAnswer;
            
            return (
              <Box key={index} sx={{ mb: 4, pb: 3, borderBottom: index < report.quizResults.questions.length - 1 ? '1px solid #eee' : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%', 
                    bgcolor: feedback.isCorrect ? 'success.main' : 'error.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    {index + 1}
                  </Box>
                  <Typography variant="h6">
                    {question.question}
                  </Typography>
                </Box>
                
                {question.options.map((option, optIndex) => (
                  <Box 
                    key={optIndex} 
                    sx={{ 
                      p: 1.5, 
                      mb: 1, 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 
                        optIndex === correctAnswer ? 'success.light' : 
                        (optIndex === selectedAnswer && selectedAnswer !== correctAnswer) ? 'error.light' : 
                        'grey.100'
                    }}
                  >
                    {optIndex === selectedAnswer && (
                      <Box sx={{ mr: 1 }}>
                        {feedback.isCorrect ? 
                          <CheckCircleIcon color="success" /> : 
                          <CancelIcon color="error" />
                        }
                      </Box>
                    )}
                    <Typography variant="body1">
                      {option}
                    </Typography>
                  </Box>
                ))}
                
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: feedback.isCorrect ? 'success.50' : 'error.50', 
                  borderRadius: 1,
                  borderLeft: '4px solid',
                  borderColor: feedback.isCorrect ? 'success.main' : 'error.main'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                  </Typography>
                  <Typography variant="body2">
                    {feedback.explanation}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Paper>
      )}
      
      {activeTab === 3 && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Learning Resources & Roadmap</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recommendations</Typography>
            <div dangerouslySetInnerHTML={{ __html: report.analysis?.recommendations }} />
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Learning Resources</Typography>
            <div dangerouslySetInnerHTML={{ __html: report.analysis?.learningResources }} />
          </Box>
          
          {report.analysis?.learningRoadmap && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Learning Roadmap</Typography>
              <div dangerouslySetInnerHTML={{ __html: report.analysis?.learningRoadmap }} />
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
}

export default ReportView;