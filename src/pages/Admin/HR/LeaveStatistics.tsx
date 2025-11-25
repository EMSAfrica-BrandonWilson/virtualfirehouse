import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Pie, Doughnut, Line, Radar } from 'react-chartjs-2';
import { supabase } from '../../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFHStandardPDF, applyFinalPageNumbers, cleanupTrailingBlankPages } from '../../../utils/pdfReportHelper';
import { getPDFLogo } from '../../../utils/companyLogo';
import { useAuth } from '../../../contexts/AuthContext';
import { usePageImage } from '../../../hooks/usePageImage';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

// ================================
// TypeScript Interfaces
// ================================

export interface LeaveData {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  status: LeaveStatus;
  department: string;
  position: string;
  createdAt: string;
}

export interface LeaveStatisticsData {
  totalLeaves: number;
  approvedLeaves: number;
  pendingLeaves: number;
  rejectedLeaves: number;
  cancelledLeaves: number;
  averageLeaveDuration: number;
  departmentBreakdown: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  leaveTypeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    approvedCount: number;
    pendingCount: number;
  }>;
  leaveByType: Record<LeaveType, number>;
  leaveByStaff: Array<{
    staffName: string;
    staffId: string;
    totalDays: number;
    leaveCount: number;
    department: string;
  }>;
  leaveDistribution: Record<LeaveType, number>;
  usagePercentages: Record<LeaveType, number>;
  approvalStatus: {
    approved: number;
    pending: number;
    rejected: number;
    cancelled: number;
  };
  departmentalTrends: Array<{
    department: string;
    monthlyData: Array<{ month: string; count: number }>;
    totalLeaves: number;
    averageDuration: number;
  }>;
}

export type LeaveType = 'annual' | 'sick' | 'emergency' | 'maternity' | 'paternity' | 'study' | 'toil' | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Department {
  id: string;
  name: string;
  manager?: string;
  totalStaff?: number;
}

// ================================
// Styled Components
// ================================

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const HeaderSection = styled.section`
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
`;

const Divider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
`;

const Paragraph = styled.p`
  font-size: 125%;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
  color: #333;
`;

const HeaderFlex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ImageColumn = styled.div`
  width: 240px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    margin-top: 20px;
  }
`;

const HeaderImage = styled.img`
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const ImagePlaceholder = styled.div`
  width: 224px;
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

// Control Panel Components
const ControlPanel = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  border: 2px solid #e0e0e0;
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 12px 15px;
  border: 2px solid #1177BB;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 10px rgba(255, 153, 0, 0.2);
  }

  &:hover {
    border-color: #FF9900;
  }
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 2px solid #1177BB;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 10px rgba(255, 153, 0, 0.2);
  }
`;

// Button Components
const Button = styled.button<{ variant?: 'primary' | 'success' | 'danger' | 'secondary' }>`
  background: ${props => {
    switch (props.variant) {
      case 'success': return '#28a745';
      case 'danger': return '#dc3545';
      case 'secondary': return '#6c757d';
      default: return '#FF9900';
    }
  }};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Statistics Display Components
const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ color?: string }>`
  background: linear-gradient(135deg, ${props => props.color || '#f5f7fa'} 0%, #c3cfe2 100%);
  padding: 25px;
  border-radius: 12px;
  border-left: 5px solid #1177BB;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1177BB;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const StatDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 8px;
`;

// Chart Components
const ChartsSection = styled.section`
  margin-bottom: 40px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const ChartContainer = styled.div`
  position: relative;
  height: 400px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin: 0;
  font-weight: 600;
`;

const ChartValue = styled.div<{ color?: string }>`
  font-size: 1.8rem;
  font-weight: bold;
  color: ${props => props.color || '#FF9900'};
`;

// Table Components
const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background: linear-gradient(135deg, #1177BB 0%, #0d5a8c 100%);
    color: white;
    padding: 15px 12px;
    text-align: left;
    font-weight: bold;
    font-size: 13px;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #eee;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f0f8ff;
    transform: scale(1.01);
    transition: all 0.2s ease;
  }
`;

// Status Indicators
const StatusBadge = styled.span<{ status: LeaveStatus }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'approved':
        return `
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'pending':
        return `
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'rejected':
        return `
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'cancelled':
        return `
          background-color: #e2e3e5;
          color: #383d41;
          border: 1px solid #d6d8db;
        `;
      default:
        return `
          background-color: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        `;
    }
  }}
`;

// Loading and Error Components
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
  
  &::after {
    content: '';
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #FF9900;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 15px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border: 2px solid #f44336;
  color: #c62828;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.2);
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #999;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
`;

// Metric Cards
const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div<{ gradient?: string }>`
  background: ${props => props.gradient || 'linear-gradient(135deg, #1177BB 0%, #0d5a8c 100%)'};
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

const MetricValue = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

// Usage Progress Bars
const ProgressSection = styled.div`
  margin: 30px 0;
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const ProgressCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ProgressTitle = styled.h4`
  font-size: 1.1rem;
  color: #333;
  margin: 0;
  font-weight: 600;
`;

const ProgressValue = styled.div<{ color?: string }>`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${props => props.color || '#FF9900'};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressBar = styled.div<{ percentage: number; color?: string }>`
  height: 100%;
  background: ${props => props.color || '#FF9900'};
  width: ${props => props.percentage}%;
  transition: width 0.5s ease;
  border-radius: 5px;
`;

const ProgressDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
`;

// Filter Toggle
const ViewModeToggle = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${props => props.active ? '#FF9900' : '#ddd'};
  background: ${props => props.active ? '#FF9900' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: #FF9900;
    background: ${props => props.active ? '#FF9900' : '#fff5e6'};
  }
`;

// ================================
// Chart Configuration
// ================================

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#FF9900',
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#FF9900',
      borderWidth: 1,
    },
  },
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#FF9900',
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
  },
};

const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      angleLines: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
};

// ================================
// Data Processing Functions
// ================================

const fetchEnhancedLeaveData = async (): Promise<LeaveData[]> => {
  // Simulate API call with comprehensive mock data
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockData: LeaveData[] = [
    // January 2024
    { id: '1', staffId: 'EMP001', staffName: 'John Doe', leaveType: 'annual', startDate: '2024-01-15', endDate: '2024-01-20', duration: 6, status: 'approved', department: 'Operations', position: 'Firefighter', createdAt: '2024-01-10' },
    { id: '2', staffId: 'EMP002', staffName: 'Jane Smith', leaveType: 'sick', startDate: '2024-01-10', endDate: '2024-01-12', duration: 3, status: 'approved', department: 'Administration', position: 'Admin Officer', createdAt: '2024-01-08' },
    { id: '3', staffId: 'EMP003', staffName: 'Mike Johnson', leaveType: 'annual', startDate: '2024-01-25', endDate: '2024-01-30', duration: 6, status: 'approved', department: 'Operations', position: 'Firefighter', createdAt: '2024-01-20' },
    { id: '4', staffId: 'EMP004', staffName: 'Sarah Wilson', leaveType: 'emergency', startDate: '2024-01-05', endDate: '2024-01-07', duration: 3, status: 'approved', department: 'Maintenance', position: 'Technician', createdAt: '2024-01-04' },
    
    // February 2024
    { id: '5', staffId: 'EMP005', staffName: 'David Brown', leaveType: 'sick', startDate: '2024-02-15', endDate: '2024-02-18', duration: 4, status: 'approved', department: 'Operations', position: 'Senior Firefighter', createdAt: '2024-02-12' },
    { id: '6', staffId: 'EMP006', staffName: 'Lisa Davis', leaveType: 'annual', startDate: '2024-02-20', endDate: '2024-02-24', duration: 5, status: 'approved', department: 'Training', position: 'Instructor', createdAt: '2024-02-15' },
    { id: '7', staffId: 'EMP007', staffName: 'Tom Garcia', leaveType: 'study', startDate: '2024-02-01', endDate: '2024-02-10', duration: 10, status: 'approved', department: 'Training', position: 'Instructor', createdAt: '2024-01-25' },
    
    // March 2024
    { id: '8', staffId: 'EMP008', staffName: 'Amy Chen', leaveType: 'annual', startDate: '2024-03-15', endDate: '2024-03-25', duration: 11, status: 'approved', department: 'Operations', position: 'Lieutenant', createdAt: '2024-03-01' },
    { id: '9', staffId: 'EMP009', staffName: 'Robert Taylor', leaveType: 'sick', startDate: '2024-03-28', endDate: '2024-03-30', duration: 3, status: 'approved', department: 'Administration', position: 'HR Officer', createdAt: '2024-03-25' },
    { id: '10', staffId: 'EMP010', staffName: 'Emma Martinez', leaveType: 'emergency', startDate: '2024-03-10', endDate: '2024-03-12', duration: 3, status: 'approved', department: 'Operations', position: 'Firefighter', createdAt: '2024-03-08' },
    
    // April 2024
    { id: '11', staffId: 'EMP011', staffName: 'Chris Anderson', leaveType: 'annual', startDate: '2024-04-01', endDate: '2024-04-15', duration: 15, status: 'approved', department: 'Operations', position: 'Firefighter', createdAt: '2024-03-15' },
    { id: '12', staffId: 'EMP012', staffName: 'Maria Rodriguez', leaveType: 'maternity', startDate: '2024-04-10', endDate: '2024-07-10', duration: 91, status: 'approved', department: 'Administration', position: 'Secretary', createdAt: '2024-03-25' },
    { id: '13', staffId: 'EMP013', staffName: 'Kevin Lee', leaveType: 'toil', startDate: '2024-04-25', endDate: '2024-04-27', duration: 3, status: 'approved', department: 'Operations', position: 'Firefighter', createdAt: '2024-04-20' },
    
    // May 2024
    { id: '14', staffId: 'EMP014', staffName: 'Rachel Green', leaveType: 'annual', startDate: '2024-05-05', endDate: '2024-05-20', duration: 16, status: 'approved', department: 'Operations', position: 'Captain', createdAt: '2024-04-20' },
    { id: '15', staffId: 'EMP015', staffName: 'Daniel Kim', leaveType: 'study', startDate: '2024-05-15', endDate: '2024-05-30', duration: 16, status: 'pending', department: 'Training', position: 'Senior Instructor', createdAt: '2024-05-01' },
    { id: '16', staffId: 'EMP016', staffName: 'Sophie Turner', leaveType: 'sick', startDate: '2024-05-25', endDate: '2024-05-28', duration: 4, status: 'approved', department: 'Maintenance', position: 'Technician', createdAt: '2024-05-22' },
    
    // June 2024
    { id: '17', staffId: 'EMP017', staffName: 'Alex Thompson', leaveType: 'annual', startDate: '2024-06-01', endDate: '2024-06-14', duration: 14, status: 'approved', department: 'Training', position: 'Instructor', createdAt: '2024-05-15' },
    { id: '18', staffId: 'EMP018', staffName: 'Nina Patel', leaveType: 'paternity', startDate: '2024-06-10', endDate: '2024-06-24', duration: 15, status: 'approved', department: 'Administration', position: 'Officer', createdAt: '2024-05-25' },
    { id: '19', staffId: 'EMP019', staffName: 'James Wilson', leaveType: 'unpaid', startDate: '2024-06-20', endDate: '2024-06-22', duration: 3, status: 'pending', department: 'Maintenance', position: 'Supervisor', createdAt: '2024-06-15' },
    
    // July 2024
    { id: '20', staffId: 'EMP020', staffName: 'Patricia Brown', leaveType: 'annual', startDate: '2024-07-01', endDate: '2024-07-21', duration: 21, status: 'approved', department: 'Operations', position: 'Senior Firefighter', createdAt: '2024-06-01' },
    { id: '21', staffId: 'EMP021', staffName: 'Michael Scott', leaveType: 'emergency', startDate: '2024-07-30', endDate: '2024-08-01', duration: 3, status: 'pending', department: 'Maintenance', position: 'Supervisor', createdAt: '2024-07-25' },
    
    // August 2024
    { id: '22', staffId: 'EMP022', staffName: 'Jennifer Lee', leaveType: 'annual', startDate: '2024-08-05', endDate: '2024-08-19', duration: 15, status: 'approved', department: 'Training', position: 'Instructor', createdAt: '2024-07-15' },
    { id: '23', staffId: 'EMP023', staffName: 'Mark Davis', leaveType: 'sick', startDate: '2024-08-15', endDate: '2024-08-18', duration: 4, status: 'approved', department: 'Operations', position: 'Firefighter', createdAt: '2024-08-12' },
    { id: '24', staffId: 'EMP024', staffName: 'Carol White', leaveType: 'study', startDate: '2024-08-26', endDate: '2024-09-05', duration: 11, status: 'pending', department: 'Training', position: 'Senior Instructor', createdAt: '2024-08-15' },
    
    // September 2024
    { id: '25', staffId: 'EMP025', staffName: 'Steven Miller', leaveType: 'annual', startDate: '2024-09-02', endDate: '2024-09-16', duration: 15, status: 'approved', department: 'Operations', position: 'Captain', createdAt: '2024-08-01' },
    { id: '26', staffId: 'EMP026', staffName: 'Lisa Garcia', leaveType: 'emergency', startDate: '2024-09-25', endDate: '2024-09-27', duration: 3, status: 'approved', department: 'Maintenance', position: 'Technician', createdAt: '2024-09-20' },
    
    // October 2024
    { id: '27', staffId: 'EMP027', staffName: 'Mary Johnson', leaveType: 'annual', startDate: '2024-10-01', endDate: '2024-10-21', duration: 21, status: 'approved', department: 'Operations', position: 'Lieutenant', createdAt: '2024-08-15' },
    { id: '28', staffId: 'EMP028', staffName: 'Paul Smith', leaveType: 'sick', startDate: '2024-10-15', endDate: '2024-10-17', duration: 3, status: 'pending', department: 'Administration', position: 'Officer', createdAt: '2024-10-10' },
    { id: '29', staffId: 'EMP029', staffName: 'Anna Wilson', leaveType: 'toil', startDate: '2024-10-28', endDate: '2024-10-30', duration: 3, status: 'pending', department: 'Operations', position: 'Firefighter', createdAt: '2024-10-20' },
  ];
  
  return mockData;
};

const calculateEnhancedStatistics = (leaveData: LeaveData[]): LeaveStatisticsData => {
  const totalLeaves = leaveData.length;
  
  // Calculate leave by type
  const leaveByType: Record<LeaveType, number> = {
    annual: 0,
    sick: 0,
    emergency: 0,
    maternity: 0,
    paternity: 0,
    study: 0,
    toil: 0,
    unpaid: 0,
  };
  
  // Calculate leave by staff
  const staffStats: Record<string, { 
    staffId: string; 
    totalDays: number; 
    leaveCount: number; 
    department: string 
  }> = {};
  
  // Calculate monthly trends with status breakdown
  const monthlyTrends: Record<string, { count: number; approvedCount: number; pendingCount: number }> = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(month => {
    monthlyTrends[month] = { count: 0, approvedCount: 0, pendingCount: 0 };
  });
  
  // Calculate approval status
  const approvalStatus = {
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0
  };
  
  // Calculate departmental trends
  const deptTrends: Record<string, { monthlyData: Record<string, number>; totalLeaves: number; totalDays: number }> = {};
  
  leaveData.forEach(leave => {
    // Count by type
    leaveByType[leave.leaveType]++;
    
    // Count by staff
    if (!staffStats[leave.staffName]) {
      staffStats[leave.staffName] = {
        staffId: leave.staffId,
        totalDays: 0,
        leaveCount: 0,
        department: leave.department
      };
    }
    staffStats[leave.staffName].totalDays += leave.duration;
    staffStats[leave.staffName].leaveCount++;
    
    // Count by month with status breakdown
    const month = new Date(leave.startDate).getMonth();
    const monthName = months[month];
    monthlyTrends[monthName].count++;
    if (leave.status === 'approved') monthlyTrends[monthName].approvedCount++;
    if (leave.status === 'pending') monthlyTrends[monthName].pendingCount++;
    
    // Count by approval status
    approvalStatus[leave.status as keyof typeof approvalStatus]++;
    
    // Calculate departmental trends
    if (!deptTrends[leave.department]) {
      deptTrends[leave.department] = {
        monthlyData: {},
        totalLeaves: 0,
        totalDays: 0
      };
    }
    deptTrends[leave.department].totalLeaves++;
    deptTrends[leave.department].totalDays += leave.duration;
    deptTrends[leave.department].monthlyData[monthName] = 
      (deptTrends[leave.department].monthlyData[monthName] || 0) + 1;
  });
  
  const leaveByStaff = Object.entries(staffStats).map(([staffName, stats]) => ({
    staffName,
    staffId: stats.staffId,
    totalDays: stats.totalDays,
    leaveCount: stats.leaveCount,
    department: stats.department,
  }));
  
  // Calculate distribution (same as leaveByType for now)
  const leaveDistribution = { ...leaveByType };
  
  // Calculate monthly trend array
  const monthlyTrend = months.map(month => ({
    month,
    count: monthlyTrends[month].count,
    approvedCount: monthlyTrends[month].approvedCount,
    pendingCount: monthlyTrends[month].pendingCount,
  }));
  
  // Calculate usage percentages based on leave data and typical entitlements
  const usagePercentages: Record<LeaveType, number> = {
    annual: leaveData.length > 0 ? Math.min(100, ((leaveByType.annual / (leaveData.length * 0.4)) * 100)) : 0,
    sick: leaveData.length > 0 ? Math.min(100, ((leaveByType.sick / (leaveData.length * 0.3)) * 100)) : 0,
    emergency: leaveData.length > 0 ? Math.min(100, ((leaveByType.emergency / (leaveData.length * 0.1)) * 100)) : 0,
    maternity: leaveData.length > 0 ? Math.min(100, (leaveByType.maternity > 0 ? 95 : 0)) : 0,
    paternity: leaveData.length > 0 ? Math.min(100, (leaveByType.paternity > 0 ? 90 : 0)) : 0,
    study: leaveData.length > 0 ? Math.min(100, ((leaveByType.study / (leaveData.length * 0.2)) * 100)) : 0,
    toil: leaveData.length > 0 ? Math.min(100, ((leaveByType.toil / (leaveData.length * 0.4)) * 100)) : 0,
    unpaid: leaveData.length > 0 ? Math.min(100, ((leaveByType.unpaid / (leaveData.length * 0.05)) * 100)) : 0,
  };
  
  // Calculate departmental breakdown
  const deptCounts: { [key: string]: number } = {};
  leaveData.forEach(leave => {
    deptCounts[leave.department] = (deptCounts[leave.department] || 0) + 1;
  });
  
  const departmentBreakdown = Object.entries(deptCounts).map(([department, count]) => ({
    department,
    count,
    percentage: totalLeaves > 0 ? Math.round((count / totalLeaves) * 100) : 0
  })).sort((a, b) => b.count - a.count);
  
  // Calculate leave type breakdown
  const typeCounts: { [key: string]: number } = {};
  leaveData.forEach(leave => {
    const type = leave.leaveType;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  const leaveTypeBreakdown = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    percentage: totalLeaves > 0 ? Math.round((count / totalLeaves) * 100) : 0
  })).sort((a, b) => b.count - a.count);
  
  // Calculate average leave duration
  const totalDuration = leaveData.reduce((sum, leave) => sum + leave.duration, 0);
  const averageLeaveDuration = totalLeaves > 0 ? Math.round(totalDuration / totalLeaves) : 0;
  
  // Calculate departmental trends
  const departmentalTrends = Object.entries(deptTrends).map(([department, data]) => ({
    department,
    monthlyData: months.map(month => ({
      month,
      count: data.monthlyData[month] || 0
    })),
    totalLeaves: data.totalLeaves,
    averageDuration: data.totalLeaves > 0 ? Math.round(data.totalDays / data.totalLeaves) : 0,
  }));
  
  return {
    totalLeaves,
    approvedLeaves: approvalStatus.approved,
    pendingLeaves: approvalStatus.pending,
    rejectedLeaves: approvalStatus.rejected,
    cancelledLeaves: approvalStatus.cancelled,
    averageLeaveDuration,
    departmentBreakdown,
    leaveTypeBreakdown,
    monthlyTrend,
    leaveByType,
    leaveByStaff,
    leaveDistribution,
    usagePercentages,
    approvalStatus,
    departmentalTrends,
  };
};

// ================================
// Main Component
// ================================

export const LeaveStatistics: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading: imageLoading } = usePageImage('leave-statistics', '/images/HR.png');
  const { userProfile, getDisplayName } = useAuth();
  
  // State management
  const [statistics, setStatistics] = useState<LeaveStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [viewMode, setViewMode] = useState<'basic' | 'enhanced' | 'detailed'>('enhanced');
  const [leaveData, setLeaveData] = useState<LeaveData[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  
  // Chart refresh functionality
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDepartments();
    loadStatistics();
    
    if (viewMode !== 'basic') {
      loadEnhancedChartData();
    }
  }, [selectedDepartment, selectedYear, selectedMonth, viewMode]);

  // Auto-refresh every 5 minutes when in enhanced mode
  useEffect(() => {
    if (viewMode === 'enhanced') {
      const interval = setInterval(() => {
        loadEnhancedChartData();
        setLastRefresh(new Date());
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [viewMode]);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

      if (error) {
        // Fallback to mock departments
        const mockDepartments: Department[] = [
          { id: '1', name: 'Operations', totalStaff: 45 },
          { id: '2', name: 'Administration', totalStaff: 12 },
          { id: '3', name: 'Maintenance', totalStaff: 8 },
          { id: '4', name: 'Training', totalStaff: 6 },
        ];
        setDepartments(mockDepartments);
      } else {
        setDepartments(data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Fallback to mock departments
      const mockDepartments: Department[] = [
        { id: '1', name: 'Operations', totalStaff: 45 },
        { id: '2', name: 'Administration', totalStaff: 12 },
        { id: '3', name: 'Maintenance', totalStaff: 8 },
        { id: '4', name: 'Training', totalStaff: 6 },
      ];
      setDepartments(mockDepartments);
    }
  };

  const fetchDepartments = loadDepartments;

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data - in production this would fetch from Supabase
      const mockLeaveData = await fetchEnhancedLeaveData();
      
      // Filter data based on selected filters
      let filteredData = mockLeaveData;
      
      if (selectedDepartment) {
        filteredData = filteredData.filter(leave => 
          leave.department.toLowerCase().includes(selectedDepartment.toLowerCase())
        );
      }
      
      if (selectedYear) {
        filteredData = filteredData.filter(leave => 
          new Date(leave.startDate).getFullYear().toString() === selectedYear
        );
      }
      
      if (selectedMonth) {
        const month = parseInt(selectedMonth) - 1;
        filteredData = filteredData.filter(leave => 
          new Date(leave.startDate).getMonth() === month
        );
      }
      
      // Calculate statistics from filtered data
      const calculatedStats = calculateEnhancedStatistics(filteredData);
      setStatistics(calculatedStats);
      
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnhancedChartData = async () => {
    try {
      setChartLoading(true);
      setChartError(null);
      const data = await fetchEnhancedLeaveData();
      const enhancedStats = calculateEnhancedStatistics(data);
      
      setLeaveData(data);
      setStatistics(prevStats => {
        if (!prevStats) return enhancedStats;
        return {
          ...enhancedStats,
          // Keep the filtered data count
          totalLeaves: prevStats.totalLeaves,
          approvedLeaves: prevStats.approvedLeaves,
          pendingLeaves: prevStats.pendingLeaves,
          rejectedLeaves: prevStats.rejectedLeaves,
        };
      });
    } catch (err) {
      setChartError('Failed to load chart data. Please try again.');
      console.error('Error loading enhanced chart data:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    if (viewMode !== 'basic') {
      loadEnhancedChartData();
    }
    loadStatistics();
  };

  // Prepare standard DACO logo with page image fallback
  const getLogoForPDF = async (): Promise<string | null> => {
    try {
      const logo = await getPDFLogo(imageUrl || undefined);
      return logo || null;
    } catch (e) {
      console.warn('Failed to load logo for PDF:', e);
      return null;
    }
  };

  const handlePrint = async () => {
    if (!statistics) return;

    try {
      const logoBase64 = await getPDFLogo();
      const doc = new jsPDF('portrait');

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const deptName = selectedDepartment
        ? (departments.find(d => d.id === selectedDepartment)?.name || selectedDepartment)
        : 'All Departments';
      const monthLabel = selectedMonth ? monthNames[parseInt(selectedMonth) - 1] : 'All Months';
      const summaryText = `Year: ${selectedYear} | Month: ${monthLabel} | Department: ${deptName}`;

      const currentUserData = { profile: { display_name: getDisplayName(), full_name: userProfile?.full_name || '' } };
      const vfhSetup = setupVFHStandardPDF({
        doc,
        logoBase64: logoBase64 || undefined,
        data: {
          departmentName: 'King Fahd International Airport',
          departmentType: 'Airport Rescue & Fire Fighting Services',
          reportTitle: 'Leave Statistics Dashboard Report',
          summaryText,
          currentUser: currentUserData,
        },
      });

      // Summary Statistics table
      const summaryData = [
        ['Total Leaves', statistics.totalLeaves.toString()],
        ['Approved Leaves', statistics.approvedLeaves.toString()],
        ['Pending Leaves', statistics.pendingLeaves.toString()],
        ['Rejected Leaves', statistics.rejectedLeaves.toString()],
        ['Average Leave Duration', `${statistics.averageLeaveDuration} days`],
      ];

      autoTable(doc, {
        head: [['Metric', 'Count']],
        body: summaryData,
        startY: vfhSetup.tableStartY,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage,
      });

      let yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Leave Type Breakdown
      if (statistics.leaveTypeBreakdown.length > 0) {
        doc.setFontSize(14);
        doc.text('Leave Type Breakdown', 20, yPosition);
        yPosition += 12;

        const typeData = statistics.leaveTypeBreakdown.map(item => [
          item.type.charAt(0).toUpperCase() + item.type.slice(1),
          item.count.toString(),
          `${item.percentage}%`,
        ]);

        autoTable(doc, {
          head: [['Leave Type', 'Count', 'Percentage']],
          body: typeData,
          startY: yPosition,
          ...vfhSetup.tableConfig,
          didDrawPage: vfhSetup.tableConfig.didDrawPage,
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Department Breakdown
      if (statistics.departmentBreakdown.length > 0) {
        doc.setFontSize(14);
        doc.text('Department Breakdown', 20, yPosition);
        yPosition += 12;

        const deptData = statistics.departmentBreakdown.map(item => [
          item.department,
          item.count.toString(),
          `${item.percentage}%`,
        ]);

        autoTable(doc, {
          head: [['Department', 'Count', 'Percentage']],
          body: deptData,
          startY: yPosition,
          ...vfhSetup.tableConfig,
          didDrawPage: vfhSetup.tableConfig.didDrawPage,
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Monthly Trends
      doc.setFontSize(14);
      doc.text('Monthly Trends', 20, yPosition);
      yPosition += 12;

      const monthlyData = statistics.monthlyTrend.map(item => [
        item.month,
        item.count.toString(),
        item.approvedCount.toString(),
        item.pendingCount.toString(),
      ]);

      autoTable(doc, {
        head: [['Month', 'Total', 'Approved', 'Pending']],
        body: monthlyData,
        startY: yPosition,
        ...vfhSetup.tableConfig,
        didDrawPage: vfhSetup.tableConfig.didDrawPage,
      });

      // Finalize pages: remove trailing blanks and add accurate page numbers
      try {
        cleanupTrailingBlankPages(doc);
      } catch {}
      applyFinalPageNumbers(doc, {
        departmentName: 'King Fahd International Airport',
        departmentType: 'Airport Rescue & Fire Fighting Services',
        reportTitle: 'Leave Statistics Dashboard Report',
        summaryText,
        currentUser: currentUserData,
      });

      // Route to PDF Viewer
      const pdfDataUri = doc.output('datauristring');
      const pdfKey = `pdf_${vfhSetup.filename.replace('.pdf', '')}`;
      try {
        sessionStorage.setItem(pdfKey, pdfDataUri);
        sessionStorage.setItem('pdf_source_section', '/admin/hr/leave-management/statistics');
        sessionStorage.setItem('pdf_source_path', '/admin/hr/leave-management/statistics');
        navigate(`/pdf-viewer/${pdfKey}`);
      } catch (storageError: any) {
        if (storageError?.name === 'QuotaExceededError') {
          // Fallback to download if viewer storage is full
          const blob = doc.output('blob');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = vfhSetup.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          throw storageError;
        }
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Silent failure in UI; generation errors are logged
    }
  };

  const handleExportCSV = () => {
    if (!statistics) return;

    const csvData: string[][] = [
      ['Leave Statistics Dashboard Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [`Year: ${selectedYear}`],
      ...(selectedMonth ? [[`Month: ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(selectedMonth) - 1]}`]] : []),
      ...(selectedDepartment ? [[`Department: ${departments.find(d => d.id === selectedDepartment)?.name || ''}`]] : []),
      [],
      ['Summary Statistics'],
      ['Metric', 'Value'],
      ['Total Leaves', statistics.totalLeaves.toString()],
      ['Approved Leaves', statistics.approvedLeaves.toString()],
      ['Pending Leaves', statistics.pendingLeaves.toString()],
      ['Rejected Leaves', statistics.rejectedLeaves.toString()],
      ['Average Leave Duration', `${statistics.averageLeaveDuration} days`],
      [],
      ['Department Breakdown'],
      ['Department', 'Count', 'Percentage'],
      ...statistics.departmentBreakdown.map(item => [item.department, item.count.toString(), `${item.percentage}%`]),
      [],
      ['Leave Type Breakdown'],
      ['Leave Type', 'Count', 'Percentage'],
      ...statistics.leaveTypeBreakdown.map(item => [item.type, item.count.toString(), `${item.percentage}%`]),
      [],
      ['Monthly Trends'],
      ['Month', 'Total', 'Approved', 'Pending'],
      ...statistics.monthlyTrend.map(item => [item.month, item.count.toString(), item.approvedCount.toString(), item.pendingCount.toString()]),
    ];

    // Add detailed leave records if available
    if (leaveData.length > 0) {
      csvData.push(
        [] as string[],
        ['Detailed Leave Records'],
        ['ID', 'Staff Name', 'Department', 'Position', 'Leave Type', 'Start Date', 'End Date', 'Duration', 'Status'],
        ...leaveData.map(leave => [
          leave.id,
          leave.staffName,
          leave.department,
          leave.position,
          leave.leaveType,
          leave.startDate,
          leave.endDate,
          leave.duration.toString(),
          leave.status
        ] as string[])
      );
    }

    const csvContent = csvData.map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leave-statistics-dashboard-${selectedYear}${selectedMonth ? `-${selectedMonth}` : ''}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Memoized chart data for better performance
  const chartData = useMemo(() => {
    if (!statistics) return null;

    const leaveTypeLabels = Object.keys(statistics.leaveByType).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    );
    
    return {
      barChartData: {
        labels: leaveTypeLabels,
        datasets: [
          {
            label: 'Leave Requests by Type',
            data: Object.values(statistics.leaveByType),
            backgroundColor: [
              '#FF9900', '#1177BB', '#FF5722', '#4CAF50', 
              '#9C27B0', '#FF9800', '#795548', '#607D8B'
            ],
            borderColor: [
              '#e68a00', '#0d5a8c', '#e64a19', '#388E3C', 
              '#7B1FA2', '#f57c00', '#5D4037', '#455A64'
            ],
            borderWidth: 2,
          },
        ],
      },
      doughnutData: {
        labels: leaveTypeLabels,
        datasets: [
          {
            data: Object.values(statistics.leaveDistribution),
            backgroundColor: [
              '#FF9900', '#1177BB', '#FF5722', '#4CAF50', 
              '#9C27B0', '#FF9800', '#795548', '#607D8B'
            ],
            borderWidth: 3,
            borderColor: '#fff',
          },
        ],
      },
      lineChartData: {
        labels: statistics.monthlyTrend.map(item => item.month),
        datasets: [
          {
            label: 'Total Leave Requests',
            data: statistics.monthlyTrend.map(item => item.count),
            borderColor: '#1177BB',
            backgroundColor: 'rgba(17, 119, 187, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#1177BB',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: 'Approved Leaves',
            data: statistics.monthlyTrend.map(item => item.approvedCount),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#4CAF50',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      radarChartData: {
        labels: leaveTypeLabels,
        datasets: [
          {
            label: 'Leave Distribution',
            data: Object.values(statistics.leaveByType),
            backgroundColor: 'rgba(255, 153, 0, 0.2)',
            borderColor: '#FF9900',
            pointBackgroundColor: '#FF9900',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#FF9900',
            borderWidth: 2,
          },
        ],
      },
    };
  }, [statistics]);

  if (loading && !statistics) {
    return (
      <MainContent>
        <LoadingSpinner>Loading leave statistics dashboard...</LoadingSpinner>
      </MainContent>
    );
  }

  if (!statistics) {
    return (
      <MainContent>
        <NoDataMessage>No statistics data available. Please check your filters and try again.</NoDataMessage>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <HeaderSection>
        <HeaderFlex>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title>Leave Statistics Dashboard</Title>
            <Divider />
            <Paragraph>
              Comprehensive analytics and insights into leave management patterns, usage trends, and departmental analysis. 
              This advanced dashboard provides detailed visualizations and metrics to support data-driven HR decisions and 
              workforce planning with real-time monitoring capabilities.
            </Paragraph>
            <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
              📊 Last updated: {lastRefresh.toLocaleString()} | 
              📋 {leaveData.length} total records | 
              🏢 {departments.length} departments
            </div>
          </div>
          <ImageColumn>
            {imageLoading ? (
              <ImagePlaceholder>Loading...</ImagePlaceholder>
            ) : imageUrl ? (
              <HeaderImage 
                src={imageUrl} 
                alt="Leave Statistics Dashboard" 
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = '/images/HR.png';
                }}
              />
            ) : (
              <ImagePlaceholder>📊 Statistics</ImagePlaceholder>
            )}
          </ImageColumn>
        </HeaderFlex>
      </HeaderSection>

      <ControlPanel>
        <ControlGrid>
          <FormGroup>
            <Label>Year</Label>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2020"
              max="2030"
              placeholder="Select year"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Month</Label>
            <Select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Department</Label>
            <Select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} {dept.totalStaff ? `(${dept.totalStaff} staff)` : ''}
                </option>
              ))}
            </Select>
          </FormGroup>
        </ControlGrid>

        <ViewModeToggle>
          <Label style={{ marginRight: '10px' }}>View Mode:</Label>
          <ToggleButton 
            active={viewMode === 'basic'} 
            onClick={() => setViewMode('basic')}
          >
            📊 Basic
          </ToggleButton>
          <ToggleButton 
            active={viewMode === 'enhanced'} 
            onClick={() => setViewMode('enhanced')}
          >
            📈 Enhanced
          </ToggleButton>
          <ToggleButton 
            active={viewMode === 'detailed'} 
            onClick={() => setViewMode('detailed')}
          >
            📋 Detailed
          </ToggleButton>
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? '🔼 Hide' : '🔽 Show'} Filters
          </Button>
        </ViewModeToggle>

        <ActionButtons>
          <Button onClick={handleRefresh} disabled={chartLoading}>
            🔄 Refresh Data
          </Button>
          <Button variant="success" onClick={handleExportCSV}>
            📊 Export CSV
          </Button>
          <Button onClick={handlePrint}>
            📄 Export PDF
          </Button>
        </ActionButtons>
      </ControlPanel>

      {chartLoading && (
        <LoadingSpinner>Loading enhanced dashboard data...</LoadingSpinner>
      )}
      
      {chartError && (
        <ErrorMessage>
          {chartError}
          <div style={{ marginTop: '15px' }}>
            <Button onClick={loadEnhancedChartData} disabled={chartLoading}>
              🔄 Retry Loading
            </Button>
          </div>
        </ErrorMessage>
      )}

      {viewMode !== 'basic' && statistics && !chartLoading && !chartError && (
        <>
          {/* Key Performance Metrics */}
          <Section>
            <SubTitle>Key Performance Indicators</SubTitle>
            <MetricGrid>
              <MetricCard gradient="linear-gradient(135deg, #1177BB 0%, #0d5a8c 100%)">
                <MetricValue>{statistics.totalLeaves}</MetricValue>
                <MetricLabel>Total Leave Requests</MetricLabel>
              </MetricCard>
              <MetricCard gradient="linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)">
                <MetricValue>{statistics.approvedLeaves}</MetricValue>
                <MetricLabel>Approved Leaves</MetricLabel>
              </MetricCard>
              <MetricCard gradient="linear-gradient(135deg, #FF9800 0%, #f57c00 100%)">
                <MetricValue>{statistics.pendingLeaves}</MetricValue>
                <MetricLabel>Pending Approval</MetricLabel>
              </MetricCard>
              <MetricCard gradient="linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)">
                <MetricValue>{statistics.averageLeaveDuration}</MetricValue>
                <MetricLabel>Avg Duration (Days)</MetricLabel>
              </MetricCard>
              <MetricCard gradient="linear-gradient(135deg, #FF5722 0%, #e64a19 100%)">
                <MetricValue>{statistics.rejectedLeaves}</MetricValue>
                <MetricLabel>Rejected Requests</MetricLabel>
              </MetricCard>
              <MetricCard gradient="linear-gradient(135deg, #607D8B 0%, #455A64 100%)">
                <MetricValue>{departments.length}</MetricValue>
                <MetricLabel>Active Departments</MetricLabel>
              </MetricCard>
            </MetricGrid>
          </Section>

          {/* Charts Dashboard */}
          <ChartsSection>
            <SubTitle>Interactive Analytics Dashboard</SubTitle>
            <DashboardGrid>
              {/* Leave by Type Bar Chart */}
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Leave Requests by Type</ChartTitle>
                  <ChartValue>{Object.values(statistics.leaveByType).reduce((a, b) => a + b, 0)}</ChartValue>
                </ChartHeader>
                <ChartContainer>
                  {chartData && (
                    <Bar data={chartData.barChartData} options={chartOptions} />
                  )}
                </ChartContainer>
              </ChartCard>

              {/* Leave Distribution Doughnut Chart */}
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Leave Distribution</ChartTitle>
                  <ChartValue>{Object.keys(statistics.leaveDistribution).length} Types</ChartValue>
                </ChartHeader>
                <ChartContainer>
                  {chartData && (
                    <Doughnut data={chartData.doughnutData} options={pieChartOptions} />
                  )}
                </ChartContainer>
              </ChartCard>

              {/* Monthly Trends Line Chart */}
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Monthly Leave Trends</ChartTitle>
                  <ChartValue>{statistics.monthlyTrend.reduce((sum, month) => sum + month.count, 0)}</ChartValue>
                </ChartHeader>
                <ChartContainer>
                  {chartData && (
                    <Line data={chartData.lineChartData} options={lineChartOptions} />
                  )}
                </ChartContainer>
              </ChartCard>

              {/* Department Statistics */}
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Leaves by Department</ChartTitle>
                  <ChartValue>{statistics.departmentBreakdown.length}</ChartValue>
                </ChartHeader>
                <ChartContainer>
                  <Pie 
                    data={{
                      labels: statistics.departmentBreakdown.map(dept => dept.department),
                      datasets: [
                        {
                          data: statistics.departmentBreakdown.map(dept => dept.count),
                          backgroundColor: ['#FF9900', '#1177BB', '#4CAF50', '#FF5722', '#9C27B0'],
                          borderWidth: 3,
                          borderColor: '#fff',
                        },
                      ],
                    }} 
                    options={pieChartOptions} 
                  />
                </ChartContainer>
              </ChartCard>

              {/* Approval Status Chart */}
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Approval Status Overview</ChartTitle>
                  <ChartValue>{Math.round((statistics.approvedLeaves / statistics.totalLeaves) * 100) || 0}%</ChartValue>
                </ChartHeader>
                <ChartContainer>
                  <Doughnut 
                    data={{
                      labels: ['Approved', 'Pending', 'Rejected', 'Cancelled'],
                      datasets: [
                        {
                          data: [
                            statistics.approvalStatus.approved,
                            statistics.approvalStatus.pending,
                            statistics.approvalStatus.rejected,
                            statistics.approvalStatus.cancelled,
                          ],
                          backgroundColor: ['#4CAF50', '#FF9800', '#F44336', '#9E9E9E'],
                          borderWidth: 3,
                          borderColor: '#fff',
                        },
                      ],
                    }} 
                    options={pieChartOptions} 
                  />
                </ChartContainer>
              </ChartCard>

              {/* Radar Chart for Leave Type Analysis */}
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Leave Type Analysis</ChartTitle>
                  <ChartValue>Coverage</ChartValue>
                </ChartHeader>
                <ChartContainer>
                  {chartData && (
                    <Radar data={chartData.radarChartData} options={radarChartOptions} />
                  )}
                </ChartContainer>
              </ChartCard>
            </DashboardGrid>
          </ChartsSection>

          {/* Usage Percentage Progress Bars */}
          <Section>
            <SubTitle>Leave Usage Analysis</SubTitle>
            <ProgressSection>
              <ProgressGrid>
                {Object.entries(statistics.usagePercentages).map(([leaveType, percentage]) => (
                  <ProgressCard key={leaveType}>
                    <ProgressHeader>
                      <ProgressTitle>
                        {leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave Usage
                      </ProgressTitle>
                      <ProgressValue 
                        color={percentage > 80 ? '#FF5722' : percentage > 60 ? '#FF9800' : '#4CAF50'}
                      >
                        {percentage}%
                      </ProgressValue>
                    </ProgressHeader>
                    <ProgressBarContainer>
                      <ProgressBar 
                        percentage={percentage}
                        color={percentage > 80 ? '#FF5722' : percentage > 60 ? '#FF9800' : '#4CAF50'}
                      />
                    </ProgressBarContainer>
                    <ProgressDescription>
                      {percentage > 80 ? 'High usage - Monitor closely' : 
                       percentage > 60 ? 'Moderate usage - Normal range' : 
                       'Low usage - Good utilization'}
                    </ProgressDescription>
                  </ProgressCard>
                ))}
              </ProgressGrid>
            </ProgressSection>
          </Section>

          {/* Departmental Trends */}
          {viewMode === 'detailed' && statistics.departmentalTrends.length > 0 && (
            <Section>
              <SubTitle>Departmental Analysis</SubTitle>
              <DashboardGrid>
                {statistics.departmentalTrends.slice(0, 4).map((dept, index) => (
                  <ChartCard key={dept.department}>
                    <ChartHeader>
                      <ChartTitle>{dept.department}</ChartTitle>
                      <ChartValue>{dept.totalLeaves}</ChartValue>
                    </ChartHeader>
                    <ChartContainer>
                      <Line 
                        data={{
                          labels: dept.monthlyData.map(item => item.month),
                          datasets: [
                            {
                              label: 'Monthly Leave Count',
                              data: dept.monthlyData.map(item => item.count),
                              borderColor: ['#FF9900', '#1177BB', '#4CAF50', '#FF5722'][index % 4],
                              backgroundColor: `${['#FF9900', '#1177BB', '#4CAF50', '#FF5722'][index % 4]}20`,
                              fill: true,
                              tension: 0.4,
                              pointBackgroundColor: ['#FF9900', '#1177BB', '#4CAF50', '#FF5722'][index % 4],
                              pointBorderColor: '#fff',
                              pointBorderWidth: 2,
                              pointRadius: 4,
                            },
                          ],
                        }} 
                        options={lineChartOptions} 
                      />
                    </ChartContainer>
                    <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                      <strong>Average Duration:</strong> {dept.averageDuration} days
                    </div>
                  </ChartCard>
                ))}
              </DashboardGrid>
            </Section>
          )}
        </>
      )}

      {/* Enhanced Statistics Cards */}
      <Section>
        <SubTitle>Summary Statistics</SubTitle>
        <StatisticsGrid>
          <StatCard>
            <StatNumber>{statistics.totalLeaves}</StatNumber>
            <StatLabel>Total Leave Requests</StatLabel>
            <StatDescription>All leave requests for {selectedYear}</StatDescription>
          </StatCard>

          <StatCard color="#e8f5e8">
            <StatNumber>{statistics.approvedLeaves}</StatNumber>
            <StatLabel>Approved Leaves</StatLabel>
            <StatDescription>
              {statistics.totalLeaves > 0 ? 
                Math.round((statistics.approvedLeaves / statistics.totalLeaves) * 100) : 0
              }% approval rate
            </StatDescription>
          </StatCard>

          <StatCard color="#fff3e0">
            <StatNumber>{statistics.pendingLeaves}</StatNumber>
            <StatLabel>Pending Approval</StatLabel>
            <StatDescription>Awaiting review and processing</StatDescription>
          </StatCard>

          <StatCard color="#e3f2fd">
            <StatNumber>{statistics.averageLeaveDuration}</StatNumber>
            <StatLabel>Average Duration</StatLabel>
            <StatDescription>Days per leave request</StatDescription>
          </StatCard>
        </StatisticsGrid>
      </Section>

      {/* Detailed Tables */}
      <Section>
        <SubTitle>Department Distribution Analysis</SubTitle>
        {statistics.departmentBreakdown.length > 0 ? (
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Leave Count</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {statistics.departmentBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.department}</strong></td>
                    <td>{item.count}</td>
                    <td>{item.percentage}%</td>
                    <td>
                      <StatusBadge status={item.percentage > 30 ? 'approved' : 'pending'}>
                        {item.percentage > 30 ? 'High Activity' : 'Normal Activity'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>
        ) : (
          <NoDataMessage>No department distribution data available</NoDataMessage>
        )}
      </Section>

      <Section>
        <SubTitle>Leave Type Breakdown</SubTitle>
        {statistics.leaveTypeBreakdown.length > 0 ? (
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Usage Level</th>
                </tr>
              </thead>
              <tbody>
                {statistics.leaveTypeBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.type.charAt(0).toUpperCase() + item.type.slice(1)} Leave</strong></td>
                    <td>{item.count}</td>
                    <td>{item.percentage}%</td>
                    <td>
                      <StatusBadge status={
                        item.percentage > 40 ? 'approved' : 
                        item.percentage > 20 ? 'pending' : 'cancelled'
                      }>
                        {item.percentage > 40 ? 'High Usage' : 
                         item.percentage > 20 ? 'Moderate Usage' : 'Low Usage'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>
        ) : (
          <NoDataMessage>No leave type data available</NoDataMessage>
        )}
      </Section>

      <Section>
        <SubTitle>Monthly Trend Analysis ({selectedYear})</SubTitle>
        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Leaves</th>
                <th>Approved</th>
                <th>Pending</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {statistics.monthlyTrend.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.month}</strong></td>
                  <td>{item.count}</td>
                  <td>{item.approvedCount}</td>
                  <td>{item.pendingCount}</td>
                  <td>
                    <StatusBadge status={
                      item.count > 3 ? 'approved' : 
                      item.count > 1 ? 'pending' : 'cancelled'
                    }>
                      {item.count > 3 ? 'High Activity' : 
                       item.count > 1 ? 'Normal Activity' : 'Low Activity'}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>
      </Section>

      {/* Staff Leave Summary (Detailed View) */}
      {viewMode === 'detailed' && statistics.leaveByStaff.length > 0 && (
        <Section>
          <SubTitle>Individual Staff Leave Summary</SubTitle>
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Staff ID</th>
                  <th>Department</th>
                  <th>Leave Count</th>
                  <th>Total Days</th>
                  <th>Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                {statistics.leaveByStaff
                  .sort((a, b) => b.totalDays - a.totalDays)
                  .slice(0, 20) // Show top 20
                  .map((staff, index) => (
                    <tr key={index}>
                      <td><strong>{staff.staffName}</strong></td>
                      <td>{staff.staffId}</td>
                      <td>{staff.department}</td>
                      <td>{staff.leaveCount}</td>
                      <td>{staff.totalDays}</td>
                      <td>{Math.round(staff.totalDays / staff.leaveCount)} days</td>
                    </tr>
                  ))}
              </tbody>
            </StyledTable>
          </TableContainer>
          {statistics.leaveByStaff.length > 20 && (
            <div style={{ textAlign: 'center', padding: '15px', color: '#666', fontSize: '0.9rem' }}>
              Showing top 20 staff members. Export CSV for complete data.
            </div>
          )}
        </Section>
      )}

      {/* Footer Information */}
      <Section>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '2px solid #e9ecef',
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Report Information:</strong>
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
            📅 Generated on: {new Date().toLocaleString()} | 
            📊 Total Records: {leaveData.length} | 
            🏢 Departments: {departments.length} | 
            📁 Export: PDF/CSV available
          </div>
        </div>
      </Section>
    </MainContent>
  );
};