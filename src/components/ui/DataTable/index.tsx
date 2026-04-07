'use client'

import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

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

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  cardBreakpoint?: number
  actions?: (row: T) => Action<T>[]
  className?: string
  useBemStyles?: boolean
}

function ActionDropdown<T>({ row, actions }: { row: T; actions: Action<T>[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const dropdownStyles = {
    actionDropdown: 'admin-actions',
    dropdownToggle: 'admin-action-btn',
    dropdownMenu: 'dropdown-menu',
    dropdownItem: 'dropdown-item'
  }

  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0 })

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      })
    }
  }, [isOpen])

  return (
    <>
      <div className={dropdownStyles.actionDropdown}>
        <button 
          ref={buttonRef}
          className={dropdownStyles.dropdownToggle}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          Actions ▼
        </button>
      </div>
      
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className={dropdownStyles.dropdownMenu}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            right: 'auto',
            zIndex: 1000
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              className={dropdownStyles.dropdownItem}
              onClick={() => {
                action.onClick(row)
                setIsOpen(false)
              }}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

export function DataTable<T = Record<string, unknown>>({ 
  columns, 
  data, 
  emptyMessage = 'No data available',
  cardBreakpoint,
  actions,
  className = ''
}: DataTableProps<T>) {
  const tableStyles = {
    tableWrap: 'table__wrap',
    table: 'table',
    header: 'table__header',
    row: 'table__row',
    cell: 'table__cell',
    empty: 'table__empty'
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
                  <ActionDropdown row={row} actions={actions(row)} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
