const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export async function analyzeCompatibility(resume, jobDescription, quizScore) {
  try {
    console.log("API analyzeCompatibility called with:", { resume, jobDescription, quizScore });
    
    // Check if resume or jobDescription is undefined or empty
    if (!resume || !jobDescription) {
      console.error("Missing resume or job description");
      throw new Error("Missing resume or job description");
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Act as a professional career advisor and provide a detailed compatibility analysis between the resume and job description. 
          
          First, identify the 3-5 most important skills from the job description that the candidate should focus on developing.
          
          For each of these skills, provide:
          1. 3 specific online courses with DIRECT LINKS (use actual URLs, not placeholders):
             - Example: <a href="https://www.coursera.org/learn/machine-learning">Machine Learning by Stanford</a>
             - Include a mix of Coursera, Udemy, edX, LinkedIn Learning, etc.
             - Each course should have a different focus within the skill area
          
          2. 2 free resources with DIRECT LINKS:
             - Example: <a href="https://javascript.info/">JavaScript.info</a>
             - Include specific YouTube channels with URLs, GitHub repositories, documentation sites
          
          3. 5 specific interview questions (not generic ones) that test deep knowledge of this skill
          
          Also include:
          1. A brief professional summary of the match (2-3 sentences)
          2. List 3-4 key strengths that align well with the role
          3. Identify 2-3 areas for potential growth
          4. Consider the candidate's quiz performance (${quizScore}/5) in your evaluation
          5. A specific learning roadmap with timeline (3-6 months) that includes:
             - Week-by-week breakdown for the first month
             - Month-by-month breakdown for the remaining time
             - Specific milestones and projects to complete
          
          IMPORTANT FORMATTING REQUIREMENTS:
          - Use proper HTML with headers, paragraphs, and lists
          - Include ACTUAL URLs in anchor tags, not placeholders
          - Make each resource unique and specific (no repetition)
          - For courses, include the platform, course name, instructor if known, and approximate duration
          - Organize content with clear headings and subheadings
          
          Return ONLY a JSON object in this exact format with no additional text:
          {
              "summary": "HTML formatted summary of the match",
              "analysis": "HTML formatted detailed analysis with strengths and weaknesses",
              "recommendations": "HTML formatted specific recommendations for improvement",
              "learningResources": "HTML formatted section with specific courses, free resources, and interview questions for each skill",
              "learningRoadmap": "HTML formatted 3-6 month learning plan with weekly/monthly breakdown",
              "skillsMatchPercentage": 75,
              "score": 70
          }
          
          Resume: ${resume}
          Job Description: ${jobDescription}`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);
    const content = data.choices[0].message.content;
    
    try {
      const parsedContent = JSON.parse(content);
      console.log("Parsed content:", parsedContent);
      return parsedContent;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse analysis data");
    }
  } catch (error) {
    console.error('Error analyzing compatibility:', error);
    throw error;
  }
}

export async function generateQuiz(resume, jobDescription) {
  try {
    console.log("API generateQuiz called with:", { resume, jobDescription });
    
    // Check if resume or jobDescription is undefined or empty
    if (!resume || !jobDescription) {
      console.error("Missing resume or job description");
      throw new Error("Missing resume or job description");
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Create 5 technical scenario-based questions based on the key technical skills in this job description. Each question should:
          
          Requirements for questions:
          1. Focus on practical, real-world scenarios and problem-solving
          2. Include code snippets or system design concepts where relevant
          3. Test both theoretical knowledge and practical application
          4. Target senior developer level difficulty
          5. Cover edge cases and best practices
          
          Make sure each question:
          - Is specific to the technical stack mentioned in the job description
          - Requires deep technical knowledge to answer correctly
          - Has 4 realistic options that a professional might consider
          - Includes detailed technical explanations in the options
          
          For each question, also provide:
          - A brief explanation of why the correct answer is right
          - A brief explanation of why each wrong answer is incorrect
          
          Return ONLY a JSON array in this exact format with no additional text:
          [
              {
                  "question": "detailed technical scenario or question text",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": 0,
                  "explanation": "Explanation of the correct answer",
                  "wrongExplanations": ["Why option B is wrong", "Why option C is wrong", "Why option D is wrong"]
              }
          ]
          
          Job Description: ${jobDescription}`
        }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    const content = data.choices[0].message.content;
    
    try {
      let parsedContent;
      
      try {
        // First, try to parse the content directly
        parsedContent = JSON.parse(content);
        console.log("Parsed content directly:", parsedContent);
      } catch (directParseError) {
        console.error("Error parsing content directly:", directParseError);
        
        // If direct parsing fails, try to extract JSON from the content
        const jsonRegex = /\[[\s\S]*\]/;
        const jsonMatch = content.match(jsonRegex);
        
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          parsedContent = JSON.parse(jsonString);
          console.log("Parsed content from extracted JSON:", parsedContent);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      }
      
      // Validate the parsed content
      if (!Array.isArray(parsedContent)) {
        throw new Error("Response is not an array");
      }
      
      // Validate each question object
      parsedContent.forEach((question, index) => {
        if (!question.question || !question.options || !Array.isArray(question.options) || question.correctAnswer === undefined) {
          console.error(`Invalid question object at index ${index}:`, question);
          throw new Error(`Invalid question object at index ${index}`);
        }
      });
      
      return parsedContent;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse quiz data");
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

export async function extractKeySkills(jobDescription) {
  try {
    console.log("API extractKeySkills called with:", { jobDescription });
    
    if (!jobDescription) {
      console.error("Missing job description");
      throw new Error("Missing job description");
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Extract the top 10 most important technical skills and technologies from this job description. 
          Return ONLY a JSON array of strings with no additional text or explanation.
          Format your response as a valid JSON array like this: ["Skill1", "Skill2", "Skill3"]
          
          Job Description: ${jobDescription}`
        }],
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    const content = data.choices[0].message.content;
    
    try {
      const parsedContent = JSON.parse(content);
      console.log("Parsed skills:", parsedContent);
      return parsedContent;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse skills data");
    }
  } catch (error) {
    console.error('Error extracting key skills:', error);
    throw error;
  }
}

export async function extractResumeSkills(resume, jobDescription) {
  try {
    console.log("API extractResumeSkills called with:", { resume, jobDescription });
    
    if (!resume || !jobDescription) {
      console.error("Missing resume or job description");
      throw new Error("Missing resume or job description");
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Analyze this resume against the job description:
          
          1. Extract all technical skills mentioned in the resume
          2. Compare these skills with the job description requirements
          3. For each skill in the resume, rate the match level (0-5) where:
             - 5: Expert level match, explicitly mentioned in both
             - 3-4: Good match, mentioned or implied in both
             - 1-2: Basic match, somewhat related but not directly mentioned
             - 0: Not relevant to the job description
          4. Identify important skills from the job description missing in the resume
          
          Return ONLY a JSON object in this exact format with no additional text:
          {
              "skills": ["skill1", "skill2", ...],
              "matchAnalysis": {
                  "skill1": {"level": 5, "relevance": "high"},
                  "skill2": {"level": 3, "relevance": "medium"},
                  ...
              },
              "missingSkills": ["missing1", "missing2", ...]
          }
          
          Resume: ${resume}
          Job Description: ${jobDescription}`
        }],
        temperature: 0.3,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    const content = data.choices[0].message.content;
    
    try {
      const parsedContent = JSON.parse(content);
      console.log("Parsed resume skills:", parsedContent);
      return parsedContent;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse resume skills data");
    }
  } catch (error) {
    console.error('Error extracting resume skills:', error);
    throw error;
  }
}