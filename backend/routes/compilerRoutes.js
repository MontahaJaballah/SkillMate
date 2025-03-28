const express = require('express');
const router = express.Router();
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
require("dotenv").config();

const languages = {
  javascript: { language: "nodejs", version: "4" },
  python: { language: "python3", version: "4" },
  java: { language: "java", version: "4" },
  cpp: { language: "cpp", version: "5" },
  c: { language: "c", version: "5" },
  php: { language: "php", version: "4" }
};

// Simple JavaScript code quality checker
function simpleJavaScriptLinter(code) {
  const issues = [];
  const lines = code.split('\n');
  
  // Check for var usage (prefer let/const)
  lines.forEach((line, index) => {
    if (line.includes('var ')) {
      issues.push({
        message: 'Use let or const instead of var for better scoping',
        severity: 1, // warning
        line: index + 1,
        column: line.indexOf('var ') + 1
      });
    }
  });
  
  // Check for missing semicolons
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine && 
        !trimmedLine.startsWith('//') && 
        !trimmedLine.startsWith('/*') && 
        !trimmedLine.endsWith('{') && 
        !trimmedLine.endsWith('}') && 
        !trimmedLine.endsWith(';') && 
        !trimmedLine.endsWith(',') &&
        !trimmedLine.endsWith('*/') &&
        !trimmedLine.startsWith('*') &&
        !trimmedLine.startsWith('import') &&
        !trimmedLine.startsWith('export')) {
      issues.push({
        message: 'Missing semicolon',
        severity: 1, // warning
        line: index + 1,
        column: trimmedLine.length
      });
    }
  });
  
  // Check for inconsistent indentation
  let previousIndent = -1;
  let currentBlockIndent = -1;
  
  lines.forEach((line, index) => {
    if (line.trim() === '') return;
    
    const indentSize = line.search(/\S/);
    if (indentSize === -1) return;
    
    if (previousIndent !== -1) {
      if (line.trim().startsWith('}')) {
        // Closing brace should match the indentation of the opening line
        if (currentBlockIndent !== -1 && indentSize !== currentBlockIndent) {
          issues.push({
            message: 'Inconsistent indentation for closing brace',
            severity: 1, // warning
            line: index + 1,
            column: 1
          });
        }
      } else if (Math.abs(indentSize - previousIndent) > 2 && Math.abs(indentSize - previousIndent) !== 4) {
        // Indentation changed by something other than 0, 2 or 4 spaces
        issues.push({
          message: 'Inconsistent indentation',
          severity: 1, // warning
          line: index + 1,
          column: 1
        });
      }
    }
    
    if (line.trim().endsWith('{')) {
      currentBlockIndent = indentSize;
    }
    
    previousIndent = indentSize;
  });
  
  // Check for unused variables (very basic implementation)
  const variableDeclarations = [];
  const variableUsages = new Set();
  
  // Find variable declarations
  lines.forEach((line, index) => {
    const varMatches = line.match(/\b(var|let|const)\s+(\w+)/g);
    if (varMatches) {
      varMatches.forEach(match => {
        const varName = match.split(/\s+/)[1];
        variableDeclarations.push({
          name: varName,
          line: index + 1
        });
      });
    }
  });
  
  // Find variable usages
  const codeWithoutStrings = code.replace(/".*?"/g, '').replace(/'.*?'/g, '');
  variableDeclarations.forEach(variable => {
    const regex = new RegExp(`\\b${variable.name}\\b`, 'g');
    const matches = codeWithoutStrings.match(regex) || [];
    
    // If variable is used more than once (declaration + usage)
    if (matches.length > 1) {
      variableUsages.add(variable.name);
    }
  });
  
  // Report unused variables
  variableDeclarations.forEach(variable => {
    if (!variableUsages.has(variable.name)) {
      issues.push({
        message: `Unused variable: ${variable.name}`,
        severity: 1, // warning
        line: variable.line,
        column: 1
      });
    }
  });
  
  // Check for missing Math.floor in array index calculations
  lines.forEach((line, index) => {
    if (line.includes('=') && line.includes('/') && line.includes('[') && !line.includes('Math.floor')) {
      issues.push({
        message: 'Array indices should use Math.floor for division to ensure integer values',
        severity: 2, // error
        line: index + 1,
        column: 1
      });
    }
  });
  
  return issues;
}

async function analyzePythonCode(code, tempFile) {
  try {
    await fs.writeFile(tempFile, code);
    return new Promise((resolve) => {
      exec(`pylint "${tempFile}" --output-format=json`, (err, stdout) => {
        if (err) resolve([]);
        try {
          resolve(JSON.parse(stdout || '[]'));
        } catch {
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error('Python analysis error:', error);
    return [];
  }
}

function calculateScore(isCorrect, linterReport) {
  // Start with 60 points for correct output, 0 for incorrect
  let score = isCorrect ? 60 : 0; 

  // Calculate deductions based on linter issues
  let deductions = 0;
  
  if (linterReport && linterReport.length > 0) {
    // Count errors and warnings
    const errors = linterReport.filter(issue => issue.severity === 2).length;
    const warnings = linterReport.filter(issue => issue.severity === 1).length;
    
    // Deduct 5 points per error, max 30 points
    deductions += Math.min(errors * 5, 30);
    
    // Deduct 2 points per warning, max 10 points
    deductions += Math.min(warnings * 2, 10);
  }

  // Optimization score (max 40 points, reduce by linter issues)
  const optimizationScore = Math.max(40 - deductions, 0);
  
  return score + optimizationScore;
}

router.post('/run', async (req, res) => {
  try {
    const { code, language, expectedOutput } = req.body;
    
    // Create temp directory for analysis if needed
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-review-'));
    const tempFile = path.join(tempDir, `code.${language === 'python' ? 'py' : 'js'}`);

    // Execute code with JDoodle
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: code,
      language: languages[language].language,
      versionIndex: languages[language].version,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Get actual output
    const actualOutput = response.data.output.trim();
    const isCorrect = expectedOutput ? actualOutput === expectedOutput.trim() : true;

    // Analyze code quality
    let linterReport = [];
    if (language === 'javascript') {
      linterReport = simpleJavaScriptLinter(code);
      console.log('Linter report:', JSON.stringify(linterReport));
    } else if (language === 'python') {
      linterReport = await analyzePythonCode(code, tempFile);
    }

    // Calculate score
    const score = calculateScore(isCorrect, linterReport);

    // Clean up temp files
    await fs.rm(tempDir, { recursive: true, force: true }).catch(err => console.error('Error cleaning up temp files:', err));

    // Send response
    res.json({
      success: true,
      output: actualOutput,
      score,
      isCorrect,
      feedback: linterReport.map(issue => ({
        message: issue.message,
        severity: issue.severity,
        line: issue.line,
        column: issue.column
      }))
    });

  } catch (error) {
    console.error('Compiler error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error || 'Error executing code'
    });
  }
});

module.exports = router;
