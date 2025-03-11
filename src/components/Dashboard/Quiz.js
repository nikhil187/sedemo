import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl,
  CircularProgress,
  Alert
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { generateQuiz, analyzeCompatibility } from '../../services/api';

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Extract data from location state
  const { resumeData, jobDescription } = location.state || {};
  
  useEffect(() => {
    // If no resume data or job description, redirect to dashboard
    if (!resumeData || !jobDescription) {
      showNotification('Missing resume or job description', 'error');
      navigate('/dashboard');
      return;
    }
    
    // Fetch quiz questions
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const quizQuestions = await generateQuiz(resumeData.text, jobDescription);
        
        if (!quizQuestions || quizQuestions.length === 0) {
          throw new Error('No questions generated');
        }
        
        setQuestions(quizQuestions);
        
        // Initialize answers object with empty values
        const initialAnswers = {};
        quizQuestions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
        
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message || 'Failed to generate quiz questions');
        showNotification('Failed to generate quiz questions', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [resumeData, jobDescription, navigate, showNotification]);
  
  const handleAnswerChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
  };
  
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = Object.values(answers).filter(answer => answer === null).length;
    
    if (unansweredQuestions > 0) {
      showNotification(`Please answer all questions (${unansweredQuestions} remaining)`, 'warning');
      return;
    }
    
    try {
      setAnalyzing(true);
      setError(null);
      
      // Calculate score
      let score = 0;
      Object.keys(answers).forEach(questionIndex => {
        const question = questions[questionIndex];
        if (answers[questionIndex] === question.correctAnswer) {
          score++;
        }
      });
      
      const quizResults = {
        score,
        totalQuestions: questions.length,
        answers
      };
      
      // Analyze compatibility
      const analysis = await analyzeCompatibility(
        resumeData.text, 
        jobDescription,
        score
      );
      
      if (!analysis) {
        throw new Error('Failed to generate analysis');
      }
      
      // Navigate to results page with all data
      navigate('/results', {
        state: {
          resumeData,
          jobDescription,
          quizResults,
          analysis
        }
      });
      
    } catch (error) {
      console.error('Error analyzing results:', error);
      setError(error.message || 'Failed to analyze results');
      showNotification('Failed to analyze results', 'error');
    } finally {
      setAnalyzing(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Generating quiz questions...
        </Typography>
      </Container>
    );
  }
  
  if (analyzing) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Analyzing your responses...
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
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }
  
  if (!questions || questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          No questions could be generated. Please try again with a different job description.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }
  
  const currentQuestionData = questions[currentQuestion];
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Technical Skills Assessment
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1">
          Answer these questions based on the job requirements to help us assess your technical fit.
        </Typography>
      </Box>
      
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Question {currentQuestion + 1} of {questions.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Object.values(answers).filter(a => a !== null).length} of {questions.length} answered
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          {currentQuestionData.question}
        </Typography>
        
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            value={answers[currentQuestion] !== null ? answers[currentQuestion] : ''}
            onChange={handleAnswerChange}
          >
            {currentQuestionData.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={option}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        {currentQuestion < questions.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={answers[currentQuestion] === null}
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={Object.values(answers).some(answer => answer === null)}
          >
            Submit
          </Button>
        )}
      </Box>
    </Container>
  );
}

export default Quiz;