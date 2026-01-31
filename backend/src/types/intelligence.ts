export interface IntelligenceReport {
  id: string;
  agency: 'NIS' | 'DCI' | 'KDF' | 'ACA' | 'KRA' | 'KEBS' | 'KPS' | 'FRC';
  classification: 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  data_type: 'HUMINT' | 'SIGINT' | 'OSINT' | 'GEOINT' | 'FININT' | 'CYBINT';
  threat_category: string;
  title: string;
  content: string;
  location?: {
    latitude: number;
    longitude: number;
    county: string;
    constituency?: string;
  };
  confidence_score: number; // 0.0 to 1.0
  source_reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  correlation_tags: string[];
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: Date;
  created_by: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLASSIFIED';
  attachments?: string[];
}

export interface SubmitIntelligenceRequest {
  agency: 'NIS' | 'DCI' | 'KDF' | 'ACA' | 'KRA' | 'KEBS' | 'KPS' | 'FRC';
  classification: 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  data_type: 'HUMINT' | 'SIGINT' | 'OSINT' | 'GEOINT' | 'FININT' | 'CYBINT';
  threat_category: string;
  title: string;
  content: string;
  location?: {
    latitude: number;
    longitude: number;
    county: string;
    constituency?: string;
  };
  confidence_score: number;
  source_reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  correlation_tags: string[];
  attachments?: File[];
}

export interface IntelligenceResponse {
  success: boolean;
  data?: {
    intelligence_id: string;
    status: 'submitted' | 'processing' | 'correlated';
    correlations_found: number;
    threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    estimated_impact_kes: number;
    recommended_actions: string[];
    agencies_to_notify: string[];
  };
  message: string;
  timestamp: string;
}

export interface SearchIntelligenceRequest {
  query?: string;
  agency?: string;
  classification?: string;
  threat_category?: string;
  county?: string;
  date_from?: string;
  date_to?: string;
  threat_level?: string;
  limit?: number;
  offset?: number;
}
