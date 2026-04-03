
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

export async function exportToPDF(data: ReportData[], viewType: 'staff' | 'exam') {
  console.log('--- exportToPDF started ---', { count: data.length, viewType })
  
  if (typeof window === 'undefined') {
    console.error('exportToPDF called on server side')
    return
  }

  try {
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: viewType === 'staff' ? 'landscape' : 'portrait' })

  // Title
  doc.setFontSize(16)
  doc.text('Knowledge Check System - Reports', 14, 15)

  // Timestamp
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23)

  if (viewType === 'staff') {
    const head = [['Staff', 'Team', 'Exam', 'Batch', 'Score', '%', 'Duration', 'Pass Mark', 'Result', 'Date']]
    const body = data.map(row => [
      row.user_name,
      row.team_name || '—',
      row.exam_title || '—',
      row.batch_name || '—',
      `${row.score} / ${row.total_questions || '—'}`,
      `${row.percentage}%`,
      row.time_taken || '—',
      `${row.passing_score}%`,
      row.passed ? 'Passed' : 'Failed',
      new Date(row.completed_at).toLocaleDateString(),
    ])

    autoTable(doc, {
      head,
      body,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 8) {
          const passed = hookData.cell.raw === 'Passed'
          hookData.cell.styles.textColor = passed ? [8, 80, 65] : [121, 31, 31]
          hookData.cell.styles.fontStyle = 'bold'
        }
      },
    })
  } else {
    const head = [['Exam', 'Pass Mark', 'Total Attempts', 'Passed', 'Pass Rate', 'Avg Score']]
    const body = data.map(row => [
      row.exam_title || '—',
      `${row.passing_score}%`,
      `${row.total_attempts ?? '—'}`,
      `${row.total_passed ?? '—'}`,
      `${row.pass_rate}%`,
      `${row.avg_percentage}%`,
    ])

    autoTable(doc, {
      head,
      body,
      startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 255] },
    })
  }

    doc.save(`kcheck-reports-${viewType}-${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error: unknown) {
    console.error('Failed to generate PDF:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

export function exportToExcel(data: ReportData[], viewType: 'staff' | 'exam') {
  let worksheetData: (string | number)[][] = []

  if (viewType === 'staff') {
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
    worksheetData = [
      ['Exam', 'Pass Mark', 'Total Attempts', 'Passed', 'Pass Rate', 'Average Score'],
      ...data.map(row => [
        row.exam_title || '—',
        `${row.passing_score}%`,
        `${row.total_attempts}`,
        `${row.total_passed}`,
        `${row.pass_rate}%`,
        `${row.avg_percentage}%`
      ])
    ]
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

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
