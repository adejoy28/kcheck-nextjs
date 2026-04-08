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

// Global state to track open dropdown
let openDropdownId: string | null = null

function ActionDropdown<T>({ row, actions }: { row: T; actions: Action<T>[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const dropdownId = React.useId() // Unique ID for this dropdown

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

  // Close other dropdowns when this one opens
  const handleToggle = () => {
    if (openDropdownId && openDropdownId !== dropdownId) {
      // Close the other dropdown by dispatching a custom event
      window.dispatchEvent(new CustomEvent('closeDropdowns', { detail: { exceptId: dropdownId } }))
    }
    
    if (openDropdownId === dropdownId) {
      setIsOpen(false)
      openDropdownId = null
    } else {
      setIsOpen(true)
      openDropdownId = dropdownId
    }
  }

  // Listen for close dropdowns event
  React.useEffect(() => {
    const handleCloseDropdowns = (e: CustomEvent) => {
      if (e.detail.exceptId !== dropdownId) {
        setIsOpen(false)
      }
    }

    window.addEventListener('closeDropdowns', handleCloseDropdowns as EventListener)
    return () => {
      window.removeEventListener('closeDropdowns', handleCloseDropdowns as EventListener)
    }
  }, [dropdownId])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        if (openDropdownId === dropdownId) {
          openDropdownId = null
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, dropdownId])

  return (
    <>
      <div className={dropdownStyles.actionDropdown}>
        <button 
          ref={buttonRef}
          className="btn btn--sm btn--secondary"
          onClick={handleToggle}
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          Actions <span className="btn__arrow">▼</span>
        </button>
      </div>
      
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="topbar__dropdown"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            right: 'auto',
            zIndex: 'var(--z-dropdown)',
            opacity: 1,
            visibility: 'visible',
            transform: 'translateY(0)'
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              className={`topbar__dropdown-item ${action.variant === 'danger' ? 'topbar__dropdown-item--danger' : ''}`}
              onClick={() => {
                action.onClick(row)
                setIsOpen(false)
                if (openDropdownId === dropdownId) {
                  openDropdownId = null
                }
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
