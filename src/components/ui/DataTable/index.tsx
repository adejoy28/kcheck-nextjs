'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './DataTable.module.scss'

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

function ActionDropdown<T>({ row, actions, useBemStyles }: { row: T; actions: Action<T>[]; useBemStyles?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, right: 0 as number | 'auto' })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      
      // Calculate position for portal dropdown
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        
        // For position: fixed, we use viewport coordinates directly
        const top = rect.bottom + 4
        const left = rect.left
        
        console.log('Button rect:', rect)
        console.log('Calculated position:', { top, left })
        
        setDropdownPosition({ top, left, right: 0 })
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

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
              className={`${dropdownStyles.dropdownItem} ${useBemStyles ? '' : styles[`dropdownItem--${action.variant || 'default'}`]}`}
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
