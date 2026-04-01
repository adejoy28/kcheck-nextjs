'use client'

import React, { useState } from 'react'
import styles from './DataTable.module.scss'

export interface Column<T = any> {
  key: keyof T
  label: string
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
  hideOnSmall?: boolean
}

export interface Action {
  label: string
  onClick: (row: any) => void
  variant?: 'primary' | 'danger' | 'default'
}

interface DataTableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  cardBreakpoint?: number
  actions?: (row: T) => Action[]
  className?: string
  useBemStyles?: boolean
}

function ActionDropdown({ row, actions, useBemStyles }: { row: any; actions: Action[]; useBemStyles?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  const dropdownStyles = useBemStyles ? {
    actionDropdown: 'admin-actions',
    dropdownToggle: 'admin-action-btn',
    dropdownMenu: 'dropdown-menu',
    dropdownItem: 'dropdown-item'
  } : {
    actionDropdown: styles.actionDropdown,
    dropdownToggle: styles.dropdownToggle,
    dropdownMenu: styles.dropdownMenu,
    dropdownItem: styles.dropdownItem
  }

  return (
    <div className={dropdownStyles.actionDropdown}>
      <button 
        className={dropdownStyles.dropdownToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        Actions ▼
      </button>
      {isOpen && (
        <div className={dropdownStyles.dropdownMenu}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={`${dropdownStyles.dropdownItem} ${useBemStyles ? '' : styles[`dropdownItem--${action.variant || 'default'}`]}`}
              onClick={() => {
                action.onClick(row)
                setIsOpen(false)
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DataTable<T = any>({ 
  columns, 
  data, 
  emptyMessage = 'No data available',
  cardBreakpoint,
  actions,
  className = '',
  useBemStyles = false
}: DataTableProps<T>) {
  const tableStyles = useBemStyles ? {
    tableWrap: 'table__wrap',
    table: 'table',
    header: 'table__header',
    row: 'table__row',
    cell: 'table__cell',
    empty: 'table__empty'
  } : {
    tableWrap: styles.tableWrap,
    table: styles.table,
    header: styles.header,
    row: styles.row,
    cell: styles.cell,
    empty: styles.empty
  }

  if (data.length === 0) {
    return (
      <div className={`${tableStyles.tableWrap} ${className}`}>
        <table className={tableStyles.table}>
          <tbody>
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className={tableStyles.empty}>
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div 
      className={`${tableStyles.tableWrap} ${className}`}
      style={cardBreakpoint ? { '--card-breakpoint': `${cardBreakpoint}px` } as React.CSSProperties : undefined}
    >
      <table className={tableStyles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={String(column.key)} 
                className={`
                  ${tableStyles.header}
                  ${column.hideOnMobile ? 'hide-mobile' : ''}
                  ${column.hideOnSmall ? 'hide-small' : ''}
                `}
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className={tableStyles.header}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={tableStyles.row}>
              {columns.map((column) => {
                const value = row[column.key]
                const content = column.render ? column.render(value, row) : String(value)
                
                return (
                  <td 
                    key={String(column.key)} 
                    className={`
                      ${tableStyles.cell}
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
                <td className={tableStyles.cell} data-label="Actions">
                  <ActionDropdown row={row} actions={actions(row)} useBemStyles={useBemStyles} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
