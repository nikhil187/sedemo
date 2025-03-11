import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/UI/Navbar';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Quiz from './components/Dashboard/Quiz';
import Results from './components/Dashboard/Results';
import ReportsList from './components/Reports/ReportsList';
import ReportView from './components/Reports/ReportView';
import SavedReports from './components/Dashboard/SavedReports';
import PrivateRoute from './components/Auth/PrivateRoute';
import NotificationSnackbar from './components/UI/NotificationSnackbar';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quiz" 
            element={
              <PrivateRoute>
                <Quiz />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/results" 
            element={
              <PrivateRoute>
                <Results />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <PrivateRoute>
                <SavedReports />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/reports/:reportId" 
            element={
              <PrivateRoute>
                <ReportView />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/saved-reports" 
            element={
              <PrivateRoute>
                <SavedReports />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Box>
      <NotificationSnackbar />
    </Box>
  );
}

export default App;