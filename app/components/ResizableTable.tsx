import React, { useState, useCallback, useEffect } from 'react';

export interface Column<T> {
  id: string;
  label: string;
  width: number;
  flex: number;
  render?: (value: T[keyof T]) => React.ReactNode;
}

interface ResizableTableProps<T> {
  columns: Omit<Column<T>, 'width' | 'flex'>[];
  data: T[];
  className?: string;
  defaultColumnWidth?: number;
  minColumnWidth?: number;
}

const ResizableTable = <T extends Record<string, any>>({
  columns: initialColumns,
  data,
  className = '',
  defaultColumnWidth = 150,
  minColumnWidth = 50
}: ResizableTableProps<T>) => {
  const [columns, setColumns] = useState<Column<T>[]>(() =>
    initialColumns.map(col => ({
      ...col,
      width: defaultColumnWidth,
      flex: 1
    }))
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizing, setResizing] = useState<{
    index: number;
    startX: number;
    startWidth: number;
    nextColumnWidth: number;
  } | null>(null);

  useEffect(() => {
    const updateColumnWidths = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        const columnCount = columns.length;
        const baseWidth = newWidth / columnCount;
        
        setColumns(prev => prev.map(col => ({
          ...col,
          width: baseWidth * (col.flex / 1)
        })));
      }
    };

    updateColumnWidths();
    window.addEventListener('resize', updateColumnWidths);
    return () => window.removeEventListener('resize', updateColumnWidths);
  }, [columns.length]);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setIsResizing(true);
    setResizing({
      index,
      startX: e.pageX,
      startWidth: columns[index].width,
      nextColumnWidth: columns[index + 1]?.width || 0
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing) return;

      const diff = e.pageX - resizing.startX;
      const newWidth = Math.max(minColumnWidth, resizing.startWidth + diff);
      
      setColumns(prev => {
        const newColumns = [...prev];
        const currentColumn = newColumns[resizing.index];
        const nextColumn = newColumns[resizing.index + 1];

        if (currentColumn && nextColumn) {
          const totalWidth = currentColumn.width + nextColumn.width;
          const newCurrentWidth = Math.max(minColumnWidth, Math.min(newWidth, totalWidth - minColumnWidth));
          const newNextWidth = totalWidth - newCurrentWidth;

          newColumns[resizing.index] = {
            ...currentColumn,
            width: newCurrentWidth
          };
          newColumns[resizing.index + 1] = {
            ...nextColumn,
            width: newNextWidth
          };
        }

        return newColumns;
      });
    },
    [resizing, minColumnWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizing(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  const columnStyle = (width: number) => ({
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`
  });

  const renderCell = (column: Column<T>, value: T[keyof T]) => {
    if (column.render) {
      return column.render(value);
    }
    return String(value);
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-white shadow-lg rounded-lg overflow-hidden select-none ${isResizing ? 'cursor-col-resize' : ''} ${className}`}
    >
      {/* 表头 */}
      <div className="flex bg-gray-100">
        {columns.map((column, index) => (
          <div
            key={column.id}
            className="relative flex items-center p-4 font-semibold text-gray-700 border-r border-gray-200"
            style={columnStyle(column.width)}
          >
            <div className="truncate">{column.label}</div>
            {index < columns.length - 1 && (
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600"
                onMouseDown={(e) => handleMouseDown(e, index)}
              />
            )}
          </div>
        ))}
      </div>

      {/* 表格内容 */}
      <div className="divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {columns.map((column) => (
              <div
                key={column.id}
                className="p-4 border-r border-gray-200 truncate"
                style={columnStyle(column.width)}
              >
                {renderCell(column, row[column.id as keyof T])}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResizableTable; 