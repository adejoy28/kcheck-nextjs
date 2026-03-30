import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export interface ReportData {
  id: string
  user_name: string
  team_name?: string
  exam_title?: string
  batch_name?: string
  score?: string
  percentage?: string
  time_taken?: string
  passing_score?: string
  total_questions?: string
  passed: boolean
  completed_at: string
  total_attempts?: number
  total_passed?: number
  pass_rate?: string
  avg_percentage?: string
}

export function exportToPDF(data: ReportData[], viewType: 'staff' | 'exam') {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(16)
  doc.text('Knowledge Check System - Reports', 14, 15)
  
  // Add timestamp
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25)
  
  // Add results
  doc.setFontSize(12)
  let yPosition = 40
  
  if (viewType === 'staff') {
    // Staff view headers
    const headers = ['Staff', 'Team', 'Exam', 'Batch', 'Score', '%', 'Duration', 'Pass Mark', 'Result', 'Date']
    const columnWidths = [30, 25, 40, 25, 20, 15, 20, 20, 20, 30]
    
    // Draw headers
    headers.forEach((header, index) => {
      const xPos = 14 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0)
      doc.text(header, xPos, yPosition)
    })
    
    yPosition += 10
    
    // Draw data rows
    data.forEach((row) => {
      const rowData = [
        row.user_name,
        row.team_name || '—',
        row.exam_title || '—',
        row.batch_name || '—',
        `${row.score} / ${row.total_questions || '—'}`,
        `${row.percentage}%`,
        row.time_taken || '—',
        `${row.passing_score}%`,
        row.passed ? 'Passed' : 'Failed',
        new Date(row.completed_at).toLocaleDateString()
      ]
      
      rowData.forEach((cell) => {
        const xPos = 14 + columnWidths.slice(0, rowData.indexOf(cell)).reduce((a, b) => a + b, 0)
        doc.text(String(cell), xPos, yPosition)
      })
      
      yPosition += 8
    })
  } else {
    // Exam view headers
    const headers = ['Exam', 'Pass Mark', 'Total Attempts', 'Passed', 'Pass Rate', 'Avg Score']
    const columnWidths = [50, 25, 25, 20, 20, 25]
    
    // Draw headers
    headers.forEach((header, index) => {
      const xPos = 14 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0)
      doc.text(header, xPos, yPosition)
    })
    
    yPosition += 10
    
    // Draw data rows
    data.forEach((row) => {
      const rowData = [
        row.exam_title,
        `${row.passing_score}%`,
        `${row.total_attempts}`,
        `${row.total_passed}`,
        `${row.pass_rate}%`,
        `${row.avg_percentage}%`
      ]
      
      rowData.forEach((cell) => {
        const xPos = 14 + columnWidths.slice(0, rowData.indexOf(cell)).reduce((a, b) => a + b, 0)
        doc.text(String(cell), xPos, yPosition)
      })
      
      yPosition += 8
    })
  }
  
  // Save the PDF
  doc.save(`kcheck-reports-${viewType}-${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportToExcel(data: ReportData[], viewType: 'staff' | 'exam') {
  let worksheetData: any[] = []
  
  if (viewType === 'staff') {
    // Staff view data
    worksheetData = [
      ['Staff', 'Team', 'Exam', 'Batch', 'Score', 'Percentage', 'Duration', 'Pass Mark', 'Result', 'Date'],
      ...data.map(row => [
        row.user_name,
        row.team_name || '—',
        row.exam_title || '—',
        row.batch_name || '—',
        `${row.score} / ${row.total_questions || '—'}`,
        `${row.percentage}%`,
        row.time_taken || '—',
        `${row.passing_score}%`,
        row.passed ? 'Passed' : 'Failed',
        new Date(row.completed_at).toLocaleDateString()
      ])
    ]
  } else {
    // Exam view data
    worksheetData = [
      ['Exam', 'Pass Mark', 'Total Attempts', 'Passed', 'Pass Rate', 'Average Score'],
      ...data.map(row => [
        row.exam_title,
        `${row.passing_score}%`,
        `${row.total_attempts}`,
        `${row.total_passed}`,
        `${row.pass_rate}%`,
        `${row.avg_percentage}%`
      ])
    ]
  }
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData as any[][])
  
  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports')
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  
  // Create blob and download
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `kcheck-reports-${viewType}-${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
