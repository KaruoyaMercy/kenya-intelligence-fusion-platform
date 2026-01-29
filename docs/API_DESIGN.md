# Replace the API_DESIGN.md file with the corrected version
@"
# 🔌 API DESIGN SPECIFICATION
## Kenya National Intelligence Fusion Platform

### TYPE DEFINITIONS

``````typescript
// User and Authentication Types
interface User {
  id: string;
  username: string;
  email: string;
  agency: 'NIS' | 'DCI' | 'KDF' | 'ACA' | 'KRA' | 'KEBS' | 'KPS' | 'FRC';
  clearance_level: 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  role: 'ANALYST' | 'OPERATOR' | 'SUPERVISOR' | 'DIRECTOR' | 'ADMIN';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

// Core Intelligence Types
interface IntelligenceReport {
  id: string;
  agency: 'NIS' | 'DCI' | 'KDF' | 'ACA' | 'KRA' | 'KEBS' | 'KPS' | 'FRC';
  classification: 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  data_type: 'HUMINT' | 'SIGINT' | 'OSINT' | 'GEOINT' | 'FININT' | 'CYBINT';
  threat_category: string;
  title: string;
  content: string;
  location: LocationData | null;
  confidence_score: number;
  source_reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  correlation_tags: string[];
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  created_by: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLASSIFIED';
}

interface LocationData {
  latitude: number;
  longitude: number;
  county: string;
  constituency: string | null;
}

interface ThreatCorrelation {
  id: string;
  primary_intelligence_id: string;
  correlated_intelligence_ids: string[];
  correlation_type: 'temporal' | 'spatial' | 'semantic' | 'network' | 'behavioral';
  correlation_score: number;
  correlation_method: string;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predicted_impact_kes: number;
  recommended_actions: string[];
  agencies_to_notify: string[];
  created_at: string;
  expires_at: string | null;
}

interface ThreatPrediction {
  id: string;
  threat_type: string;
  predicted_location: {
    county: string;
    coordinates: [number, number];
  };
  prediction_confidence: number;
  predicted_timeframe: string;
  predicted_impact_kes: number;
  model_version: string;
  input_features: Record<string, any>;
  status: 'pending' | 'monitoring' | 'resolved';
  created_at: string;
}

interface ThreatAlert {
  id: string;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  agencies_notified: string[];
  location: LocationData | null;
  recommended_actions: string[];
  status: 'sent' | 'acknowledged' | 'resolved';
  created_at: string;
  expires_at: string | null;
  related_intelligence_ids: string[];
}

interface AccessLogEntry {
  id: string;
  user_id: string;
  username: string;
  agency: string;
  action: string;
  resource_id: string;
  timestamp: string;
  ip_address: string;
}

// API Response Wrapper Types
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: string;
  request_id: string;
}
