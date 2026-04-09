'use client'

// SimpleTable component - replacement for complex DataTable
import React from 'react'

export interface Column<T = Record<string, unknown>> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
  hideOnSmall?: boolean
}

export interface Action<T = Record<string, unknown>> {
  label: string
  onClick: (row: T) => void
  variant?: 'primary' | 'danger' | 'default'
}

interface SimpleTableProps<T = Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  actions?: (row: T) => Action<T>[]
  className?: string
  useBemStyles?: boolean
}

export function SimpleTable<T = Record<string, unknown>>({ 
  columns, 
  data, 
  emptyMessage = 'No data available',
  actions,
  className = ''
}: SimpleTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={`table__wrap ${className}`}>
        <table className="table">
          <tbody>
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="table__empty">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={`table__wrap ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={String(column.key)} 
                className={`
                  table__header
                  ${column.hideOnMobile ? 'hide-mobile' : ''}
                  ${column.hideOnSmall ? 'hide-small' : ''}
                `}
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="table__header">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="table__row">
              {columns.map((column) => {
                const value = row[column.key]
                const content = column.render ? column.render(value, row) : String(value)
                
                return (
                  <td 
                    key={String(column.key)} 
                    className={`
                      table__cell
                      ${column.className || ''}
                      ${column.hideOnMobile ? 'hide-mobile' : ''}
                      ${column.hideOnSmall ? 'hide-small' : ''}
                    `}
                    data-label={column.label}
                  >
                    {content}
                  </td>
                )
              })}
              {actions && (
                <td className="table__cell" data-label="Actions">
                  <div className="flex gap-2">
                    {actions(row).map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className={`btn btn--sm ${
                          action.variant === 'danger' ? 'btn--danger' : 
                          action.variant === 'primary' ? 'btn--primary' : 
                          'btn--secondary'
                        }`}
                        onClick={() => action.onClick(row)}
                        type="button"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
