// Batch fix script for remaining SQL template literals
const filesToFix = [
  'src/app/api/retake/route.ts',
  'src/app/api/reports/route.ts', 
  'src/app/api/exams/[id]/toggle/route.ts',
  'src/app/api/exams/[id]/submit/route.ts',
  'src/app/api/exams/route.ts'
];

console.log('Files that need SQL fixes:');
filesToFix.forEach(file => console.log(`- ${file}`));
