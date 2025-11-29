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
  { name: 'Airport Rescue & Fire Fighting', slug: 'airport-rescue-fire-fighting' },
  { name: 'Hazardous Chemical Handling', slug: 'hazardous-chemical-handling' },
  { name: 'Highrise Rescue Operations', slug: 'highrise-rescue-operations' },
  { name: 'Maritime Fire Fighting', slug: 'maritime-fire-fighting' },
  { name: 'Medical Rescue Operations', slug: 'medical-rescue-operations' },
  { name: 'Road Traffic Accidents', slug: 'road-traffic-accidents' },
  { name: 'Nuclear Fire Risk Management', slug: 'nuclear-fire-risk-management' },
  { name: 'Petro-Chemical Fire Fighting', slug: 'petro-chemical-fire-fighting' },
  { name: 'Swift Water Rescue', slug: 'swift-water-rescue' },
  { name: 'Trench Collapse Operations', slug: 'trench-collapse-operations' },
  { name: 'Wildland Fire Fighting', slug: 'wildland-fire-fighting' }
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
    top: 'The Emergency Operations division coordinates field response and tactical operations across the airport environment. Teams specialize in aircraft rescue and firefighting (ARFF), hazardous materials control, technical rescue disciplines, and emergency medical services. Incident command provides a scalable structure for clear roles, accountability, and integrated communications. Standardized procedures guide actions while allowing flexibility for unique hazards and conditions. Continuous improvement drives safer, faster, and more effective outcomes for every incident.',
    col1h: 'Field Response Procedures',
    col1t: 'Established response procedures support rapid and coordinated action from dispatch to demobilization. Specialized apparatus and equipment are positioned according to preplans, wind, and access routes to protect life and property. Safety controls and hazard isolation measures are applied early to stabilize the incident scene. Flexibility within standardized steps allows teams to adapt to evolving risks and maintain momentum. Documentation and after-action reviews reinforce learning and future readiness.',
    col2h: 'Tactical Operations Management',
    col2t: 'Tactical operations are organized under incident command, unifying objectives and resource deployment. Communications plans ensure clear authority, timely updates, and shared situational awareness between teams. Resource use is optimized by staging, task assignments, and sectorization to maintain progress across functional areas. Coordination with airport operations, air traffic control, and external agencies provides seamless multi-agency support. Ongoing evaluation refines tactics to match conditions and operational priorities.',
    bottomh: 'Operational Readiness and Response Team Coordination',
    bottomt: 'Operational readiness is sustained through continuous training, equipment maintenance, and performance evaluation. Certification programs, scenario-based drills, and cross-functional exercises validate team capabilities. Preventive maintenance and inspections keep apparatus, PPE, and tools mission-ready under all conditions. Coordination mechanisms align staffing, logistics, and support functions to meet surge demands. Regular audits and improvement plans strengthen resilience across the response system.'
  },
  'airport-rescue-fire-fighting': {
    top: 'ARFF operations conform to ICAO categories and response time standards with defined agent discharge requirements. Crews focus on rapid scene access, crash rescue, and mitigation of fuel fires using AFFF and complementary agents. Airside safety procedures control runway/taxiway movements, establish command, and protect egress routes. Continuous readiness is maintained through apparatus checks, preplans, and joint coordination with airport operations and ATC.',
    col1h: 'Response & Tactics',
    col1t: 'Runway approach paths, apparatus positioning, and rescue team assignments follow preplan maps and wind-driven strategies. Tactics include exterior knockdown, interior entry when viable, and protection of escape slides and exit paths. Fuel spill control, cooling of fuselage skin, and rapid victim extraction are prioritized within smoke, heat and toxic environments. Sectorization ensures clear roles for attack, rescue, water supply, and safety.',
    col2h: 'Readiness & Compliance',
    col2t: 'Daily vehicle checks verify foam proportioning, pump operations, turret and handline flow rates. Staffing and training comply with airport regulatory requirements and best practice guidelines. Drills simulate realistic aircraft scenarios to validate response times, communications, and agent application patterns. Inspection programs and documentation support audit readiness and continuous improvement.',
    bottomh: 'Training & Coordination',
    bottomt: 'Scenario-based training incorporates seat maps, access points, and interior layouts to build familiarity. Coordination with airside partners covers fuel farms, ground handlers, and medical teams for unified operations. After-action reviews capture lessons learned, update preplans, and strengthen cross-agency communication protocols. Regular exercises refine command integration and resource management under time-critical conditions.'
  },
  'hazardous-chemical-handling': {
    top: 'Hazardous chemical handling covers rapid identification, isolation, and mitigation of releases across solids, liquids, and gases. Monitoring and classification inform PPE selection and control zones to reduce exposure. Teams establish decontamination corridors and perform containment to prevent migration into drains or soil. Safe transfer and recovery operations restore site safety under documented procedures and permits.',
    col1h: 'Assessment & Control',
    col1t: 'Air monitoring defines hot/warm/cold zones, guiding entry requirements and work cycles. Containment utilizes diking, booms, and absorbents to control spill spread and vapor production. Decon corridors are scaled to anticipated throughput and waste handling needs. Safe transfer relies on compatible equipment, bonding/grounding, and step-by-step verification of lines and valves.',
    col2h: 'Protection & Procedures',
    col2t: 'PPE selection balances splash, inhalation, and temperature risks with mobility considerations. Standard operating procedures anchor actions to technical references and manufacturer safety data. Safety briefings set objectives, hazards, work/rest cycles, and emergency signals. Documentation records readings, control measures, waste streams, and final status for compliance.',
    bottomh: 'Recovery & Documentation',
    bottomt: 'Site recovery transitions from emergency control to cleanup and verification of residual hazards. Waste handling follows segregated containers and manifests with licensed carriers. Incident reporting captures data for root cause analysis, regulatory follow-up, and training updates. Lessons learned feed into future preplans, PPE selections, and monitoring strategies for similar risks.'
  },
  'highrise-rescue-operations': {
    top: 'High-rise operations emphasize lobby command, stairwell control, and standpipe usage for safe vertical movement. Ventilation and smoke control balance occupant safety with firefighter conditions. Coordinated search and evacuation protect vulnerable populations while maintaining accountability. Communications and sectorization span multiple floors and disciplines to sustain clarity.',
    col1h: 'Lobby & Sector Control',
    col1t: 'Lobby command manages building systems, elevator control, and initial resource assignments. Stairwell management secures attack/evacuation paths, pressurization, and refuge areas. Sectorization organizes attack, search, ventilation, and medical groups. Access to risers, floor plans, and fire control rooms supports rapid, informed decisions.',
    col2h: 'Fire Attack & Rescue',
    col2t: 'Standpipe operations position advancing crews with appropriate flows and nozzle configurations. Ventilation strategies consider smoke spread, HVAC interaction, and protected stairwells. Occupant evacuation prioritizes high-risk floors and protected routes with escort and medical triage. Rapid Intervention Teams stage tools and monitor conditions for immediate rescue of responders.',
    bottomh: 'Accountability & Comms',
    bottomt: 'Accountability systems track location, tasks, and time-on-air for crews across multiple floors. Communications plans define channels and command structure for consistent updates. Post-incident reviews align building management, fire service, and code officials on improvements. Training cycles include stair climb evolutions and standpipe flows to maintain proficiency.'
  },
  'maritime-fire-fighting': {
    top: 'Maritime firefighting addresses vessel fires with compartmental complexity, limited access, and ship stability considerations. Integration with fixed systems and foam operations is coordinated with ship crew and port authority procedures. Cargo hazards demand special agent selection and ventilation control. Safety focuses on confined space risks, communications, and egress planning.',
    col1h: 'Vessel Hazards',
    col1t: 'Compartments and bulkheads shape fire spread and access challenges for interior attack. Confined spaces elevate toxic and oxygen-deficient risks requiring atmospheric monitoring. Cargo hazards such as chemicals or fuels may require specific agents and isolation plans. Ship stability and ballast control affect tactical decisions and crew safety throughout operations.',
    col2h: 'Tactics & Coordination',
    col2t: 'Foam streams and monitors achieve knockdown on deck or within cargo areas where feasible. Fixed suppression integration aligns with system capability and recharge availability. Operations with port authorities direct perimeter control, water supply, and tug assistance. Unified command and liaison roles ensure clear responsibilities and common objectives.',
    bottomh: 'Safety & Access',
    bottomt: 'Safe access routes are preplanned with ship crew and include muster points and alternative egress. Ventilation plans limit smoke migration without exacerbating fire behavior. Casualty control includes triage stations and transfer to medical resources. Documentation and inspections inform compliance and future training focus.',
  },
  'medical-rescue-operations': {
    top: 'Medical rescue provides pre-hospital care through rapid assessment, stabilization, and safe transport decisions. Triage prioritizes patients with clear tagging and treatment area organization. AED deployment and basic life support protocols address time-critical cardiac events. Documentation and handover support continuity between responders and hospital teams.',
    col1h: 'Clinical Response',
    col1t: 'Primary/secondary assessment builds early understanding of injury and illness. Stabilization includes airway management, bleeding control, splinting, and pain mitigation. Trauma care protocols guide treatment pathways and destination choices. Cardiac event procedures use AED, compressions, and pharmacologic support where applicable.',
    col2h: 'Incident Medical Support',
    col2t: 'Incident medical support sets up triage, treatment, and medical supply areas. Coordination with EMS partners manages transport queues and hospital notifications. Communication protocols provide structured updates on patient status. Rehab areas support responder safety and readiness during extended operations.',
    bottomh: 'Quality & Training',
    bottomt: 'Ongoing training and QA reviews capture performance data for protocol improvements. Documentation standards ensure legal and clinical completeness. Debriefs refine teamwork and highlight needs for equipment or training refresh. Community outreach supports prevention and bystander readiness.',
  },
  'road-traffic-accidents': {
    top: 'Road traffic accident response ensures scene safety through traffic control and hazard isolation. Vehicle stabilization and battery management reduce ignition and movement risks. Extrication prioritizes safe disentanglement with glass management and tool operations. Patient packaging supports rapid transport under medical direction and triage.',
    col1h: 'Scene & Stabilization',
    col1t: 'Traffic control sets safe work zones with block apparatus, cones, and lighting. Hazard isolation addresses fuel leaks, power disconnection, and airbag considerations. Stabilization uses cribbing and struts to prevent vehicle movement. Glass management techniques protect patients and crews from injury.',
    col2h: 'Extrication & Care',
    col2t: 'Tool selection favors minimum force and maximum control around critical anatomy. Disentanglement reduces entrapment while preserving vehicle integrity for safety. Coordinated patient handling balances medical needs with extrication timing. Communications align fire, EMS, and law enforcement actions for seamless operations.',
    bottomh: 'Interagency Operations',
    bottomt: 'Interagency operations define roles for traffic control, investigation, and scene clearance. After-action reviews address delays and opportunities for safer setups. Training drills refine tool proficiency and team coordination. Public information supports prevention and awareness on safe driving behaviors.',
  },
  'nuclear-fire-risk-management': {
    top: 'Nuclear fire risk management emphasizes radiation awareness and strict exposure controls. Shielding and time-distance principles minimize dose during essential tasks. Monitoring verifies environmental conditions and personal exposure limits. Decontamination procedures prevent secondary contamination and enable safe demobilization.',
    col1h: 'Controls & Monitoring',
    col1t: 'Shielding barriers, perimeter control, and hot/warm/cold zones frame safe operations. Exposure limits define work cycles with dosimetry tracking. Ventilation and isolation limit airborne hazards. Liaison with site specialists provides technical guidance and oversight.',
    col2h: 'Decon & Protocols',
    col2t: 'Decontamination procedures include gross and technical decon with waste handling and documentation. Protocols align with regulatory requirements and site safety plans. Communications ensure accountability and clear transitions between phases. Security coordination protects restricted areas and evidence.',
    bottomh: 'Training & Safety',
    bottomt: 'Specialized training builds competency in detection, PPE, and decon methodology. Safety briefings set objectives, hazards, and emergency actions prior to entry. After-action analyses refine preplans, monitoring strategies, and PPE choices. Outreach ensures responders and stakeholders understand roles and limitations.',
  },
  'petro-chemical-fire-fighting': {
    top: 'Petro-chemical incidents involve flammable liquids and gases with rapid escalation potential. Foam application achieves suppression while vapor control reduces ignition hazards. Isolation and shutdown procedures coordinate with plant operations and control rooms. Monitoring and PPE selections balance heat and toxic risk during prolonged activity.',
    col1h: 'Foam & Suppression',
    col1t: 'Agent selection considers hydrocarbon versus polar solvents and application technique. Foam streams, blankets, and gentle application prevent seal break and reignition. Vapor control utilizes water fogs, cooling, and isolation barriers. Knockdown strategies prioritize exposure protection and containment.',
    col2h: 'Isolation & Shutdown',
    col2t: 'Valve operations, isolation zones, and depressurization steps are coordinated with plant staff. Communications align fire command and process safety personnel. Safe access routes protect crews from thermal and toxic exposure. Documentation supports regulatory review and process safety audits.',
    bottomh: 'Safety & Monitoring',
    bottomt: 'Atmospheric monitoring informs PPE and work cycles for sustained operations. Post-incident reviews evaluate agent performance, tactics, and coordination. Training includes foam proportioning tests and application drills. Preplans document hydrants, monitors, and process lines for rapid decisions.',
  },
  'swift-water-rescue': {
    top: 'Swift-water rescue emphasizes hydrology assessment, downstream safety, and carefully staged contact rescues. PPE protects against cold water, impact, and entanglement hazards. Rope systems and anchoring enable controlled movement in dynamic environments. Communications ensure clear commands and accountability.',
    col1h: 'Assessment & Setup',
    col1t: 'Hydrology assessment analyzes speed, depth, obstacles, and strainers. Anchor points and safety lines protect rescuers during positioning. Downstream safety teams stage throw bags and recovery resources. Scouts identify access points and retreat routes before entry.',
    col2h: 'Rescue Methods',
    col2t: 'Contact rescues prioritize victim stabilization, body positioning, and safe movement. Throw bag operations require practiced aim and effective belay. Boats and tethers provide controlled approach and extraction in higher flows. Rope systems accomplish guided traverses and mechanical advantage where necessary.',
    bottomh: 'Training & PPE',
    bottomt: 'Cold-water PPE includes thermal protection and secure footwear. Communications rely on hand signals and radios with waterproof protection. Regular drills build competence in hydrology reading and rescue techniques. After-action reviews refine tactics and team coordination.',
  },
  'trench-collapse-operations': {
    top: 'Trench collapse operations focus on hazard control, shoring, and atmospheric monitoring to enable safe patient access and extraction. Strict entry procedures define roles and equipment for rescue teams. Utilities isolation and perimeter control reduce secondary collapse risk. Documentation and scene preservation support later investigations.',
    col1h: 'Hazard Control',
    col1t: 'Perimeter control establishes safe zones and limits traffic near trench edges. Utilities isolation ensures gas, water, and electrical hazards are mitigated. Spoil pile management relocates displaced soil away from edges to prevent load. Monitoring confirms stability before and during shoring operations.',
    col2h: 'Shoring & Access',
    col2t: 'Shoring systems deploy panels, struts, and spreaders according to trench depth and soil. Atmospheric checks confirm oxygen, flammable, and toxic levels before entry. Patient access balances medical needs and structural stability. Rescue tools and litters are staged for efficient extraction.',
    bottomh: 'Procedures & Safety',
    bottomt: 'Strict procedures define entry control, accountability, and team rotation to manage fatigue. Communications facilitate updates on stability and patient status. After-action reviews identify improvements in equipment and training. Preplans and site surveys enhance future readiness.',
  },
  'wildland-fire-fighting': {
    top: 'Wildland firefighting employs anchor, flank, and pinch tactics guided by fire behavior and terrain. Line construction protects values at risk while enabling containment and burnout operations. Interface protection addresses structures with defensible space and water supply planning. Coordination spans divisions, branches, and agencies across large areas.',
    col1h: 'Tactics & Behavior',
    col1t: 'Assess fire behavior using fuel, weather, and topography to anticipate spread. Establish anchor points to prevent flanking and support safe progression. Build control lines with hand crews, dozers, and water support. Tactical adjustments respond to shifting winds and spot fires.',
    col2h: 'Resources & Interface',
    col2t: 'Resource deployment prioritizes hot spots and critical exposures. Water supply planning includes drafting, tenders, and portable tanks. Structure protection leverages defensible space and clear access routes. Coordination with law enforcement and public works supports closures and logistics.',
    bottomh: 'Safety & Coordination',
    bottomt: 'Safety briefings reinforce LCES principles and escape routes for crews. Multi-agency coordination ensures unified command and shared situational awareness. Rehabilitation plans protect responders in extended operations. Documentation and mapping capture progress and guide subsequent shifts.'
  }
};

export const OperationsLanding: React.FC = () => {
  const params = useParams();
  const activeSlug = params.section || '';
  const activeSection = sections.find(s => s.slug === activeSlug);
  const c = contentMap[activeSlug] || contentMap[''];

  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="operations-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            

            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="operations-title">
                {activeSection ? activeSection.name : 'Emergency Operations'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>{c.top}</Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/OpsDefault.png" alt="Emergency Operations" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      <Section aria-labelledby="field-response">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="field-response">
              {c.col1h}
            </SubTitle>
            <Paragraph>
              {c.col1t}
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              {c.col2h}
            </SubTitle>
            <Paragraph>
              {c.col2t}
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      <Section aria-labelledby="operational-excellence">
        <SubTitle id="operational-excellence">
          {c.bottomh}
        </SubTitle>
        <Paragraph>
          {c.bottomt}
        </Paragraph>
      </Section>
    </MainContent>
  );
};