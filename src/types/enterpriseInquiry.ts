export type EnterpriseCompanySize = 'up_to_50' | '51_200' | '201_500' | '501_1000' | '1000_plus';

export type EnterprisePreferredContact = 'phone' | 'email' | 'messenger';

export type EnterpriseNeed =
  | 'multi_organization'
  | 'integrations'
  | 'access_control'
  | 'implementation'
  | 'personal_configuration'
  | 'priority_support';

export interface EnterpriseInquiryInput {
  contactPhone: string;
  companySize: EnterpriseCompanySize;
  preferredContact: EnterprisePreferredContact;
  needs: EnterpriseNeed[];
  comment: string;
}

