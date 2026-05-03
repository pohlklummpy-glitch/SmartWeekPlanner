// Temporary script to replace all Alert.alert with Toast
const fs = require('fs');
const path = require('path');

const files = [
  'src/screens/AdminScreen.js',
  'src/screens/GoalsScreen.js',
  'src/screens/ForgotPasswordScreen.js',
  'src/screens/VerifyEmailScreen.js',
  'src/components/TaskCard.js',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove Alert from imports
  content = content.replace(/, Alert/g, '');
  content = content.replace(/Alert, /g, '');
  
  // Add useToast import if not present
  if (!content.includes('useToast')) {
    content = content.replace(
      /from '\.\.\/context\/ThemeContext';/,
      `from '../context/ThemeContext';\nimport { useToast } from '../components/Toast';`
    );
  }
  
  // Add useToast hook in components
  if (content.includes('export default function')) {
    const match = content.match(/export default function \w+\([^)]*\) \{[\s\n]*const \{[^}]+\} = useTheme\(\);/);
    if (match && !content.includes('const { showToast') && !content.includes('const { showConfirm')) {
      content = content.replace(
        /const \{([^}]+)\} = useTheme\(\);/,
        `const {$1} = useTheme();\n  const { showToast, showConfirm } = useToast();`
      );
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${file}`);
});

console.log('Done!');
