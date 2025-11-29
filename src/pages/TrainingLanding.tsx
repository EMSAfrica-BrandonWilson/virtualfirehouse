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
  { name: 'Training Programmes', slug: 'training-programmes' },
  { name: 'Training Courses', slug: 'training-courses' },
  { name: 'Practical Examinations', slug: 'practical-examinations' },
  { name: 'Theoratical Examinations', slug: 'theoratical-examinations' },
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
    top: 'The Training and Development division provides professional development, certification programs, and continuing education to sustain competencies and emergency response capabilities.',
    col1h: 'Professional Development Programs and',
    col1t: 'We cover ARFF, HazMat, EMS, and technical rescue with initial and recurrent training, scenario-based exercises, and skills maintenance.',
    col2h: 'Certification and Skills Training',
    col2t: 'Accredited programs maintain certifications and develop specialized competencies across equipment operations and tactical procedures.',
    bottomh: 'Leadership Development and Career Advancement Resources',
    bottomt: 'Leadership and advancement resources build supervisory skills and strategic thinking through workshops, continuing education, and partnerships.'
  },
  'training-programmes': {
    top: 'Training programmes provide structured curricula to develop core and advanced competencies across ARFF, HazMat, EMS, and technical rescue disciplines. Sequenced modules progress from foundational knowledge to complex, scenario-based applications. Learning objectives tie to operational performance metrics and certification requirements. Integrated safety components reinforce PPE, risk assessment, and communication standards. Programme governance ensures consistency, traceability, and continual refresh aligned to mission needs.',
    col1h: 'Curriculum Design',
    col1t: 'Curricula align with standards and operational needs, balancing theory and practical drills that reflect real hazards. Content scaffolds learning using clear objectives, job performance requirements, and evaluation rubrics. Interleaved skills build retention while cross‑discipline links strengthen readiness. Resources include manuals, videos, and job aids to support varied learning styles. Periodic design reviews keep material current and mission‑focused.',
    col2h: 'Scheduling and Delivery',
    col2t: 'Programmes use blended delivery—classroom, e‑learning, and live scenarios—to optimize availability and cost. Rotational schedules support shift coverage while minimizing service disruption. Instructor standards define preparation, facilitation, and safety oversight. Facility and equipment booking systems ensure reliable training setups. Contingency plans adapt delivery for weather, staffing, or operational surges.',
    bottomh: 'Evaluation and Feedback',
    bottomt: 'Assessments and feedback improve outcomes through formative checks and summative exams. After‑action reviews from live exercises identify gaps and strengths. Participant surveys inform clarity, pace, and relevance for continuous tuning. Analytics track pass rates, retests, and field performance indicators. Programme updates incorporate findings for measurable, sustained improvement.'
  },
  'training-courses': {
    top: 'Courses target specific skills or knowledge areas for focused development, offering short, high‑impact learning events. Each course defines prerequisites and outcomes tied to operational tasks. Activities emphasize hands‑on practice, decision‑making, and communications under realistic constraints. Micro‑learning elements enhance retention between sessions. Course catalogs help planners match development needs to available offerings.',
    col1h: 'Modules and Objectives',
    col1t: 'Modules present concise objectives and performance criteria for clarity. Structured practice blocks build progressive capability in key domains. Scenario injects train judgment and adaptability under pressure. Job aids and checklists support task execution post‑training. Reference materials remain accessible for field refreshers.',
    col2h: 'Assessment Methods',
    col2t: 'Knowledge checks and practical assessments validate competency before field application. Rubrics standardize grading across instructors and cohorts. Peer and instructor feedback strengthen technique and confidence. Remediation pathways address gaps with targeted practice and re‑evaluation. Results inform individual development plans and follow‑up coaching.',
    bottomh: 'Records and Certifications',
    bottomt: 'Completion records and certifications support compliance and career progression. Digital tracking links course history to role requirements and renewals. Alerts notify upcoming expirations for timely requalification. Audit‑ready reports demonstrate training status across teams. Credential portfolios support promotion and assignment decisions.'
  },
  'practical-examinations': {
    top: 'Practical examinations validate hands‑on competencies under realistic conditions using standardized scenarios. Tasks mirror operational hazards, equipment, and time constraints. Candidates demonstrate technique, decision‑making, and communication in team settings. Grading rubrics emphasize safety, effectiveness, and adaptability. Post‑exam debriefs reinforce best practices and corrective actions.',
    col1h: 'Scenario-Based Testing',
    col1t: 'Exams simulate operational tasks with standardized evaluation criteria for consistency. Injects vary conditions to test situational awareness and resilience. Objective measurements capture accuracy, speed, and safety margins. Observers record behaviors aligned to job performance requirements. Evidence‑based grading builds confidence in results validity.',
    col2h: 'Safety and Supervision',
    col2t: 'Safety controls and qualified examiners ensure fair, controlled evaluations. PPE, exclusion zones, and equipment inspections precede activity. Briefings clarify objectives, hazards, and stop conditions. Examiners intervene when risk exceeds tolerance limits. Documentation supports transparency and constructive feedback.',
    bottomh: 'Remediation and Re-Test',
    bottomt: 'Remediation plans address gaps with targeted drills and coaching. Scheduled re‑tests confirm competency after additional practice. Individualized support considers learning styles and prior experience. Records of remediation ensure accountability and continuous improvement. Aggregate trends inform course design and exam rubrics.'
  },
  'theoratical-examinations': {
    top: 'Theoretical examinations verify knowledge of procedures, safety, and technical content essential for safe operations. Exams align to standards and SOPs with clear domains and weightings. Preparation guides structure study time and expectations. Integrity measures protect fairness and credibility of results. Analytics feed curriculum refinement and learner support.',
    col1h: 'Question Banks',
    col1t: 'Maintained question banks cover standards, SOPs, and risk concepts with periodic updates. Item analysis checks difficulty, discrimination, and clarity. Multiple forms reduce predictability while sustaining coverage. Reference links improve post‑exam learning and review. Governance controls changes and approvals.',
    col2h: 'Proctoring and Integrity',
    col2t: 'Proctoring and integrity measures sustain fair assessment results. ID verification, controlled environments, and monitoring deter misconduct. Policies clarify accommodations and appeals processes. Secure platforms and logs protect exam data. Reports document compliance and any incidents managed.',
    bottomh: 'Results and Analytics',
    bottomt: 'Results analytics guide training improvements and knowledge reinforcement. Dashboards track pass rates, domain scores, and retest patterns. Advisories target weak areas with micro‑learning modules. Cohort comparisons reveal course and instructor effects. Regular reviews ensure exams remain valid and reliable.'
  }
};

export const TrainingLanding: React.FC = () => {
  const params = useParams();
  const activeSlug = params.section || '';
  const activeSection = sections.find(s => s.slug === activeSlug);
  const c = contentMap[activeSlug] || contentMap[''];
  return (
    <MainContent aria-label="Main content">
      {/* Header Section */}
      <Section aria-labelledby="training-title">
        <div style={{ marginTop: '10px' }}>
          <FlexRow>
            <Column style={{ flex: '1', minWidth: '0' }}>
              <Title id="training-title">
                {activeSection ? activeSection.name : 'Training and Development'}
              </Title>
              <Divider aria-hidden="true" />
              <Paragraph>
                {activeSection ? (
                  c.top
                ) : (
                  <>The Training and Development division provides professional development, certification programs, and continuing education for all emergency service personnel at King Fahd International Airport, ensuring the highest competency and emergency response capabilities. Our curriculum includes initial certification, recurrent training, specialized skills development, leadership training, and advancement programs, delivered through state-of-the-art facilities and simulation equipment.</>
                )}
              </Paragraph>
            </Column>
            <ImageColumn>
              <HeaderImage src="/images/FireTraining.png" alt="Training and Development" />
            </ImageColumn>
          </FlexRow>
        </div>
      </Section>

      <Section aria-labelledby="professional-development">
        <FlexRow>
          <Column $width="48%">
            <SubTitle id="professional-development">
              {activeSection ? c.col1h : 'Professional Development Programs'}
            </SubTitle>
            <Paragraph>
              {activeSection ? c.col1t : 'Our programs cover aircraft rescue and firefighting, hazardous materials response, emergency medical services, and technical rescue operations. We provide initial and recurrent training meeting industry standards and regulatory requirements, incorporating the latest emergency response techniques through theoretical, practical, and scenario-based exercises.'}
            </Paragraph>
          </Column>
          <Column $width="48%">
            <SubTitle>
              {activeSection ? c.col2h : 'Certification and Skills Training'}
            </SubTitle>
            <Paragraph>
              {activeSection ? c.col2t : 'We focus on maintaining certifications and developing specialized competencies through accredited programs coordinated with recognized certification bodies and educational institutions. Skills training covers equipment operation, tactical procedures, safety protocols, and emergency response techniques, including cross-training for operational flexibility. All programs include performance evaluations and competency assessments.'}
            </Paragraph>
          </Column>
        </FlexRow>
      </Section>

      <Section aria-labelledby="career-advancement">
        <SubTitle id="career-advancement">
          {activeSection ? c.bottomh : 'Leadership Development and Career Advancement Resources'}
        </SubTitle>
        <Paragraph>
          {activeSection ? c.bottomt : 'We provide leadership development and career advancement resources supporting professional growth and organizational excellence. Programs develop supervisory skills, management capabilities, and strategic thinking through continuing education, workshops, and career counseling. Resources include specialized courses, conferences, and professional networks, with partnerships providing advanced learning opportunities. Our comprehensive approach ensures personnel have the knowledge, skills, and leadership capabilities to excel and contribute to exceptional emergency services at King Fahd International Airport.'}
        </Paragraph>
      </Section>
    </MainContent>
  );
};