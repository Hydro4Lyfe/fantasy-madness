import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  title?: string;
  columns: Column[];
  data: Record<string, any>[];
  renderCell?: (key: string, value: any, row: Record<string, any>) => React.ReactNode;
}

export function DataTable({ title, columns, data, renderCell }: DataTableProps) {
  return (
    <Card className="p-6 bg-card border border-border">
      {title && <h3 className="text-base font-medium mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`pb-3 text-xs font-medium text-muted-foreground text-${column.align || 'left'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-3 text-sm text-${column.align || 'left'}`}
                  >
                    {renderCell
                      ? renderCell(column.key, row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
