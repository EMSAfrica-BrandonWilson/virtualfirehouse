import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const MainContent = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Column = styled.div<{ $width?: string }>`
  width: ${props => props.$width || '48%'};
  vertical-align: top;
  text-align: left;
  
  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const ImageColumn = styled.div`
  width: 240px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    width: 100% !important;
    justify-content: center;
    margin-top: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
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
`;

const HeaderImage = styled.img`
  width: 224px;
  height: auto;
  max-width: 224px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const sections = [
  { name: 'Building Maintenance', slug: 'building-maintenance' },
  { name: 'Equipment Maintenance', slug: 'equipment-maintenance' },
  { name: 'PPE Maintenance', slug: 'ppe-maintenance' },
  { name: 'Vehicle Maintenance', slug: 'vehicle-maintenance' },
];

const contentMap: Record<string, {
  top: string,
  col1h: string,
  col1t: string,
  col2h: string,
  col2t: string,
  bottomh: string,
  bottomt: string
}> = {
  '': {
    top: 'The Maintenance and Repairs division ensures operational readiness of equipment, vehicles, and facilities through preventive maintenance, repair services, and asset management.',
    col1h: 'Equipment Maintenance and',
    col1t: 'We conduct inspections, testing, calibrations, and performance evaluations following manufacturer specifications, documenting all work for reliability tracking.',
    col2h: 'Fleet Management',
    col2t: 'Fleet management includes vehicle servicing, fuel management, parts inventory, readiness monitoring, and lifecycle planning.',
    bottomh: 'Infrastructure Maintenance and Asset Management',
    bottomt: 'We manage stations and support infrastructure through inspections and preventive maintenance, tracking lifecycles, costs, and replacements.'
  },
  'building-maintenance': {
    top: 'Building maintenance sustains safe, functional, and compliant facilities for operations and training. Programs combine preventive, corrective, and predictive tasks aligned to risk and use. Clear work orders and service windows minimize disruption. Documentation supports audits, lifecycle planning, and improvement initiatives. Collaboration with users ensures priorities reflect mission needs.',
    col1h: 'Preventive Programs',
    col1t: 'Scheduled inspections and condition-based tasks reduce failures and hazards. Checklists standardize evaluations of egress, lighting, fire doors, and utilities. Seasonal tasks prepare systems for temperature and weather impacts. Findings drive targeted repairs and timely parts procurement. Trend monitoring informs adjustments to intervals and scope.',
    col2h: 'Repairs and Upgrades',
    col2t: 'Timely repairs and modernization projects improve reliability and capacity. Scope includes HVAC performance, structural elements, and access control. Upgrades address energy efficiency and user comfort goals. Contractor oversight ensures quality and safe site practices. Post-work verification confirms performance against specifications.',
    bottomh: 'Facilities Monitoring',
    bottomt: 'Monitoring systems and records support continuous improvement and compliance. Dashboards track request volumes, closure times, and repeat issues. Compliance logs document safety checkpoints and corrective actions. Reviews identify patterns for proactive interventions. Shared visibility aligns stakeholders and strengthens planning.'
  },
  'equipment-maintenance': {
    top: 'Equipment maintenance keeps critical tools and systems ready for response. Schedules blend manufacturer intervals with local risk profiles. Testing confirms performance of rescue, suppression, and medical devices. Storage and environmental controls protect sensitive components. Spare strategies reduce downtime for frontline operations.',
    col1h: 'Inspection & Testing',
    col1t: 'Regular checks verify function, wear, and cleanliness standards. Test procedures validate flow rates, pressure, battery health, and calibration. Defects are documented with immediate remediation steps. Acceptance tests follow acquisitions and major repairs. Peer reviews encourage consistency and shared learning.',
    col2h: 'Documentation & Tracking',
    col2t: 'Records capture work history, parts use, and service outcomes. Asset tracking links serials, locations, and condition notes. Alerts prompt upcoming maintenance and end-of-life decisions. Dashboards visualize readiness across equipment classes. Data informs budgeting and lifecycle replacement planning.',
    bottomh: 'Calibration & Certification',
    bottomt: 'Calibration and certifications maintain accuracy and legal compliance. Accredited services validate critical instruments and devices. Certificates are stored and linked to inspection schedules. Audit readiness includes traceability and current status. Training reinforces correct use to sustain calibrated performance.'
  },
  'ppe-maintenance': {
    top: 'PPE maintenance ensures protective equipment is safe, clean, and effective. Inspection programs identify damage, contamination, or performance loss. Cleaning protocols follow manufacturer guidance to preserve integrity. Storage conditions prevent UV, heat, and chemical degradation. Training reinforces handling practices that extend service life.',
    col1h: 'Inspection & Care',
    col1t: 'Periodic inspections assess shells, closures, reflectives, and liners. Care routines include drying, decon, and packaging methods. Findings trigger repair, replacement, or service center referrals. Traceable labels support accountability and user awareness. Communication ensures timely pull and replacement actions.',
    col2h: 'Replacement Cycles',
    col2t: 'Lifecycle plans define replacement timelines by use and standards. Tracking links PPE sets to users, incidents, and maintenance events. Budgeting aligns with forecasted retirements and surges. Vendor partnerships improve turnaround and quality. Reviews update cycles based on wear patterns and incident types.',
    bottomh: 'Standards & Fit',
    bottomt: 'Compliance verifies standards for heat, impact, and chemical resistance. Fit testing confirms seal, mobility, and comfort under loads. Training covers donning, doffing, and compatibility across tools. Documentation supports audits and continuous improvement. Feedback loops refine selections for operational needs.'
  },
  'vehicle-maintenance': {
    top: 'Vehicle maintenance sustains ARFF, rescue, and support fleet readiness. Preventive services address fluids, filters, and wear components. Diagnostics and road tests confirm performance under operational loads. Readiness monitoring catches faults early for timely repairs. Records support compliance and efficient fleet management.',
    col1h: 'Preventive Services',
    col1t: 'Scheduled services follow manufacturer intervals tuned to local demands. Inspections check brakes, steering, suspension, pumps, and PTO systems. Tire health and alignment protect stability and handling. Electrical systems are verified for charging and accessory loads. Cleanliness and organization facilitate inspections and repairs.',
    col2h: 'Readiness Monitoring',
    col2t: 'Readiness checks validate lights, sirens, communications, and safety gear. Fault reporting triggers work orders with priority levels. Telematics and logs provide early insight into performance issues. Water and foam systems are flow-tested for ARFF readiness. Benchmarks track fleet availability and reliability.',
    bottomh: 'Lifecycle & Replacement',
    bottomt: 'Lifecycle planning manages upgrades and replacements for critical apparatus. Total cost of ownership guides decisions on refurbishment or replacement. Specifications and trials ensure new units meet mission needs. Training accompanies new deliveries for safe, effective operation. Documentation preserves history and informs future purchases.'
  }
};

export const MaintenanceLanding: React.FC = () => {
  const params = useParams();
  const activeSlug = params.section || '';
  const activeSection = sections.find(s => s.slug === activeSlug);
  const c = contentMap[activeSlug] || contentMap[''];
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="maintenance-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="maintenance-title">
                {activeSection ? activeSection.name : 'Maintenance and Repairs'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                {activeSection ? (
                  c.top
                ) : (
                  <>The Maintenance and Repairs division ensures operational readiness of all emergency equipment, vehicles, and facilities at King Fahd International Airport through comprehensive preventive maintenance, repair services, and fleet management. Our operations cover equipment servicing, fleet management, facility maintenance, and asset management with rigorous schedules and quality standards ensuring maximum reliability and availability.</>
                )}
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/Repairs.jpeg" alt="Maintenance and Repairs" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      <Section aria-labelledby="equipment-management">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="equipment-management">
              {activeSection ? c.col1h : 'Equipment Maintenance and Repairs '}
            </SubTitle>
            <Paragraph>
              {activeSection ? c.col1t : 'Our program covers all emergency apparatus including aircraft rescue vehicles, hazmat units, rescue equipment, and medical devices. Following manufacturer specifications, we conduct regular inspections, testing, calibrations, and performance evaluations. Emergency equipment receives priority maintenance with full documentation for compliance and reliability tracking.'}
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              {activeSection ? c.col2h : 'Fleet Management'}
            </SubTitle>
            <Paragraph>
              {activeSection ? c.col2t : 'Fleet management includes vehicle maintenance, fuel management, parts inventory, and readiness monitoring with detailed records for each vehicle. Our certified technicians maintain expertise in specialized emergency vehicles and coordinate with manufacturers for technical support and repairs. We also manage vehicle replacement planning and lifecycle management.'}
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      <Section aria-labelledby="asset-management">
        <SubTitle id="asset-management">
          {activeSection ? c.bottomh : 'Infrastructure Maintenance and Asset Management'}
        </SubTitle>
        <Paragraph>
          {activeSection ? c.bottomt : 'We manage infrastructure maintenance covering fire stations, training facilities, equipment storage, communication systems, and support infrastructure through regular inspections and preventive maintenance. Asset management programs track equipment lifecycles, costs, and replacement planning to optimize resources. Our inventory systems ensure spare parts availability and efficient procurement, maintaining all emergency resources in peak condition.'}
        </Paragraph>
      </Section>
    </MainContent>
  );
};