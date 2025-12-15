import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePageImage } from '../../hooks/usePageImage';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { setupVFH_A4_P, cleanupTrailingBlankPages, applyFinalPageNumbers, createStandardizedFooter } from '../../utils/pdfReportHelper';
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
        getSingle('03_ecc_03_10_Weather_Information'),
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
      const mountContainer = document.createElement('div');
      mountContainer.style.position = 'fixed';
      mountContainer.style.left = '-10000px';
      mountContainer.style.top = '0';
      mountContainer.style.width = '1100px';
      mountContainer.style.zIndex = '-1';
      mountContainer.style.opacity = '0';
      mountContainer.style.background = '#ffffff';
      document.body.appendChild(mountContainer);
      const localFormRaw = localStorage.getItem('vfh_call_taking_form');
      let localForm: any = {};
      try {
        if (localFormRaw) {
          const parsed = JSON.parse(localFormRaw);
          if (parsed && typeof parsed === 'object') localForm = parsed;
        }
      } catch {}
      const first = (...vals: any[]) => {
        for (const v of vals) {
          if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
        }
        return '';
      };
      const s = {
        shift: first(callTaking?.shift_on_duty, localForm.shiftOnDuty),
        call_taker: first(callTaking?.call_taker_id, localForm.callTaker),
        incident_date: first(callTaking?.incident_date, localForm.incidentDate),
        incident_time: first(callTaking?.incident_time, localForm.incidentTime),
        caller_name: first(callTaking?.caller_name, localForm.callName, localForm.callerName),
        caller_number: first(callTaking?.caller_number, localForm.callerNumber, localForm.callerPhone),
        second_caller: first((callTaking as any)?.second_caller_name, localForm.secondCaller),
        second_caller_number: first((callTaking as any)?.second_caller_number, localForm.secondCallerNumber),
        incident_category: first((callTaking as any)?.incident_category, localForm.incidentCategory),
        incident_sub_category: first((callTaking as any)?.incident_sub_category, localForm.incidentSubCategory),
        street_no: first(callTaking?.street_no, localForm.streetNo),
        street_name: first(callTaking?.street_name, localForm.streetName),
        suburb: first(callTaking?.suburb, localForm.suburb)
      };
      if (s.call_taker && /^\d+$/.test(s.call_taker)) {
        try {
          const { data: staff } = await supabase
            .from('02_admin_staff_1_registration')
            .select('first_name, middle_name, last_name')
            .eq('staff_id', s.call_taker)
            .single();
          if (staff) {
            const full = [staff.first_name, staff.middle_name, staff.last_name].filter(Boolean).join(' ').trim();
            if (full) s.call_taker = full;
          }
        } catch {}
      }
      const shiftMap: Record<string, string> = { Blue: 'Blue Shift', Green: 'Green Shift', Red: 'Red Shift' };
      if (shiftMap[s.shift]) {
        s.shift = shiftMap[s.shift];
      }
      const html = `
        <div id="callTakingScreenshot" style="padding: 8px; background: #ffffff; font-family: Arial, sans-serif;">
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div>
              <div style="font-size:12px; font-weight:600;">Shift on Duty *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.shift || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">Call Taker *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.call_taker || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">Incident Date *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.incident_date || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">Incident Time *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.incident_time || ''}</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div>
              <div style="font-size:12px; font-weight:600;">Caller Name *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.caller_name || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">Caller Number *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.caller_number || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">2nd Caller</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.second_caller || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">2nd Caller Number</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.second_caller_number || ''}</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div>
              <div style="font-size:12px; font-weight:600;">Incident Category *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.incident_category || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">Incident Sub-Category</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.incident_sub_category || ''}</div>
            </div>
            <div></div><div></div>
          </div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div>
              <div style="font-size:12px; font-weight:600;">Street No</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.street_no || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">Street Name *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.street_name || ''}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:600;">Suburb *</div>
              <div style="border:1px solid #ced4da; border-radius:4px; padding:8px; height:34px; display:flex; align-items:center;">${s.suburb || ''}</div>
            </div>
            <div></div>
          </div>
        </div>
      `;
      mountContainer.innerHTML = html;
      const sectionEl = mountContainer.querySelector('#callTakingScreenshot') as HTMLElement | null;
      if (sectionEl) {
        const canvas = await html2canvas(sectionEl, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = (doc as any).getImageProperties ? (doc as any).getImageProperties(imgData) : { width: canvas.width, height: canvas.height };
        const availableWidth = pageWidth - 20;
        let imgHeight = availableWidth * (imgProps.height / imgProps.width);
        const pageHeight = (doc.internal.pageSize as any).height || (doc.internal.pageSize as any).getHeight?.();
        const footerHeight = 24;
        const reserveForSecondBanner = 8 + 6;
        const maxHeight = pageHeight - (bannerY + 12) - footerHeight - reserveForSecondBanner;
        if (imgHeight > maxHeight) {
          const scale = maxHeight / imgHeight;
          imgHeight = imgHeight * scale;
        }
        doc.addImage(imgData, 'PNG', 10, bannerY + 12, availableWidth, imgHeight);
        const info = (doc as any).getCurrentPageInfo?.();
        const currentPage = info?.pageNumber || 1;
        const totalPagesNow = doc.getNumberOfPages();
        createStandardizedFooter({
          doc,
          data: {
            departmentName: 'King Fahd International Airport',
            departmentType: 'Airport Rescue & Fire Fighting Services',
            reportTitle: `Incident Report: ${inc}`,
            summaryText,
            currentUser
          },
          pageData: { pageNumber: currentPage },
          totalPages: totalPagesNow,
          renderPageNumber: false
        });
        const secondBannerY = bannerY + 12 + imgHeight + 6;
        if (secondBannerY + 8 <= pageHeight - footerHeight - 2) {
          doc.setFillColor(17, 119, 187);
          doc.rect(5, secondBannerY, pageWidth - 10, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(14);
          doc.text('Incident Call Taking', 14, secondBannerY + 5);
          doc.setTextColor(0, 0, 0);
        }
      }
      document.body.removeChild(mountContainer);
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Incident Call Dispatching', 14, tableStartY - 6);
      let dispatchTableStartY = tableStartY;
      const dispBannerY = tableStartY - 6;
      doc.setFillColor(17, 119, 187);
      doc.rect(5, dispBannerY, pageWidth - 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text('Dispatched Stations', 14, dispBannerY + 5);
      doc.setTextColor(0, 0, 0);
      try {
        const dispMount = document.createElement('div');
        dispMount.style.position = 'fixed';
        dispMount.style.left = '-10000px';
        dispMount.style.top = '0';
        dispMount.style.width = '1100px';
        dispMount.style.zIndex = '-1';
        dispMount.style.opacity = '1';
        dispMount.style.background = '#ffffff';
        document.body.appendChild(dispMount);
        let dispatchedStations = Array.isArray(dispatching?.dispatched_stations) ? dispatching.dispatched_stations : [];
        if (!Array.isArray(dispatchedStations) || dispatchedStations.length === 0) {
          try {
            const localKey = `vfh_dispatched_stations:${inc}`;
            const saved = localStorage.getItem(localKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                dispatchedStations = parsed.map((d: any) => ({
                  station_id: String(d?.id || ''),
                  station_name: String(d?.name || ''),
                  dispatched_time: String(d?.time || ''),
                  vehicle_call_sign: String((d as any)?.vehicle || '')
                }));
              }
            }
          } catch {}
        }
        const listHtml = dispatchedStations.length === 0
          ? `<p style="color:#666;margin:0;">No stations dispatched yet.</p>`
          : `<ul style="display:grid; grid-template-columns:repeat(2,1fr); gap:12px; padding:0; margin:0; font-family:Arial,sans-serif;">
               ${dispatchedStations.map((d: any) => {
                 const name = String(d?.station_name || d?.name || '');
                 const time = String(d?.dispatched_time || d?.time || '');
                 const vehicle = String(d?.vehicle_call_sign || (d as any)?.vehicle || '');
                 const details = [
                   vehicle ? ('Vehicle: ' + vehicle) : '',
                   time ? ('Dispatched at ' + time) : ''
                 ].filter(Boolean).join(' &mdash; ');
                 return '<li style="'
                           + 'list-style:none;'
                           + 'padding:8px;'
                           + 'border:1px solid #eee;'
                           + 'border-radius:6px;'
                           + 'display:flex;'
                           + 'align-items:flex-start;'
                           + 'gap:12px;'
                         + '">'
                           + '<button type="button" disabled style="'
                             + 'padding:10px 18px;'
                             + 'border:none;'
                             + 'border-radius:6px;'
                             + 'font-weight:bold;'
                             + 'font-size:14px;'
                             + 'background-color:#6c757d;'
                             + 'color:white;'
                             + 'opacity:0.6;'
                             + 'cursor:not-allowed;'
                           + '">Remove</button>'
                           + '<div style="line-height:1.35;">'
                             + '<div style="font-weight:600;">' + name + '</div>'
                             + '<div style="color:#555;">' + details + '</div>'
                           + '</div>'
                         + '</li>';
               }).join('')}
             </ul>`;
        const dispHtml = `
          <div id="dispatchedStationsScreenshot" style="padding:8px; background:#ffffff; font-family:Arial,sans-serif;">
            ${listHtml}
          </div>
        `;
        dispMount.innerHTML = dispHtml;
        const dispEl = dispMount.querySelector('#dispatchedStationsScreenshot') as HTMLElement | null;
        if (dispEl) {
          const canvas = await html2canvas(dispEl, { scale: 2, backgroundColor: '#ffffff' });
          const imgData = canvas.toDataURL('image/png');
          const imgProps = (doc as any).getImageProperties ? (doc as any).getImageProperties(imgData) : { width: canvas.width, height: canvas.height };
          const availableWidth = pageWidth - 20;
          let dispImgHeight = availableWidth * (imgProps.height / imgProps.width);
          const pageHeight = (doc.internal.pageSize as any).height || (doc.internal.pageSize as any).getHeight?.();
          const footerHeight = 24;
          const maxHeight = pageHeight - (dispBannerY + 12) - footerHeight - 4;
          if (dispImgHeight > maxHeight) {
            const scale = maxHeight / dispImgHeight;
            dispImgHeight = dispImgHeight * scale;
          }
          doc.addImage(imgData, 'PNG', 10, dispBannerY + 12, availableWidth, dispImgHeight);
          doc.setTextColor(0, 0, 0);
          dispatchTableStartY = Math.max(tableStartY, dispBannerY + 12 + dispImgHeight + 8);
        }
        document.body.removeChild(dispMount);
      } catch {}
      const dispatchedStations = Array.isArray(dispatching?.dispatched_stations) ? dispatching.dispatched_stations : [];
      const dispatchRows = dispatchedStations.map((d: any) => [
        String(d?.station_name || d?.name || ''),
        String(d?.dispatched_time || d?.time || ''),
        String(d?.vehicle_call_sign || d?.call_sign || '')
      ]);
      autoTable(doc, {
        startY: dispatchTableStartY,
        head: [['Station', 'Time', 'Vehicle']],
        body: dispatchRows.length > 0 ? dispatchRows : [['', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Responding Resources', 14, tableStartY - 6);
      const respondingList = Array.isArray(responding?.responding_vehicles) ? responding.responding_vehicles : [];
      const respondingRows = respondingList.map((r: any) => [
        String(r?.vehicle_call_sign || r?.call_sign || ''),
        String(r?.crew || ''),
        String(r?.arrival_time || ''),
        String(r?.status || '')
      ]);
      autoTable(doc, {
        startY: tableStartY,
        head: [['Vehicle', 'Crew', 'Arrival', 'Status']],
        body: respondingRows.length > 0 ? respondingRows : [['', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Incident Narrative', 14, tableStartY - 6);
      const narrativeMsgs = Array.isArray(narrative?.messages) ? narrative.messages : [];
      const narrativeRows = narrativeMsgs.map((m: any) => [
        String(m?.time || ''),
        String(narrative?.oic_name || ''),
        String(m?.text || '')
      ]);
      autoTable(doc, {
        startY: tableStartY,
        head: [['Time', 'OIC', 'Message']],
        body: narrativeRows.length > 0 ? narrativeRows : [['', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Casualties & Fatalities', 14, tableStartY - 6);
      const casualtyEntries = Array.isArray(casualties?.entries) ? casualties.entries : [];
      const casualtyRows = casualtyEntries.map((c: any) => [
        String(c?.name || ''),
        String(c?.age || ''),
        String(c?.status || ''),
        String(c?.notes || '')
      ]);
      autoTable(doc, {
        startY: tableStartY,
        head: [['Name', 'Age', 'Status', 'Notes']],
        body: casualtyRows.length > 0 ? casualtyRows : [['', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Property Information', 14, tableStartY - 6);
      autoTable(doc, {
        startY: tableStartY,
        head: [['Owner', 'Contact', 'Occupant', 'Contact', 'Legal', 'Type']],
        body: [[
          String(propertyInfo?.owner_name || ''),
          String(propertyInfo?.owner_contact || ''),
          String(propertyInfo?.occupant_name || ''),
          String(propertyInfo?.occupant_contact || ''),
          String(propertyInfo?.legal_description || ''),
          String(propertyInfo?.property_type || '')
        ]],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      const propertyRows = propertyItems.map((p: any) => [
        String(p?.address || ''),
        String(p?.notes || ''),
        String(p?.status || '')
      ]);
      if (propertyRows.length > 0) {
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 6,
          head: [['Address', 'Notes', 'Status']],
          body: propertyRows,
          styles: tableConfig.styles,
          headStyles: tableConfig.headStyles,
          alternateRowStyles: tableConfig.alternateRowStyles,
          margin: tableConfig.margin,
          tableWidth: tableConfig.tableWidth,
          didDrawPage: tableConfig.didDrawPage
        });
      }
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Damage / Loss Reporting', 14, tableStartY - 6);
      const damageRows = damageLossItems.map((d: any) => [
        String(d?.structure_loss ?? ''),
        String(d?.contents_loss ?? ''),
        String(d?.other_loss ?? ''),
        String(d?.salvage_value ?? ''),
        String(d?.possible_cause || ''),
        String(d?.area_of_origin || '')
      ]);
      autoTable(doc, {
        startY: tableStartY,
        head: [['Structure', 'Contents', 'Other', 'Salvage', 'Cause', 'Origin']],
        body: damageRows.length > 0 ? damageRows : [['', '', '', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Equipment Used', 14, tableStartY - 6);
      const equipmentRows = equipmentUsed.map((e: any) => [
        String(e?.equipment_name || ''),
        String(e?.quantity || ''),
        String(e?.notes || '')
      ]);
      autoTable(doc, {
        startY: tableStartY,
        head: [['Equipment', 'Quantity', 'Notes']],
        body: equipmentRows.length > 0 ? equipmentRows : [['', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Incident Route Finder', 14, tableStartY - 6);
      const routeRows = routeFinder.map((r: any) => [
        String(r?.address_from || ''),
        String(r?.address_to || ''),
        String(r?.route_distance || ''),
        String(r?.route_duration || '')
      ]);
      autoTable(doc, {
        startY: tableStartY,
        head: [['From', 'To', 'Distance', 'Duration']],
        body: routeRows.length > 0 ? routeRows : [['', '', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Weather Information', 14, tableStartY - 6);
      autoTable(doc, {
        startY: tableStartY,
        head: [['Temperature', 'Wind', 'Humidity', 'Conditions']],
        body: [[
          String(weatherInfo?.temperature || ''),
          String(weatherInfo?.wind_speed || ''),
          String(weatherInfo?.humidity || ''),
          String(weatherInfo?.conditions || '')
        ]],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Multi-Media Files', 14, tableStartY - 6);
      const mediaRows = mediaFiles.map((m: any) => [
        String(m?.file_name || ''),
        String(m?.file_type || ''),
        String(m?.uploaded_at || '')
      ]);
      autoTable(doc, {
        startY: tableStartY,
        head: [['File Name', 'Type', 'Uploaded']],
        body: mediaRows.length > 0 ? mediaRows : [['', '', '']],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Record Lock Status', 14, tableStartY - 6);
      autoTable(doc, {
        startY: tableStartY,
        head: [['Dispatcher', 'Time', 'OIC', 'Time', 'Admin', 'Time']],
        body: [[
          String(lockStatus?.dispatcher_confirmed_by || ''),
          String(lockStatus?.dispatcher_confirmed_at || ''),
          String(lockStatus?.oic_confirmed_by || ''),
          String(lockStatus?.oic_confirmed_at || ''),
          String(lockStatus?.admin_confirmed_by || ''),
          String(lockStatus?.admin_confirmed_at || '')
        ]],
        styles: tableConfig.styles,
        headStyles: tableConfig.headStyles,
        alternateRowStyles: tableConfig.alternateRowStyles,
        margin: tableConfig.margin,
        tableWidth: tableConfig.tableWidth,
        didDrawPage: tableConfig.didDrawPage
      });
      cleanupTrailingBlankPages(doc);
      try {
        const total = doc.getNumberOfPages();
        for (let p = 1; p <= total; p++) {
          (doc as any).setPage(p);
          const info = (doc as any).getCurrentPageInfo?.();
          const pageNumber = info?.pageNumber || p;
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
