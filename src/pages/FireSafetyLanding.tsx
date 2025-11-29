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
  { name: 'Fire By Laws', slug: 'fire-by-laws' },
  { name: 'Fire Codes', slug: 'fire-codes' },
  { name: 'Fire Publications', slug: 'fire-publications' },
  { name: 'Health and Safety', slug: 'health-and-safety' },
  { name: 'Hot Work Permits', slug: 'hot-work-permits' },
  { name: 'Incident Investigations', slug: 'incident-investigations' },
  { name: 'Occupancy Inspections', slug: 'occupancy-inspections' },
  { name: 'PIER Education', slug: 'pier-education' },
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
    top: 'The Fire and Life Safety division provides proactive fire prevention, life safety education, and safety program management through building inspections, code enforcement, and community education initiatives.',
    col1h: 'Fire Prevention Programs',
    col1t: 'Our programs include inspections, code enforcement, hazard identification, and safety system evaluations. We work with tenants and contractors to identify hazards and implement mitigation measures.',
    col2h: 'Life Safety Education',
    col2t: 'We deliver training and awareness for personnel and the public, covering fire prevention, emergency procedures, evacuation protocols, and hazard recognition.',
    bottomh: 'Risk Assessment and Community Safety Programs',
    bottomt: 'We conduct risk assessments including facility evaluations, fire load assessments, and egress reviews. Community safety programs provide preparedness training to partners and the public.'
  },
  'fire-by-laws': {
    top: 'Fire by-laws establish local legal requirements for prevention, fire protection systems, and safe operations across occupancies. They define responsibilities for owners, tenants, and contractors to implement risk controls and maintain life safety features. Enforcement mechanisms ensure hazards are corrected promptly and persistent issues are documented for follow-up. Clear processes enable predictable outcomes that protect the community and support resilient operations.',
    col1h: 'Compliance and Enforcement',
    col1t: 'Compliance actions include inspections, notices of violation, and timelines for corrective work. Enforcement escalates as needed with penalties or closures where imminent danger exists. Collaboration with building officials and safety representatives streamlines resolution. Documentation and audit trails preserve evidence and support transparent accountability.',
    col2h: 'Public Guidance',
    col2t: 'Guidance explains permit requirements, safe practices, and emergency planning steps. Plain-language resources help stakeholders prepare for inspections and maintain systems. Frequently asked questions and contact channels clarify responsibilities and timelines. Outreach builds awareness and reduces preventable risks in daily operations.',
    bottomh: 'Periodic Review',
    bottomt: 'By-laws undergo periodic review to align with evolving standards and local risk profiles. Stakeholder input helps refine provisions for practicality and clarity. Updates address new technologies, occupancy types, and lessons learned. Published revisions promote consistent application and improved safety outcomes.'
  },
  'fire-codes': {
    top: 'Fire codes define minimum requirements for life safety, construction features, and fire protection systems. They set performance and prescriptive criteria for detection, suppression, egress, and compartmentation. Codes also govern emergency planning, signage, and maintenance programs throughout the building lifecycle. Consistent application improves reliability and reduces the likelihood of catastrophic events.',
    col1h: 'Adoption and Interpretation',
    col1t: 'Recognized codes are adopted with local amendments to match jurisdictional needs. Formal interpretations provide consistent guidance where ambiguity exists. Equivalency provisions allow alternative solutions that meet intent and performance. Training keeps stakeholders informed of changes and correct application.',
    col2h: 'Inspections and Testing',
    col2t: 'Routine inspections verify the functionality and maintenance of critical systems. Testing frequencies follow code schedules for alarms, sprinklers, standpipes, and extinguishers. Deficiencies are documented with timelines and re-inspection plans. Records demonstrate compliance and support incident prevention.',
    bottomh: 'Continuous Improvement',
    bottomt: 'Regular updates keep codes aligned with best practices and emerging hazards. Post-incident learnings drive amendments and enforcement focus. Industry feedback refines practicality without compromising safety. Published changes are tracked and communicated for smooth transitions.'
  },
  'fire-publications': {
    top: 'Publications consolidate technical guidance, bulletins, and educational materials for stakeholders. Centralized resources support consistent procedures and reinforce safe practices. Updates highlight changes to standards, equipment, and tactics. Easily accessible documents enable rapid reference during planning and operations.',
    col1h: 'Technical Bulletins',
    col1t: 'Bulletins communicate procedure updates, equipment guidance, and response advisories. They provide concise steps with diagrams or checklists where beneficial. Distribution lists ensure relevant teams receive timely information. Archives enable quick retrieval of previous guidance when needed.',
    col2h: 'Educational Materials',
    col2t: 'Educational materials cover prevention, hazard recognition, and emergency actions. Content supports training sessions for staff and public audiences. Visual aids and examples improve retention and application of concepts. Materials are reviewed periodically to reflect current best practice.',
    bottomh: 'Accessible Library',
    bottomt: 'Resources are cataloged with search and tagging for efficient access. Version control indicates the latest approved documents. Feedback channels invite suggestions to improve clarity and usefulness. A maintained library supports daily operations and long-term learning.'
  },
  'health-and-safety': {
    top: 'Health and safety programs protect responders and the public through policies, training, and monitoring. Risk assessments identify controls for tasks and environments. PPE and hygiene practices reduce exposure and cumulative impacts. Continuous learning and reporting foster a proactive safety culture.',
    col1h: 'Policies and PPE',
    col1t: 'Policies define safe work methods, supervision, and access controls. PPE selection follows task hazard analysis and standards for performance. Fit testing and training ensure proper use and maintenance. Replacement cycles maintain effectiveness over time.',
    col2h: 'Monitoring and Reporting',
    col2t: 'Exposure monitoring checks airborne and surface hazards during operations. Incident and near-miss reporting enables trend analysis and corrective action. Dashboards track metrics for leadership awareness. Findings inform updates to procedures and training content.',
    bottomh: 'Wellness Support',
    bottomt: 'Wellness initiatives address physical fitness, hydration, and rest management. Behavioral health support and peer networks aid resilience. Rehab areas and return-to-work plans protect long-term readiness. Engagement programs embed safety and wellness into daily routines.'
  },
  'hot-work-permits': {
    top: 'Hot work permits control ignition sources during welding, cutting, and similar operations. Structured reviews verify area preparation and hazard isolation. Fire watch assignments with equipped personnel maintain vigilance. Documented steps ensure safe work from start to finish.',
    col1h: 'Permit Process',
    col1t: 'Pre-work checks confirm removal of combustibles and protection of exposures. Fire watch roles and communication plans are assigned. Hazard isolation includes gas shutoffs, covers, and shielding. Sign-off confirms understanding of responsibilities and timing.',
    col2h: 'Controls and Supervision',
    col2t: 'Controls include barriers, detection readiness, and extinguisher placement. Supervision verifies adherence to permit conditions and environment changes. Work pauses if conditions shift beyond safe parameters. Records capture steps taken and any deviations managed.',
    bottomh: 'Post-Work Monitoring',
    bottomt: 'Post-work monitoring continues for smoldering hazards in concealed spaces. Follow-up inspections verify no heat migration or residual sparks. Documentation closes permits with time logs and observations. Lessons learned inform future permit planning and training.'
  },
  'incident-investigations': {
    top: 'Investigations determine origins, causes, and contributing factors to prevent recurrence. Scene control preserves evidence and supports accurate analysis. Systematic methods document ignition sources, fuel pathways, and human or system elements. Findings inform codes, procedures, and awareness campaigns.',
    col1h: 'Origin and Cause',
    col1t: 'Origin and cause determination follows standardized methodologies and diagrams. Heat patterns, witness statements, and device examinations are correlated. Photography and notes capture conditions and item placements. Team reviews confirm conclusions before reporting.',
    col2h: 'Corrective Actions',
    col2t: 'Recommendations address equipment defects, maintenance gaps, and operational practices. Code compliance actions and training updates reinforce prevention. Stakeholder briefings explain changes and expected behaviors. Follow-up audits verify implementation and effectiveness.',
    bottomh: 'Reporting and Lessons',
    bottomt: 'Reports summarize facts, analysis, and corrective actions with clarity. Lessons learned drive updates to preplans and outreach content. Metrics track trend changes over time to gauge program impact. Sharing results promotes transparency and community trust.'
  },
  'occupancy-inspections': {
    top: 'Occupancy inspections verify life safety features, egress, and system maintenance. Evaluations confirm alarms, sprinklers, standpipes, and extinguishers are operational. Egress paths and signage must remain clear and visible. Records demonstrate consistent maintenance and inspections.',
    col1h: 'Pre-Inspection Coordination',
    col1t: 'Coordination confirms access to areas and documentation for efficient evaluation. Stakeholders receive checklists to prepare spaces and records. Schedules minimize operational disruption while enabling thorough review. Communication sets expectations for cooperation and timing.',
    col2h: 'Findings and Follow-Up',
    col2t: 'Findings document deficiencies with clear corrective timelines. Re-inspections verify closure and confirm sustained compliance. Guidance offers practical steps to resolve common issues. Patterns inform proactive programs and targeted outreach.',
    bottomh: 'Compliance Tracking',
    bottomt: 'Tracking systems record inspection dates, findings, and closures. Dashboards provide visibility to management and regulators. Alerts prompt upcoming tests and maintenance intervals. Data supports risk reduction and continuous improvement.'
  },
  'pier-education': {
    top: 'Public Information, Education, and Relations (PIER) builds awareness and preparedness across the community. Messaging promotes prevention, early reporting, and safe evacuation behavior. Two-way engagement captures feedback and adapts programs for diverse audiences. Consistent campaigns reduce risk over time and strengthen trust.',
    col1h: 'Programs and Outreach',
    col1t: 'Programs target schools, tenants, and communities with tailored content. Workshops and demonstrations make concepts practical and memorable. Coordinated schedules reach high-traffic locations and events. Measuring outcomes guides improvements and resource allocation.',
    col2h: 'Preparedness Materials',
    col2t: 'Guides and drills improve readiness for emergencies and reduce risk. Materials include checklists, maps, and role-based instructions. Scenario practice reinforces calm, efficient action under stress. Translations and accessible formats broaden reach and effectiveness.',
    bottomh: 'Community Partnerships',
    bottomt: 'Partnerships with agencies, schools, and businesses amplify outreach. Shared resources extend program coverage and continuity. Joint events build relationships and reinforce safety culture. Long-term collaboration sustains engagement and preparedness.'
  }
};

export const FireSafetyLanding: React.FC = () => {
  const params = useParams();
  const activeSlug = params.section || '';
  const activeSection = sections.find(s => s.slug === activeSlug);
  const c = contentMap[activeSlug] || contentMap[''];
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="fire-safety-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="fire-safety-title">
                {activeSection ? activeSection.name : 'Fire and Life Safety'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                {activeSection ? (
                  c.top
                ) : (
                  <>The Fire and Life Safety division provides proactive fire prevention, life safety education, and safety program management at King Fahd International Airport through building inspections, code enforcement, and community education initiatives. Our safety programs include fire prevention planning, building assessments, educational outreach, and compliance oversight to ensure all facilities meet international aviation safety standards.</>
                )}
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/FireSafety.jpg" alt="Fire and Life Safety" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      <Section aria-labelledby="prevention-programs">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="prevention-programs">
              {activeSection ? c.col1h : 'Fire Prevention Programs'}
            </SubTitle>
            <Paragraph>
              {activeSection ? c.col1t : 'Our fire prevention programs include building inspections, code enforcement, hazard identification, and safety system evaluations. We conduct regular facility inspections and work with tenants, contractors, and managers to identify hazards and implement mitigation measures.'}
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              {activeSection ? c.col2h : 'Life Safety Education'}
            </SubTitle>
            <Paragraph>
              {activeSection ? c.col2t : 'Our life safety education provides training programs and awareness initiatives for airport personnel and the public, covering fire prevention, emergency procedures, evacuation protocols, and hazard recognition through seminars, workshops, and awareness campaigns.'}
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      <Section aria-labelledby="safety-excellence">
        <SubTitle id="safety-excellence">
          {activeSection ? c.bottomh : 'Risk Assessment and Community Safety Programs'}
        </SubTitle>
        <Paragraph>
          {activeSection ? c.bottomt : 'We conduct comprehensive risk assessments including facility evaluations, hazard analysis, fire load assessments, and emergency egress reviews. Our community safety programs extend beyond airport boundaries, providing fire safety education and emergency preparedness training to local communities and airport partners.'}
        </Paragraph>
      </Section>
    </MainContent>
  );
};