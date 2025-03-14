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
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { saveReport } from '../../services/mongoDb';
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

function Results() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [skillsData, setSkillsData] = useState(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  // Extract data from location state
  const { resumeData, jobDescription, quizResults, analysis } = location.state || {};
  
  useEffect(() => {
    if (analysis) {
      // Extract skills data for visualization
      extractSkillsData();
      // Extract strengths and weaknesses
      extractStrengthsWeaknesses();
    }
  }, [analysis]);
  
  useEffect(() => {
    if (analysis && analysis.skillsAnalysis) {
      prepareSkillsChartData();
    }
  }, [analysis]);
  
  // Function to extract skills data from analysis text
  const extractSkillsData = () => {
    if (!analysis || !analysis.analysis) return;
    
    // Use AI-generated analysis to extract skills
    // This is a simplified version - in a real app, you might want to use NLP
    const analysisText = analysis.analysis;
    
    // Example skills extraction (in a real app, this would be more sophisticated)
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
                // In a real app, this would be based on actual analysis
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
  
  // Function to extract strengths and weaknesses
  const extractStrengthsWeaknesses = () => {
    if (!analysis) return;
    
    // Use the strengths and areasForGrowth directly from the API response if available
    if (analysis.strengths && analysis.areasForGrowth) {
      setStrengthsWeaknesses({
        strengths: analysis.strengths,
        weaknesses: analysis.areasForGrowth // Note the field name change
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
  
  // Function to strip HTML tags from text
  const stripHtml = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      const reportData = {
        resumeData: {
          text: resumeData?.text || '',
          fileName: resumeData?.fileName || 'resume.pdf'
        },
        jobDescription: jobDescription || '',
        quizResults: {
          score: quizResults?.score || 0,
          totalQuestions: quizResults?.totalQuestions || 0,
          answers: quizResults?.answers || {},
          feedback: quizResults?.feedback || [],
          questions: quizResults?.questions || [] // Store the full questions
        },
        analysis: {
          summary: stripHtml(analysis?.summary || ''),
          analysis: stripHtml(analysis?.analysis || ''),
          recommendations: stripHtml(analysis?.recommendations || ''),
          // Don't strip HTML from learning resources to preserve links
          learningResources: analysis?.learningResources || '',
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
  
  const prepareSkillsChartData = () => {
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
  
  // Prepare data for the compatibility score gauge
  const compatibilityData = {
    labels: ['Compatible', 'Gap'],
    datasets: [
      {
        data: [analysis.score, 100 - analysis.score],
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
          quizResults?.score || 0, 
          (quizResults?.totalQuestions || 0) - (quizResults?.score || 0)
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
      
      {/* Score Overview */}
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
                    {quizResults?.score || 0}/{quizResults?.totalQuestions || 0}
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
                      value={analysis.skillsMatchPercentage || 0} 
                      sx={{ 
                        height: 20, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(211, 211, 211, 0.5)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'rgba(54, 162, 235, 0.8)',
                          borderRadius: 5
                        }
                      }}
                    />
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography variant="body2" fontWeight="bold" color="white">
                        {analysis.skillsMatchPercentage || 0}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Low Match</Typography>
                    <Typography variant="body2" color="text.secondary">High Match</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>Overall Compatibility</Typography>
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
                    {analysis.score || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    out of 100
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 'bold',
              fontSize: '0.9rem',
              textTransform: 'none'
            }
          }}
        >
          <Tab label="Summary" icon={<StarIcon />} iconPosition="start" />
          <Tab label="Skills Analysis" icon={<CodeIcon />} iconPosition="start" />
          <Tab label="Quiz Results" icon={<SchoolIcon />} iconPosition="start" />
          <Tab label="Learning Path" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Executive Summary</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <div dangerouslySetInnerHTML={{ __html: analysis.summary }} />
          
          {strengthsWeaknesses && (
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: 'success.50', borderLeft: '4px solid', borderColor: 'success.main' }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    Key Strengths
                  </Typography>
                  <List dense>
                    {strengthsWeaknesses.strengths.slice(0, 3).map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <CheckCircleIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: 'error.50', borderLeft: '4px solid', borderColor: 'error.main' }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingDownIcon sx={{ mr: 1, color: 'error.main' }} />
                    Areas for Growth
                  </Typography>
                  <List dense>
                    {strengthsWeaknesses.weaknesses.slice(0, 3).map((weakness, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <TrendingUpIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText primary={weakness} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Skills Analysis</Typography>
          <Divider sx={{ mb: 3 }} />
          
          {skillsData && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Skills Relevance vs. Match</Typography>
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
              
              {/* Add a skills gap analysis table */}
              <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>Skills Gap Analysis</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Skill</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Job Relevance</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Candidate Match</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Gap</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.skillsAnalysis.map((skill, index) => (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{skill.skill}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={skill.relevance} 
                                sx={{ 
                                  height: 10, 
                                  borderRadius: 5,
                                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'rgba(54, 162, 235, 0.8)'
                                  }
                                }} 
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">{`${Math.round(skill.relevance)}%`}</Typography>
                            </Box>
                          </Box>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={skill.match} 
                                sx={{ 
                                  height: 10, 
                                  borderRadius: 5,
                                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'rgba(75, 192, 192, 0.8)'
                                  }
                                }} 
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">{`${Math.round(skill.match)}%`}</Typography>
                            </Box>
                          </Box>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          <Chip 
                            label={`${Math.round(skill.gap)}%`} 
                            color={skill.gap > 50 ? "error" : skill.gap > 25 ? "warning" : "success"} 
                            size="small" 
                            variant="outlined"
                          />
                        </td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                          {skill.gap > 50 && skill.relevance > 70 ? 
                            <Chip label="High" color="error" size="small" /> : 
                            skill.gap > 30 && skill.relevance > 50 ? 
                            <Chip label="Medium" color="warning" size="small" /> : 
                            <Chip label="Low" color="success" size="small" />
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}
          
          <div dangerouslySetInnerHTML={{ __html: analysis.analysis }} />
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Quiz Results</Typography>
          <Divider sx={{ mb: 3 }} />
          
          {quizResults?.questions?.map((question, index) => {
            const feedback = quizResults.feedback[index];
            const selectedAnswer = feedback.selectedAnswer;
            const correctAnswer = feedback.correctAnswer;
            
            return (
              <Box key={index} sx={{ mb: 4, pb: 3, borderBottom: index < quizResults.questions.length - 1 ? '1px solid #eee' : 'none' }}>
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
            <div dangerouslySetInnerHTML={{ __html: analysis.recommendations }} />
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Learning Resources</Typography>
            <div dangerouslySetInnerHTML={{ __html: analysis.learningResources }} />
          </Box>
          
          {analysis.learningRoadmap && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Learning Roadmap</Typography>
              <div dangerouslySetInnerHTML={{ __html: analysis.learningRoadmap }} />
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
}

export default Results;