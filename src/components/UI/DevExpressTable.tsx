import React, { useState } from 'react';
import styled from 'styled-components';
import { DevExpressButton } from '../DevExpressStyles';

interface Column {
  key: string;
  title: string;
  width?: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface DevExpressTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
  title?: string;
}

const TableContainer = styled.div`
  background: white;
  border: 1px solid #CCCCCC;
  border-radius: 0;
  font-family: Verdana, Arial, sans-serif;
  font-size: 11px;
`;

const TableHeader = styled.div`
  background: linear-gradient(to bottom, #F8F9FA 0%, #E9ECEF 100%);
  border-bottom: 1px solid #CCCCCC;
  padding: 8px 12px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableTitle = styled.h3`
  margin: 0;
  color: #1177BB;
  font-size: 13px;
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 5px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: Verdana, Arial, sans-serif;
  font-size: 11px;
`;

const TableHead = styled.thead`
  background: linear-gradient(to bottom, #F0F0F0 0%, #E0E0E0 100%);
  
  th {
    padding: 8px 12px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #CCCCCC;
    border-bottom: 2px solid #1177BB;
    color: #333;
    font-size: 11px;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:nth-child(even) {
      background: #F9F9F9;
    }
    
    &:hover {
      background: #E6F3FF;
    }
  }
  
  td {
    padding: 6px 12px;
    border: 1px solid #E0E0E0;
    font-size: 11px;
    vertical-align: top;
  }
`;

const LoadingContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  font-style: italic;
`;

const EmptyContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: #999;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #1177BB;
  cursor: pointer;
  text-decoration: underline;
  font-size: 11px;
  margin-right: 8px;
  
  &:hover {
    color: #FF9900;
  }
`;

export const DevExpressTable: React.FC<DevExpressTableProps> = ({
  data,
  columns,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  title
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle>{title || 'Data Table'}</TableTitle>
        <ButtonGroup>
          {onAdd && (
            <DevExpressButton onClick={onAdd}>
              Add New
            </DevExpressButton>
          )}
        </ButtonGroup>
      </TableHeader>
      
      {loading ? (
        <LoadingContainer>
          Loading data...
        </LoadingContainer>
      ) : data.length === 0 ? (
        <EmptyContainer>
          No data available
        </EmptyContainer>
      ) : (
        <Table>
          <TableHead>
            <tr>
              {columns.map(column => (
                <th 
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width, cursor: 'pointer' }}
                >
                  {column.title}
                  {sortColumn === column.key && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th style={{ width: '120px' }}>Actions</th>
              )}
            </tr>
          </TableHead>
          <TableBody>
            {sortedData.map((record, index) => (
              <tr key={record.id || index}>
                {columns.map(column => (
                  <td key={column.key}>
                    {column.render 
                      ? column.render(record[column.key], record)
                      : record[column.key]
                    }
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    {onEdit && (
                      <ActionButton onClick={() => onEdit(record)}>
                        Edit
                      </ActionButton>
                    )}
                    {onDelete && (
                      <ActionButton onClick={() => onDelete(record)}>
                        Delete
                      </ActionButton>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};