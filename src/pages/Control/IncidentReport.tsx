import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVFH_A4_P, cleanupTrailingBlankPages, applyFinalPageNumbers, createStandardizedFooter, addStandardizedHeader, addStandardizedLogo } from '../../utils/pdfReportHelper';
import { getCompanyLogo } from '../../utils/companyLogo';
import { formatDateTime } from '../../lib/utils';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;
const Section = styled.section` margin-bottom: 2rem;`;
const FlexRow = styled.div`
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: 20px;
  @media (max-width: 768px) { flex-direction: column; }
`;
const Column = styled.div<{ $width?: string }>`
  width: ${p => p.$width || '48%'}; vertical-align: top; text-align: left;
  @media (max-width: 768px) { width: 100% !important; }
`;
const ImageColumn = styled.div`
  width: 240px; display: flex; justify-content: center; align-items: flex-start;
  @media (max-width: 768px) { width: 100% !important; justify-content: center; margin-top: 20px; }
`;
const Title = styled.h1` font-size: 2.2rem; color: #FF9900; font-weight: bold; margin-bottom: 10px;`;
const Divider = styled.hr` width: 100%; border: 5px solid #FF9900; border-radius: 3px; margin: 15px 0;`;
const Paragraph = styled.p` font-size: 125%; letter-spacing: 1.25px; line-height: 25px; text-align: justify; margin-bottom: 15px;`;
const HeaderImage = styled.img` width: 224px; height: auto; max-width: 224px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1);`;
const ImagePlaceholder = styled.div` width: 224px; height: 160px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666; box-shadow: 0 2px 8px rgba(0,0,0,.1);`;
const Input = styled.input` width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px; &:focus { border-color: #1177BB; outline: none; }`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  background-color: #1177BB;
  color: white;
  transition: background-color 0.2s ease, transform 0.1s ease;
  &:hover { background-color: #1a86cc; }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const IncidentReport: React.FC = () => {
  const { imageUrl, loading: imageLoading } = usePageImage('incident-report', '/images/ControlRoom.png');
  const [incidentNumber, setIncidentNumber] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => { setIncidentNumber(localStorage.getItem('vfh_current_incident_number') || ''); }, []);
  
  const generateIncidentPDF = async () => {
    const inc = incidentNumber || localStorage.getItem('vfh_current_incident_number') || '';
    if (!inc) {
      setError('Incident number not available.');
      return;
    }
    try {
      setGenerating(true);
      setError(null);
      let currentUser: any = null;
      try {
        const userResponse = await supabase.auth.getUser();
        currentUser = userResponse?.data?.user || null;
        if (currentUser?.id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, full_name, first_name, last_name')
            .eq('user_id', currentUser.id)
            .single();
          if (profileData) {
            currentUser.profile = { ...currentUser.profile, ...profileData };
          }
        }
      } catch {}
      const logoBase64 = await getCompanyLogo();
      const summaryText = `Incident #: ${inc}`;
      const { doc, tableStartY, tableConfig } = setupVFH_A4_P({
        data: {
          departmentName: 'King Fahd International Airport',
          departmentType: 'Airport Rescue & Fire Fighting Services',
          reportTitle: `Incident Report: ${inc}`,
          summaryText,
          currentUser
        },
        logoBase64
      });
      const getSingle = async (table: string) => {
        const { data } = await supabase
          .from(table)
          .select('*')
          .eq('incident_number', inc)
          .maybeSingle();
        return data || null;
      };
      const getList = async (table: string) => {
        const { data } = await supabase
          .from(table)
          .select('*')
          .eq('incident_number', inc);
        return Array.isArray(data) ? data : [];
      };
      const [
        callTaking,
        dispatching,
        responding,
        narrative,
        casualties,
        propertyInfo,
        propertyItems,
        damageLossItems,
        equipmentUsed,
        routeFinder,
        weatherInfo,
        mediaFiles,
        lockStatus
      ] = await Promise.all([
        getSingle('03_ecc_03_01_Incident_Call_Taking'),
        getSingle('03_ecc_03_02_Incident_Call_Dispatching'),
        getSingle('03_ecc_03_03_Responding_Resources'),
        getSingle('03_ecc_03_04_Incident_Narrative'),
        getSingle('03_ecc_03_05_Casualties_&_Fatalities'),
        getSingle('03_ecc_03_08_Property_Information'),
        getList('03_ecc_03_08_Property_Information_Items'),
        getList('03_ecc_03_06_Damage_Loss_Reporting_Items'),
        getList('03_ecc_03_07_Equipment_Used'),
        getList('03_ecc_03_09_Incident_Route_Finder'),
        (async () => {
          // Custom fetch for weather to handle multiple rows (get latest)
          const { data } = await supabase
            .from('03_ecc_03_10_Weather_Information')
            .select('*')
            .eq('incident_number', inc)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          return data || null;
        })(),
        getList('03_ecc_03_11_Multi_Media_Files'),
        getSingle('03_ecc_03_13_Record_Lock_Status')
      ]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const pageWidth = (doc.internal.pageSize as any).width || (doc.internal.pageSize as any).getWidth?.();
      const bannerY = tableStartY - 6;
      doc.setFillColor(17, 119, 187);
      doc.rect(5, bannerY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Incident Call Taking', 14, bannerY + 5);
      doc.setTextColor(0, 0, 0);
      // --- CALL TAKING SECTION (Replaced Screenshot with Table) ---
      // Removed html2canvas logic to improve reliability
      
      const s = callTaking || (() => {
        try {
          const local = localStorage.getItem('vfh_call_taking_form');
          if (local) {
            const p = JSON.parse(local);
            // Map local camelCase to DB snake_case
            return {
              shift_on_duty: p.shiftOnDuty,
              call_taker_name: p.callTaker,
              incident_date: p.incidentDate,
              incident_time: p.incidentTime,
              caller_name: p.callName,
              caller_number: p.callerNumber,
              second_caller_name: p.secondCaller,
              second_caller_number: p.secondCallerNumber,
              incident_category: p.incidentCategory,
              incident_sub_category: p.incidentSubCategory,
              street_no: p.streetNo,
              street_name: p.streetName,
              suburb: p.suburb
            };
          }
        } catch {}
        return {};
      })();

      console.log('Call Taking Data for PDF:', s);

      // Fetch Call Taker Name if we have an ID
      let callTakerName = s.call_taker_name || s.call_taker_id || '';
      if (callTakerName) {
        try {
          // If numeric, try fetching from staff registration first
          if (/^\d+$/.test(String(callTakerName))) {
             const { data: staff } = await supabase
              .from('02_admin_staff_1_registration')
              .select('first_name, middle_name, last_name')
              .eq('staff_id', callTakerName)
              .single();
            if (staff) {
              const full = [staff.first_name, staff.middle_name, staff.last_name].filter(Boolean).join(' ').trim();
              if (full) callTakerName = full;
            }
          }
          
          // Also try to fetch profile regardless of format (UUID or otherwise)
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, display_name')
            .eq('user_id', callTakerName)
            .single();
          if (profile) {
            callTakerName = profile.full_name || profile.display_name || callTakerName;
          }
        } catch {}
      }

      const callTakingRows: string[][] = [
        ['Shift on Duty', s.shift_on_duty || '', 'Call Taker', callTakerName],
        ['Incident Date', s.incident_date || '', 'Incident Time', s.incident_time || ''],
        ['Caller Name', s.caller_name || '', 'Caller Number', s.caller_number || ''],
        ['2nd Caller', s.second_caller_name || '', '2nd Caller Number', s.second_caller_number || ''],
        ['Incident Category', s.incident_category || '', 'Incident Sub-Category', s.incident_sub_category || ''],
        ['Street No', s.street_no || '', 'Street Name', s.street_name || ''],
        ['Suburb', s.suburb || '', '', '']
      ];
      
      autoTable(doc, {
        startY: bannerY + 12,
        head: [], // Remove header
        body: callTakingRows,
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles, // Ensure header is hidden (head is empty)
        alternateRowStyles: tableConfig.alternateRowStyles,
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 40 },
          1: { cellWidth: 51 },
          2: { fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 40 },
          3: { cellWidth: 51 }
        },
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });

      // --- DISPATCHING SECTION ---
      // Calculate start Y for next section
      let nextY = (doc as any).lastAutoTable?.finalY + 10 || tableStartY + 10;
      
      // Check if we need a new page for the Dispatching Header + First Table
      const pageHeight = (doc.internal.pageSize as any).height || (doc.internal.pageSize as any).getHeight?.();
      const footerHeight = 30; // approx
      if (nextY + 40 > pageHeight - footerHeight) {
        doc.addPage();
        nextY = tableStartY;
      }

      // Dispatching Header
      doc.setFillColor(17, 119, 187);
      doc.rect(5, nextY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text('Incident Call Dispatching', 14, nextY + 5);
      doc.setTextColor(0, 0, 0);
      
      const dispatchTableStart = nextY + 12;
      
      // ... (Rest of Dispatching Logic)
      const normalizeStations = (raw: any): any[] => {
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object') {
              if (Array.isArray((parsed as any).stations)) return (parsed as any).stations;
              if (Array.isArray((parsed as any).items)) return (parsed as any).items;
            }
          } catch {}
        }
        if (raw && typeof raw === 'object') {
          if (Array.isArray((raw as any).stations)) return (raw as any).stations;
          if (Array.isArray((raw as any).items)) return (raw as any).items;
        }
        return [];
      };
      const rawDispatched = (dispatching as any)?.dispatched_stations;
      const dispatchedList = normalizeStations(rawDispatched);
      let jsonString = '';
      try {
        if (typeof rawDispatched === 'string') {
          try {
            const parsed = JSON.parse(rawDispatched);
            jsonString = JSON.stringify(parsed, null, 2);
          } catch {
            jsonString = rawDispatched;
          }
        } else if (rawDispatched && typeof rawDispatched === 'object') {
          jsonString = JSON.stringify(rawDispatched, null, 2);
        } else {
          jsonString = JSON.stringify(dispatchedList, null, 2);
        }
      } catch {
        jsonString = '[]';
      }
      
      const localDispatchFormRaw = localStorage.getItem(`vfh_dispatching_form:${inc}`);
      let localDispatchForm: any = {};
      try {
        if (localDispatchFormRaw) {
          const parsed = JSON.parse(localDispatchFormRaw);
          if (parsed && typeof parsed === 'object') localDispatchForm = parsed;
        }
      } catch {}
      const firstNonEmpty = (...vals: any[]) => {
        for (const v of vals) {
          if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
        }
        return '';
      };
      let dispatcherName = firstNonEmpty((dispatching as any)?.dispatcher_name, (dispatching as any)?.dispatcher_id, localDispatchForm.dispatcher);
      if (dispatcherName && /^\d+$/.test(dispatcherName)) {
        try {
          const { data: staff } = await supabase
            .from('02_admin_staff_1_registration')
            .select('first_name, middle_name, last_name')
            .eq('staff_id', dispatcherName)
            .single();
          if (staff) {
            const full = [staff.first_name, staff.middle_name, staff.last_name].filter(Boolean).join(' ').trim();
            if (full) dispatcherName = full;
          }
        } catch {}
      }
      
      const shiftText = firstNonEmpty((dispatching as any)?.shift_on_duty, localDispatchForm.shiftOnDuty, s.shift);
      const dateText = firstNonEmpty((dispatching as any)?.dispatch_date, localDispatchForm.dispatchDate);
      const timeText = firstNonEmpty((dispatching as any)?.dispatch_time, localDispatchForm.dispatchTime);
      
      const metaRows: string[][] = [
        ['Shift on Duty', shiftText || '', 'Dispatcher', dispatcherName || ''],
        ['Dispatch Date', dateText || '', 'Dispatch Time', timeText || '']
      ];
      
      try {
        autoTable(doc, {
          startY: dispatchTableStart,
          head: [], // Remove header
          body: metaRows,
          styles: tableConfig.styles,
          headStyles: tableConfig.headStyles, // Ensure header is hidden (head is empty)
          alternateRowStyles: tableConfig.alternateRowStyles,
          columnStyles: {
            0: { fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 40 },
            1: { cellWidth: 51 },
            2: { fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 40 },
            3: { cellWidth: 51 }
          },
          margin: tableConfig.margin,
          tableWidth: tableConfig.tableWidth,
          didDrawPage: tableConfig.didDrawPage
        });
      } catch (e) {
        console.error('Error drawing dispatch details table', e);
      }
      
      let dispatchTableStartY = (((doc as any).lastAutoTable?.finalY) || dispatchTableStart) + 6;
      
      let tableStations = Array.isArray(rawDispatched) ? rawDispatched : dispatchedList;
      if (!Array.isArray(tableStations) || tableStations.length === 0) {
        try {
          const localKey = `vfh_dispatched_stations:${inc}`;
          const saved = localStorage.getItem(localKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) tableStations = parsed;
          }
        } catch {}
      }
      
      const dispatchRows: string[][] = [];
      for (let i = 0; i < tableStations.length; i += 2) {
        const d1 = tableStations[i];
        const d2 = tableStations[i+1];
        dispatchRows.push([
          String(d1?.station_name || d1?.name || ''),
          String(d1?.dispatched_time || d1?.time || ''),
          d2 ? String(d2?.station_name || d2?.name || '') : '',
          d2 ? String(d2?.dispatched_time || d2?.time || '') : ''
        ]);
      }

      autoTable(doc, {
        startY: dispatchTableStartY,
        head: [], // Remove header
        body: dispatchRows.length > 0 ? dispatchRows : [['', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles, // Ensure header is hidden (head is empty)
        alternateRowStyles: tableConfig.alternateRowStyles,
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 40 },
          1: { cellWidth: 51 },
          2: { fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 40 },
          3: { cellWidth: 51 }
        },
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      let respondingStartY = (doc as any).lastAutoTable?.finalY + 10 || tableStartY;
      
      // Check if we need a new page for Responding Vehicles
      if (respondingStartY + 40 > pageHeight - footerHeight) {
        doc.addPage();
        respondingStartY = tableStartY;
      }
      
      doc.setFillColor(17, 119, 187);
      doc.rect(5, respondingStartY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Responding Vehicles', 14, respondingStartY + 5);
      doc.setTextColor(0, 0, 0);

      let respondingList = Array.isArray(responding?.responding_vehicles) ? responding.responding_vehicles : [];
      if (respondingList.length === 0) {
        try {
          const saved = localStorage.getItem(`vfh_responding_vehicles:${inc}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) respondingList = parsed;
          }
        } catch {}
      }

      const respondingRows: string[][] = [];
      for (let i = 0; i < respondingList.length; i += 2) {
        const r1 = respondingList[i];
        const r2 = respondingList[i+1];

        const formatDetails = (r: any) => {
          if (!r) return '';
          const station = r.station_name || r.station || '';
          let time = r.arrival_time || r.time || '';
          const incidentDate = s.incident_date || localStorage.getItem('vfh_current_incident_date') || '';
          if (time && time.length < 12 && incidentDate) {
             time = `${incidentDate} ${time}`;
          }
          return `From ${station} — At ${time}`;
        };

        respondingRows.push([
          String(r1?.vehicle_call_sign || r1?.call_sign || r1?.vehicle_value || ''),
          formatDetails(r1),
          r2 ? String(r2?.vehicle_call_sign || r2?.call_sign || r2?.vehicle_value || '') : '',
          r2 ? formatDetails(r2) : ''
        ]);
      }
      autoTable(doc, {
        startY: respondingStartY + 12,
        head: [], // Remove header
        body: respondingRows.length > 0 ? respondingRows : [['', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles, // Ensure header is hidden (head is empty)
        alternateRowStyles: tableConfig.alternateRowStyles,
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 40 },
          1: { cellWidth: 51 },
          2: { fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 40 },
          3: { cellWidth: 51 }
        },
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      // --- INCIDENT NARRATIVE SECTION ---
      // Fallback to localStorage if DB data is missing
      const n = narrative || (() => {
        try {
          const msgsStr = localStorage.getItem(`vfh_incident_narrative:${inc}`);
          const oicStr = localStorage.getItem(`vfh_incident_narrative_oic:${inc}`);
          if (msgsStr || oicStr) {
            return {
              messages: msgsStr ? JSON.parse(msgsStr) : [],
              oic_name: oicStr || ''
            };
          }
        } catch {}
        return {};
      })();

      doc.addPage();
      const narrativeBannerY = tableStartY - 6;
      doc.setFillColor(17, 119, 187);
      doc.rect(5, narrativeBannerY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Incident Narrative', 14, narrativeBannerY + 5);
      doc.setTextColor(0, 0, 0);

      const narrativeMsgs = Array.isArray(n?.messages) ? n.messages : [];
      const narrativeRows = narrativeMsgs.map((m: any) => [
        String(m?.time || ''),
        String(m?.oic || n?.oic_name || ''),
        String(m?.text || '')
      ]);
      autoTable(doc, {
        startY: narrativeBannerY + 12,
        head: [['Time', 'OIC', 'Message']],
        body: narrativeRows.length > 0 ? narrativeRows : [['', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 45 }
        },
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      const casualtiesBannerY = tableStartY - 6;
      doc.setFillColor(17, 119, 187);
      doc.rect(5, casualtiesBannerY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Casualties & Fatalities', 14, casualtiesBannerY + 5);
      doc.setTextColor(0, 0, 0);

      const casualtyEntries = Array.isArray(casualties?.entries) ? casualties.entries : [];
      // Fallback to localStorage if DB data is missing
      let finalCasualtyRows = casualtyEntries;
      if (finalCasualtyRows.length === 0) {
        try {
          const saved = localStorage.getItem(`vfh_casualties:${inc}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) finalCasualtyRows = parsed;
          }
        } catch {}
      }

      const casualtyRows = finalCasualtyRows.map((c: any) => [
        String(c?.type || ''),
        String(c?.gender || ''),
        String(c?.ageGroup || ''),
        String(c?.description || '')
      ]);
      autoTable(doc, {
        startY: casualtiesBannerY + 12,
        head: [['Type', 'Gender', 'Age Group', 'Description']],
        body: casualtyRows.length > 0 ? casualtyRows : [['', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      // Position Property Information at middle of page if space permits
      const lastY = (doc as any).lastAutoTable.finalY + 20;
      let propertyBannerY = lastY < pageHeight / 2 ? pageHeight / 2 : lastY;
      
      // Ensure we don't overflow
      if (propertyBannerY + 60 > pageHeight) {
        doc.addPage();
        propertyBannerY = tableStartY - 6;
      }

      doc.setFillColor(17, 119, 187);
      doc.rect(5, propertyBannerY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Property Information', 14, propertyBannerY + 5);
      doc.setTextColor(0, 0, 0);

      // Fallback for Property Info
      const pInfo = propertyInfo || (() => {
        try {
          const saved = localStorage.getItem(`vfh_property_info:${inc}`);
          if (saved) {
            const p = JSON.parse(saved);
            return {
              owner_name: p.ownerName,
              owner_contact: p.ownerContact,
              occupant_name: p.occupantName,
              occupant_contact: p.occupantContact,
              legal_description: p.legalDescription,
              property_type: p.propertyType
            };
          }
        } catch {}
        return {};
      })();

      // Fallback for Property Items
      let pItems = propertyItems;
      if (!pItems || pItems.length === 0) {
        try {
          const savedList = localStorage.getItem(`vfh_property_info_list:${inc}`);
          if (savedList) {
            const parsed = JSON.parse(savedList);
            if (Array.isArray(parsed)) {
              pItems = parsed.map((p: any) => ({
                owner_name: p.ownerName,
                owner_contact: p.ownerContact,
                occupant_name: p.occupantName,
                occupant_contact: p.occupantContact,
                legal_description: p.legalDescription,
                property_type: p.propertyType
              }));
            }
          }
        } catch {}
      }
      if (!Array.isArray(pItems)) pItems = [];

      const parentRow = [
        String(pInfo?.owner_name || ''),
        String(pInfo?.owner_contact || ''),
        String(pInfo?.occupant_name || ''),
        String(pInfo?.occupant_contact || ''),
        String(pInfo?.legal_description || ''),
        String(pInfo?.property_type || '')
      ];

      const hasParentData = parentRow.some(cell => cell.trim() !== '');

      const itemRows = pItems.map((p: any) => [
        String(p?.owner_name || ''),
        String(p?.owner_contact || ''),
        String(p?.occupant_name || ''),
        String(p?.occupant_contact || ''),
        String(p?.legal_description || ''),
        String(p?.property_type || '')
      ]);

      let finalPropertyBody = [];
      if (hasParentData) {
        finalPropertyBody.push(parentRow);
      }
      finalPropertyBody = [...finalPropertyBody, ...itemRows];

      // If absolutely no data, show one empty row
      if (finalPropertyBody.length === 0) {
        finalPropertyBody.push(['', '', '', '', '', '']);
      }

      autoTable(doc, {
        startY: propertyBannerY + 12,
        head: [['Owner', 'Contact', 'Occupant', 'Contact', 'Legal', 'Type']],
        body: finalPropertyBody,
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      const damageBannerY = tableStartY - 6;
      doc.setFillColor(17, 119, 187);
      doc.rect(5, damageBannerY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Damage / Loss Reporting', 14, damageBannerY + 5);
      doc.setTextColor(0, 0, 0);

      // Fallback for Damage Loss
      let dItems = damageLossItems;
      if (!dItems || dItems.length === 0) {
        try {
          // Check for main record
          const savedMain = localStorage.getItem(`vfh_damage_loss:${inc}`);
          let mainItem = null;
          if (savedMain) {
             const p = JSON.parse(savedMain);
             if (p.structureLoss || p.contentsLoss || p.otherLoss || p.salvageValue || p.possibleCause || p.areaOfOrigin) {
               mainItem = {
                 structure_loss: p.structureLoss,
                 contents_loss: p.contentsLoss,
                 other_loss: p.otherLoss,
                 salvage_value: p.salvageValue,
                 possible_cause: p.possibleCause,
                 area_of_origin: p.areaOfOrigin
               };
             }
          }

          // Check for list records
          const savedList = localStorage.getItem(`vfh_damage_loss_list:${inc}`);
          let listItems: any[] = [];
          if (savedList) {
            const parsed = JSON.parse(savedList);
            if (Array.isArray(parsed)) {
              listItems = parsed.map((p: any) => ({
                structure_loss: p.structureLoss,
                contents_loss: p.contentsLoss,
                other_loss: p.otherLoss,
                salvage_value: p.salvageValue,
                possible_cause: p.possibleCause,
                area_of_origin: p.areaOfOrigin
              }));
            }
          }
          
          dItems = [];
          if (mainItem) dItems.push(mainItem);
          if (listItems.length > 0) dItems = [...dItems, ...listItems];
        } catch {}
      }

      const damageRows = Array.isArray(dItems) ? dItems.map((d: any) => [
        String(d?.structure_loss ?? ''),
        String(d?.contents_loss ?? ''),
        String(d?.other_loss ?? ''),
        String(d?.salvage_value ?? ''),
        String(d?.possible_cause || ''),
        String(d?.area_of_origin || '')
      ]) : [];

      autoTable(doc, {
        startY: damageBannerY + 12,
        head: [['Structure', 'Contents', 'Other', 'Salvage', 'Cause', 'Origin']],
        body: damageRows.length > 0 ? damageRows : [['', '', '', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });

      // Position Equipment Used at middle of page if possible
      const lastDamageY = (doc as any).lastAutoTable.finalY + 20;
      let equipmentBannerY = lastDamageY < pageHeight / 2 ? pageHeight / 2 : lastDamageY;
      
      if (equipmentBannerY + 60 > pageHeight) {
        doc.addPage();
        equipmentBannerY = tableStartY - 6;
      }

      doc.setFillColor(17, 119, 187);
      doc.rect(5, equipmentBannerY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Equipment Used', 14, equipmentBannerY + 5);
      doc.setTextColor(0, 0, 0);

      // Fallback for Equipment Used
      let eItems = equipmentUsed;
      if (!eItems || eItems.length === 0) {
        try {
          const saved = localStorage.getItem(`vfh_equipment_used:${inc}`);
          if (saved) {
             const p = JSON.parse(saved);
             if (p.items && Array.isArray(p.items)) {
               eItems = p.items.map((it: any) => ({
                 item_name: it.name,
                 quantity: it.quantity,
                 time_used: it.timeUsed,
                 per_unit_rate: it.perUnitRate,
                 cost_of_use: it.costOfUse
               }));
             }
          }
        } catch {}
      }

      let totalCost = 0;
      const equipmentRows = Array.isArray(eItems) ? eItems.map((e: any) => {
        // Handle both DB field names and fallback names
        const name = e?.item_name || e?.equipment_name || '';
        const qty = e?.quantity || '';
        const timeUsed = e?.time_used || '';
        const rate = e?.per_unit_rate || '';
        const costVal = parseFloat(e?.cost_of_use || '0');
        if (!isNaN(costVal)) totalCost += costVal;
        const cost = e?.cost_of_use || '';
        return [String(name), String(qty), String(timeUsed), String(rate), String(cost)];
      }) : [];

      if (equipmentRows.length > 0) {
        equipmentRows.push(['', '', '', 'Total Cost', totalCost.toFixed(2)]);
      }

      autoTable(doc, {
        startY: equipmentBannerY + 12,
        head: [['Name', 'Quantity', 'Time Used', 'Per Unit Rate', 'Cost of Use']],
        body: equipmentRows.length > 0 ? equipmentRows : [['', '', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      const routeBannerY = tableStartY - 6;
      doc.setFillColor(17, 119, 187);
      doc.rect(5, routeBannerY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Incident Route Finder', 14, routeBannerY + 5);
      doc.setTextColor(0, 0, 0);

      // Fallback for Route Finder
      let rItems = routeFinder;
      if (!rItems || rItems.length === 0) {
          try {
              const saved = localStorage.getItem(`vfh_route_directions_${inc}`);
              if (saved) {
                  const p = JSON.parse(saved);
                  // transform to match DB structure
                  rItems = [{
                      address_from: p.fromAddress,
                      address_to: p.toAddress,
                      route_distance: p.routeSummary?.distance,
                      route_duration: p.routeSummary?.duration,
                      directions: p.directions
                  }];
              }
          } catch {}
      }
      if (!Array.isArray(rItems)) rItems = [];

      const routeRows = rItems.map((r: any) => [
        String(r?.address_from || ''),
        String(r?.address_to || ''),
        String(r?.route_distance || ''),
        String(r?.route_duration || '')
      ]);

      autoTable(doc, {
        startY: routeBannerY + 12,
        head: [['From', 'To', 'Distance', 'Duration']],
        body: routeRows.length > 0 ? routeRows : [['', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });

      // Add Turn-by-Turn Directions
      let lastRouteY = (doc as any).lastAutoTable.finalY + 10;
      
      rItems.forEach((route: any, index: number) => {
         let steps: any[] = [];
         // Parse directions if it's a string (JSON), otherwise use as is
         if (typeof route.directions === 'string') {
             try { steps = JSON.parse(route.directions); } catch {}
         } else if (Array.isArray(route.directions)) {
             steps = route.directions;
         }

         if (steps.length > 0) {
             if (lastRouteY + 20 > pageHeight) {
                 doc.addPage();
                 lastRouteY = tableStartY;
             }
             
             const stepRows = steps.map((s: any) => [
                 s.text || '',
                 s.distance || '',
                 s.duration || ''
             ]);

             autoTable(doc, {
                 startY: lastRouteY,
                 head: [['Instruction', 'Distance', 'Duration']],
                 body: stepRows,
                 styles: tableConfig.styles,
                 headStyles: { ...tableConfig.headStyles, fillColor: [100, 100, 100] },
                 alternateRowStyles: tableConfig.alternateRowStyles,
                 margin: tableConfig.margin,
                 tableWidth: tableConfig.tableWidth,
                 didDrawPage: tableConfig.didDrawPage
             });
             
             lastRouteY = (doc as any).lastAutoTable.finalY + 10;
         }
      });
      // ----------------------------------------------------------------------
      // NEW PAGE: Weather, Multi-Media, Lock Status (Stacked)
      // ----------------------------------------------------------------------
      doc.addPage();
      let currentY = tableStartY - 6;

      // --- 1. Weather Information ---
      doc.setFillColor(17, 119, 187);
      doc.rect(5, currentY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Weather Information', 14, currentY + 5);
      doc.setTextColor(0, 0, 0);

      // Extract Weather Data
      const getVal = (val: any) => (val === null || val === undefined) ? '' : String(val);

      const wTemp = getVal(weatherInfo?.temperature) || 
                    (weatherInfo?.weather_jsonb?.extracted?.temperature ? `${weatherInfo.weather_jsonb.extracted.temperature}°C` : '') || 
                    (weatherInfo?.weather_jsonb?.temperature_c ? `${weatherInfo.weather_jsonb.temperature_c}°C` : '') || '';
      
      const wRisk = getVal(weatherInfo?.fire_risk_index) || 
                    getVal(weatherInfo?.weather_jsonb?.extracted?.fire_risk_index) || 
                    getVal(weatherInfo?.weather_jsonb?.fire_risk_level) || '';
      
      const wAir = getVal(weatherInfo?.air_quality_index) || 
                   getVal(weatherInfo?.weather_jsonb?.extracted?.air_quality_index) || 
                   (weatherInfo?.weather_jsonb?.wind_speed ? `Wind: ${weatherInfo.weather_jsonb.wind_speed}` : '') || '';
      
      const wPollutants = getVal(weatherInfo?.pollutants_forecast) || 
                          getVal(weatherInfo?.weather_jsonb?.extracted?.pollutants) || '';

      const weatherRows = [
          [wTemp, wRisk, wAir, wPollutants]
      ];

      autoTable(doc, {
        startY: currentY + 12,
        head: [['Temperature', 'Fire Risk', 'Air Quality', 'Pollutants']],
        body: weatherRows,
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' }
        },
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });

      currentY = (doc as any).lastAutoTable.finalY + 20;

      // --- 2. Multi-Media Files ---
      if (currentY + 60 > pageHeight) {
        doc.addPage();
        currentY = tableStartY - 6;
      }

      doc.setFillColor(17, 119, 187);
      doc.rect(5, currentY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Multi-Media Files', 14, currentY + 5);
      doc.setTextColor(0, 0, 0);

      const mediaRows = mediaFiles.map((m: any) => [
        String(m?.file_name || ''),
        String(m?.uploaded_at ? new Date(m.uploaded_at).toLocaleString() : '')
      ]);
      
      autoTable(doc, {
        startY: currentY + 12,
        head: [['File Name', 'Uploaded At']],
        body: mediaRows.length > 0 ? mediaRows : [['No files found', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });

      currentY = (doc as any).lastAutoTable.finalY + 20;

      // --- 3. Record Lock Status ---
      if (currentY + 60 > pageHeight) {
        doc.addPage();
        currentY = tableStartY - 6;
      }

      doc.setFillColor(17, 119, 187);
      doc.rect(5, currentY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Record Lock Status', 14, currentY + 5);
      doc.setTextColor(0, 0, 0);

      // Helper to merge DB data with local storage fallback
      const getLockField = (field: keyof any, localField: string) => {
         // 1. Try DB
         if (lockStatus && (lockStatus as any)[field]) return (lockStatus as any)[field];
         
         // 2. Try Local Storage
         try {
           const local = localStorage.getItem(`vfh_lock_status_${inc}`);
           if (local) {
             const p = JSON.parse(local);
             return p[localField];
           }
         } catch {}
         return null;
      };

      const dispBy = getLockField('dispatcher_confirmed_by', 'dispatcherBy');
      const dispAt = getLockField('dispatcher_confirmed_at', 'dispatcherAt');
      const oicBy = getLockField('oic_confirmed_by', 'oicBy');
      const oicAt = getLockField('oic_confirmed_at', 'oicAt');
      const admBy = getLockField('admin_confirmed_by', 'adminBy');
      const admAt = getLockField('admin_confirmed_at', 'adminAt');

      const lockRows = [
        ['Dispatcher', String(dispBy || ''), String(dispAt ? new Date(dispAt).toLocaleString() : '')],
        ['OIC', String(oicBy || ''), String(oicAt ? new Date(oicAt).toLocaleString() : '')],
        ['Admin', String(admBy || ''), String(admAt ? new Date(admAt).toLocaleString() : '')]
      ];

      autoTable(doc, {
        startY: currentY + 12,
        head: [['Role', 'Confirmed By', 'Confirmed At']],
        body: lockRows,
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      // cleanupTrailingBlankPages(doc);
      try {
        const total = doc.getNumberOfPages();
        for (let p = 1; p <= total; p++) {
          (doc as any).setPage(p);
          const info = (doc as any).getCurrentPageInfo?.();
          const pageNumber = info?.pageNumber || p;
          
          // Ensure header and logo are present on all pages (except page 1 which already has them from setup)
          if (pageNumber > 1) {
             if (logoBase64) {
               addStandardizedLogo({ logoBase64, doc });
             }
             addStandardizedHeader({
               doc,
               data: {
                departmentName: 'King Fahd International Airport',
                departmentType: 'Airport Rescue & Fire Fighting Services',
                reportTitle: `Incident Report: ${inc}`,
                summaryText,
                currentUser
               }
             });
          }

          createStandardizedFooter({
            doc,
            data: {
              departmentName: 'King Fahd International Airport',
              departmentType: 'Airport Rescue & Fire Fighting Services',
              reportTitle: `Incident Report: ${inc}`,
              summaryText,
              currentUser
            },
            pageData: { pageNumber },
            totalPages: total,
            renderPageNumber: false
          });
        }
      } catch {}
      applyFinalPageNumbers(doc, {
        departmentName: 'King Fahd International Airport',
        departmentType: 'Airport Rescue & Fire Fighting Services',
        reportTitle: `Incident Report: ${inc}`,
        summaryText,
        currentUser
      });
      const timestamp = formatDateTime(new Date()).replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `pdf_incident_${inc}_${timestamp}`;
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      try {
        sessionStorage.setItem(fileName, blobUrl);
        sessionStorage.setItem('pdf_source_section', '/control/emergency-incident-logging');
        sessionStorage.setItem('pdf_source_path', '/control/emergency-incident-logging/report');
        const encodedFileName = encodeURIComponent(fileName);
        navigate(`/pdf-viewer/${encodedFileName}`);
      } catch (storageErr: any) {
        sessionStorage.setItem('pdf_source_section', '/control/emergency-incident-logging');
        sessionStorage.setItem('pdf_source_path', '/control/emergency-incident-logging/report');
        const encodedBlobUrl = encodeURIComponent(blobUrl);
        navigate(`/pdf-viewer/${encodedBlobUrl}`);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate incident PDF.');
    } finally {
      setGenerating(false);
    }
  };
  return (
    <MainContent aria-label="Main content">
      <Section aria-labelledby="incident-report-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="incident-report-title">Incident Report</Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                Review and finalize the overall incident report. The incident number is shown for context.
              </Paragraph>
            </Column>
            <ImageColumn>
              {imageLoading ? (
                <ImagePlaceholder>Loading image...</ImagePlaceholder>
              ) : imageUrl ? (
                <HeaderImage src={imageUrl} alt="Incident Report" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/ControlRoom.png'; }} />
              ) : (
                <ImagePlaceholder>No image available</ImagePlaceholder>
              )}
            </ImageColumn>
          </FlexRow>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Input type="text" value={incidentNumber} readOnly placeholder="yyyy-mm-dd hh:mm 00001" style={{ width: '24ch', fontWeight: 'bold', color: '#dc3545' }} />
          </div>
        </div>
      </Section>
      <ButtonRow>
        <ActionButton onClick={generateIncidentPDF} disabled={!incidentNumber || generating}>{generating ? 'Generating PDF...' : 'Generate Incident PDF'}</ActionButton>
        <ActionButton onClick={() => navigate('/control/emergency-incident-reports')}>Save & Continue to Incident Reports</ActionButton>
      </ButtonRow>
      {error && (
        <div style={{ marginTop: '12px', color: '#dc3545', fontWeight: 600 }}>
          {error}
        </div>
      )}
    </MainContent>
  );
};
