const OPENAI_API_KEY = "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";
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
          content: `Act as an advanced AI-powered career advisor with expertise in technical recruiting. Conduct a comprehensive, data-driven analysis of the candidate's resume against the job description, incorporating their technical assessment quiz performance.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

QUIZ RESULTS:
The candidate scored ${quizScore}/5 on a technical assessment quiz specifically designed for this role.

ANALYSIS FRAMEWORK:

1. TECHNICAL SKILLS MATCH (40% of total score):
   - Extract ALL technical skills, frameworks, languages, and tools mentioned in the job description
   - For each skill, assign a weight (1-3) based on:
     * Frequency of mention in job description (more mentions = higher weight)
     * Position in job description (earlier mentions = higher weight)
     * Whether it's listed as "required" vs "preferred"
   - For each skill, evaluate the candidate's proficiency level (0-5) based on:
     * Years of experience with the skill
     * Recency of experience
     * Context in which skill was used (professional, academic, personal)
     * Complexity of projects involving the skill
   - Calculate a weighted technical skills match percentage

2. EXPERIENCE RELEVANCE (25% of total score):
   - Analyze the candidate's past roles and responsibilities
   - Evaluate industry relevance (same industry = higher score)
   - Assess role similarity (similar responsibilities = higher score)
   - Consider career progression and growth trajectory
   - Evaluate project scale and complexity relative to job requirements

3. EDUCATION & QUALIFICATIONS (15% of total score):
   - Compare educational requirements with candidate's credentials
   - Evaluate relevance of degree field to job requirements
   - Consider additional certifications and specialized training
   - Assess academic achievements and honors if relevant

4. QUIZ PERFORMANCE (20% of total score):
   - Convert quiz score to percentage
   - Weight questions based on relevance to core job requirements
   - Consider performance on questions related to critical skills

5. CALCULATE FINAL COMPATIBILITY SCORE:
   - Combine weighted scores from all categories
   - Normalize to a 0-100 scale
   - Apply any final adjustments based on exceptional strengths or critical weaknesses


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

ADDITIONAL DATA FOR VISUALIZATION:
Include a "skillsAnalysis" field in your response that contains an array of the top 8 skills from the job description with the following data for each:
1. "skill": The name of the skill
2. "relevance": How important this skill is for the job (0-100)
3. "match": How well the candidate's experience matches this skill requirement (0-100)
4. "gap": The gap between the job requirement and candidate's experience (0-100)

Return ONLY a JSON object in this exact format with no additional text:
{
    "summary": "HTML formatted summary of the match",
    "analysis": "HTML formatted detailed analysis with strengths and weaknesses",
    "recommendations": "HTML formatted specific recommendations for improvement",
    "learningResources": "HTML formatted section with specific courses, free resources, and interview questions for each skill",
    "learningRoadmap": "HTML formatted 3-6 month learning plan with weekly/monthly breakdown",
    "skillsMatchPercentage": 75,
    "score": 70,
    "skillsAnalysis": [
        {"skill": "JavaScript", "relevance": 90, "match": 85, "gap": 15},
        {"skill": "React", "relevance": 85, "match": 70, "gap": 30},
        {"skill": "Node.js", "relevance": 80, "match": 65, "gap": 35},
        {"skill": "SQL", "relevance": 75, "match": 80, "gap": 0},
        {"skill": "Git", "relevance": 70, "match": 90, "gap": 0},
        {"skill": "AWS", "relevance": 65, "match": 60, "gap": 40},
        {"skill": "Docker", "relevance": 60, "match": 50, "gap": 50},
        {"skill": "TypeScript", "relevance": 55, "match": 75, "gap": 25}
    ],
    "strengths": ["Strong JavaScript fundamentals", "Excellent problem-solving skills", "Good database knowledge"],
    "areasForGrowth": ["Limited cloud experience", "Needs more DevOps knowledge"]
}`
        }],
        temperature: 0.4,
        max_tokens: 3500
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
          content: `Create a challenging technical assessment quiz based on the job description below. The quiz should thoroughly evaluate a candidate's proficiency in the key technical skills required for this role.

Requirements:
1. Create exactly 5 questions that are highly specific to the technical stack and domain knowledge in the job description
2. Questions should be advanced level (senior/expert), not basic knowledge
3. Include a mix of:
   - Theoretical knowledge questions that test deep understanding
   - Scenario-based questions that assess problem-solving in realistic situations
   - Code or system design questions where appropriate
   - Edge cases and optimization questions

For each question:
- Provide 4 answer options that are technically detailed and plausible
- Only one option should be correct
- The wrong options should be realistic alternatives that someone might actually consider
- Include specific technical terminology, frameworks, or methodologies mentioned in the job description

For the correct answer:
- Provide a detailed technical explanation (3-5 sentences) of why it's correct
- Include specific technical concepts, principles, or best practices

For each wrong answer:
- Provide a brief explanation (1-2 sentences) of why it's incorrect
- Explain the technical flaw or misconception

Return ONLY a JSON array in this exact format with no additional text:
[
  {
    "question": "Detailed technical question text that includes specific technologies/frameworks from the job description",
    "options": [
      "Technically detailed option A with specific implementation details",
      "Technically detailed option B with specific implementation details",
      "Technically detailed option C with specific implementation details",
      "Technically detailed option D with specific implementation details"
    ],
    "correctAnswer": 0,
    "explanation": "Detailed technical explanation of why the correct answer is right, including specific concepts and principles",
    "wrongExplanations": [
      "Technical explanation of why option B is wrong",
      "Technical explanation of why option C is wrong",
      "Technical explanation of why option D is wrong"
    ]
  }
]

Job Description: ${jobDescription}`
        }],
        temperature: 0.7,
        max_tokens: 2500
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