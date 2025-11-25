import styled from 'styled-components';

// Main layout components
export const AuthPageContainer = styled.main`
  margin: 10px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 112.5%;
`;

export const AuthSection = styled.section`
  margin-bottom: 2rem;
`;

export const AuthFlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Form containers
export const AuthFormContainer = styled.div`
  background: white;
  border: 2px solid #4682B4;
  border-radius: 8px;
  padding: 40px;
  width: 800px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin: 0 auto;
`;

export const LoginFormContainer = styled(AuthFormContainer)`
  width: 900px;
`;

// Two-column layout for forms
export const TwoColumnFormLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FullWidthColumn = styled.div`
  grid-column: 1 / -1;
`;

// Typography
export const StyledH1 = styled.h1`
  font-size: 2.2rem;
  color: #FF9900;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

export const StyledH2 = styled.h2`
  font-size: 1.5rem;
  color: #1177BB;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
`;

export const StyledDivider = styled.hr`
  width: 100%;
  border: 5px solid #FF9900;
  border-radius: 3px;
  margin: 15px 0;
`;

export const StyledParagraph = styled.p`
  font-size: 16px;
  letter-spacing: 1.25px;
  line-height: 25px;
  text-align: justify;
  margin-bottom: 15px;
  color: #333;
`;

// Form elements
export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #1177BB;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #E1E1E1;
  border-radius: 4px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF9900;
    box-shadow: 0 0 6px rgba(255, 153, 0, 0.3);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #666;
  }
`;

// Messages
export const ErrorMessage = styled.div`
  color: #DC143C;
  font-size: 14px;
  margin-top: 15px;
  padding: 15px;
  background: #FFE4E1;
  border: 2px solid #DC143C;
  border-radius: 6px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
`;

export const SuccessMessage = styled.div`
  color: #008000;
  font-size: 14px;
  margin-top: 15px;
  padding: 15px;
  background: #F0FFF0;
  border: 2px solid #008000;
  border-radius: 6px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
`;

// Loading spinner
export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FF9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Link styling
export const LinkText = styled.div`
  text-align: center;
  margin-top: 25px;
  font-size: 16px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
  
  a {
    color: #1177BB;
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      color: #FF9900;
      text-decoration: underline;
    }
  }
`;

// Help text
export const HelpText = styled.div`
  font-size: 13px;
  color: #666;
  margin-top: 6px;
  line-height: 1.4;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
`;

// Info section for profile page
export const InfoSection = styled.div`
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 25px;
  border: 2px solid #FF9900;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const InfoLabel = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #1177BB;
  margin-bottom: 8px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
`;

export const InfoValue = styled.div`
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  font-family: 'Segoe UI Variable Display', 'Poppins', Arial, sans-serif;
`;

export const WarningBox = styled.div`
  background: #fffaf0;
  border: 1px solid #f6ad55;
  color: #c05621;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  
  strong {
    font-weight: 600;
  }
`;
