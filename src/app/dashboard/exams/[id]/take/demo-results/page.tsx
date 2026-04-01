import DemoResultsPage from '../demo-results'

interface DemoResultsWrapperProps {
    searchParams: {
        score?: string
        total?: string
        percentage?: string
        passed?: string
        examTitle?: string
    }
}

export default function DemoResultsWrapper({ searchParams }: DemoResultsWrapperProps) {
    const score = parseInt(searchParams.score || '0')
    const total = parseInt(searchParams.total || '0')
    const percentage = parseInt(searchParams.percentage || '0')
    const passed = searchParams.passed === 'true'
    const examTitle = searchParams.examTitle || 'Demo Test'

    return (
        <DemoResultsPage
            score={score}
            total={total}
            percentage={percentage}
            passed={passed}
            examTitle={examTitle}
        />
    )
}
