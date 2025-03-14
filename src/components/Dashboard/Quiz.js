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
  FormLabel,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { generateQuiz, analyzeCompatibility } from '../../services/api';

function Quiz() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  // Get resume and job description from location state
  const resumeData = location.state?.resumeData;
  const jobDescription = location.state?.jobDescription;
  
  useEffect(() => {
    if (!resumeData || !jobDescription) {
      showNotification('Missing resume or job description', 'error');
      navigate('/dashboard');
      return;
    }
    
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const quizQuestions = await generateQuiz(resumeData.text, jobDescription);
        setQuestions(quizQuestions);
        
        // Initialize answers object
        const initialAnswers = {};
        quizQuestions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading quiz:', error);
        setError(error.message || "Failed to load quiz");
        showNotification('Failed to load quiz: ' + error.message, 'error');
        setLoading(false);
      }
    };
    
    loadQuiz();
  }, [resumeData, jobDescription, navigate, showNotification]);
  
  const handleAnswerChange = (event) => {
    const selectedAnswer = parseInt(event.target.value);
    setAnswers({
      ...answers,
      [currentQuestion]: selectedAnswer
    });
  };
  
  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
  };
  
  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed, calculate results
      setAnalyzing(true);
      
      try {
        // Calculate score
        let score = 0;
        const quizFeedback = [];
        
        Object.keys(answers).forEach(questionIndex => {
          const q = parseInt(questionIndex);
          const selectedAnswer = answers[q];
          const correctAnswer = questions[q].correctAnswer;
          const isCorrect = selectedAnswer === correctAnswer;
          
          if (isCorrect) {
            score++;
          }
          
          // Store feedback for this question
          quizFeedback.push({
            questionIndex: q,
            selectedAnswer,
            correctAnswer,
            isCorrect,
            explanation: isCorrect 
              ? questions[q].explanation 
              : questions[q].wrongExplanations[selectedAnswer > correctAnswer ? selectedAnswer - 1 : selectedAnswer]
          });
        });
        
        // Format quiz results
        const quizResults = {
          score,
          totalQuestions: questions.length,
          answers,
          feedback: quizFeedback,
          questions // Store the full questions array
        };
        
        // Call API to analyze compatibility
        const analysis = await analyzeCompatibility(
          resumeData.text,
          jobDescription,
          quizResults
        );
        
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
        setError(error.message || "Failed to analyze results");
        showNotification('Failed to analyze results: ' + error.message, 'error');
        setAnalyzing(false);
      }
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
          Analyzing your results...
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          This may take a minute or two
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
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Technical Assessment</Typography>
      
      <Stepper activeStep={currentQuestion} sx={{ mb: 4 }}>
        {questions.map((_, index) => (
          <Step key={index}>
            <StepLabel>{`Q${index + 1}`}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {questions.length > 0 && (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
            </FormLabel>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              {questions[currentQuestion].question}
            </Typography>
            
            <RadioGroup
              value={answers[currentQuestion] !== null ? answers[currentQuestion].toString() : ''}
              onChange={handleAnswerChange}
            >
              {questions[currentQuestion].options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={answers[currentQuestion] === null}
          >
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Quiz;