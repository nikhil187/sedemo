import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import pdfToText from 'react-pdftotext';
import PizZip from "pizzip";
import { DOMParser } from "@xmldom/xmldom";

function ResumeForm({ onSubmit }) {
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { showNotification } = useNotification();
  
  // Helper function to parse DOCX files
  function str2xml(str) {
    if (str.charCodeAt(0) === 65279) {
      // BOM sequence
      str = str.substr(1);
    }
    return new DOMParser().parseFromString(str, "text/xml");
  }

  // Get paragraphs from DOCX as javascript array
  function getParagraphsFromDocx(content) {
    try {
      const zip = new PizZip(content);
      const xml = str2xml(zip.files["word/document.xml"].asText());
      const paragraphsXml = xml.getElementsByTagName("w:p");
      const paragraphs = [];

      for (let i = 0, len = paragraphsXml.length; i < len; i++) {
        let fullText = "";
        const textsXml = paragraphsXml[i].getElementsByTagName("w:t");
        for (let j = 0, len2 = textsXml.length; j < len2; j++) {
          const textXml = textsXml[j];
          if (textXml.childNodes && textXml.childNodes[0]) {
            fullText += textXml.childNodes[0].nodeValue;
          }
        }
        if (fullText) {
          paragraphs.push(fullText);
        }
      }
      return paragraphs.join('\n');
    } catch (error) {
      console.error("Error parsing DOCX:", error);
      throw new Error("Failed to parse DOCX file");
    }
  }
  
  const extractTextFromDocx = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const text = getParagraphsFromDocx(content);
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };
  
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    // Get file extension for better type detection
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(selectedFile.type) && 
        !['pdf', 'docx', 'txt'].includes(fileExtension)) {
      showNotification('Please upload a PDF, DOCX, or TXT file', 'error');
      return;
    }
    
    setFile(selectedFile);
    setIsUploading(true);
    
    try {
      let extractedText = '';
      
      // Extract text based on file type
      if (selectedFile.type === 'application/pdf' || fileExtension === 'pdf') {
        extractedText = await pdfToText(selectedFile);
      } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                fileExtension === 'docx') {
        extractedText = await extractTextFromDocx(selectedFile);
      } else if (selectedFile.type === 'text/plain' || fileExtension === 'txt') {
        extractedText = await readFileAsText(selectedFile);
      } else {
        throw new Error('Unsupported file type');
      }
      
      setResumeText(extractedText);
      showNotification('Resume text extracted successfully', 'success');
    } catch (error) {
      console.error('Error extracting text:', error);
      showNotification('Error extracting text from file: ' + error.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };
  
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };
  
  const handleSubmit = () => {
    if (!resumeText.trim()) {
      showNotification('Please enter or upload your resume', 'error');
      return;
    }
    
    onSubmit({ text: resumeText, fileName: file ? file.name : 'Manual Entry' });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload or Enter Your Resume
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              border: '2px dashed #ccc', 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <input
              accept=".pdf,.docx,.txt"
              style={{ display: 'none' }}
              id="resume-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="resume-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
                disabled={isUploading}
              >
                {isUploading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                {isUploading ? 'Extracting Text...' : 'Upload Resume'}
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, DOCX, TXT
            </Typography>
            {file && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                File: {file.name}
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="body2" gutterBottom>
            Resume text will appear here:
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="Upload a resume or paste text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            variant="outlined"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!resumeText.trim() || isUploading}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}

export default ResumeForm;