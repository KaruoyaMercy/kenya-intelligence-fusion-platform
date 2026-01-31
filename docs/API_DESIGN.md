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

interface NetworkAnalysis {
  network_id: string;
  network_type: 'corruption' | 'smuggling' | 'terrorism' | 'cybercrime';
  key_entities: Array<{
    entity_id: string;
    entity_type: 'person' | 'organization' | 'location';
    name: string;
    centrality_score: number;
    threat_level: string;
  }>;
  connections: Array<{
    source_id: string;
    target_id: string;
    connection_type: string;
    strength: number;
  }>;
  estimated_value_kes: number;
  agencies_tracking: string[];
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
``````

### REST API ENDPOINTS

#### Authentication & Authorization

``````typescript
// POST /api/auth/login
interface LoginRequest {
  username: string;
  password: string;
  agency: string;
  mfa_token?: string;
}

interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

type LoginResponse = ApiSuccessResponse<LoginResponseData>;

// POST /api/auth/refresh
interface RefreshTokenRequest {
  refresh_token: string;
}

interface RefreshTokenResponseData {
  access_token: string;
  expires_in: number;
}

type RefreshTokenResponse = ApiSuccessResponse<RefreshTokenResponseData>;

// POST /api/auth/logout
interface LogoutRequest {
  access_token: string;
}

interface LogoutResponseData {
  message: string;
}

type LogoutResponse = ApiSuccessResponse<LogoutResponseData>;
``````

#### Intelligence Management

``````typescript
// POST /api/intelligence/submit
interface SubmitIntelligenceRequest {
  agency: 'NIS' | 'DCI' | 'KDF' | 'ACA' | 'KRA' | 'KEBS' | 'KPS' | 'FRC';
  classification: 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  data_type: 'HUMINT' | 'SIGINT' | 'OSINT' | 'GEOINT' | 'FININT' | 'CYBINT';
  threat_category: string;
  title: string;
  content: string;
  location?: LocationData;
  confidence_score: number; // 0.0 to 1.0
  source_reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  correlation_tags: string[];
  attachments?: File[];
}

interface SubmitIntelligenceResponseData {
  intelligence_id: string;
  status: 'submitted' | 'processing' | 'correlated';
  correlations_found: number;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

type SubmitIntelligenceResponse = ApiSuccessResponse<SubmitIntelligenceResponseData>;

// GET /api/intelligence/search
interface SearchIntelligenceRequest {
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

interface SearchIntelligenceResponseData {
  intelligence_reports: IntelligenceReport[];
  total_count: number;
  page: number;
  limit: number;
}

type SearchIntelligenceResponse = ApiSuccessResponse<SearchIntelligenceResponseData>;

// GET /api/intelligence/{intelligence_id}
interface GetIntelligenceResponseData {
  intelligence: IntelligenceReport;
  correlations: ThreatCorrelation[];
  access_log: AccessLogEntry[];
}

type GetIntelligenceResponse = ApiSuccessResponse<GetIntelligenceResponseData>;

// PUT /api/intelligence/{intelligence_id}
interface UpdateIntelligenceRequest {
  title?: string;
  content?: string;
  threat_category?: string;
  correlation_tags?: string[];
  status?: 'ACTIVE' | 'ARCHIVED' | 'CLASSIFIED';
}

interface UpdateIntelligenceResponseData {
  intelligence: IntelligenceReport;
  updated_fields: string[];
}

type UpdateIntelligenceResponse = ApiSuccessResponse<UpdateIntelligenceResponseData>;

// DELETE /api/intelligence/{intelligence_id}
interface DeleteIntelligenceResponseData {
  intelligence_id: string;
  status: 'deleted' | 'archived';
  message: string;
}

type DeleteIntelligenceResponse = ApiSuccessResponse<DeleteIntelligenceResponseData>;
``````

#### Threat Analysis & Predictions

``````typescript
// POST /api/threats/analyze
interface ThreatAnalysisRequest {
  intelligence_ids: string[];
  analysis_type: 'correlation' | 'prediction' | 'network' | 'comprehensive';
  time_horizon_hours?: number; // Default: 72
  geographic_scope?: {
    counties: string[];
    radius_km?: number;
    center_coordinates?: [number, number];
  };
}

interface ThreatAnalysisResponseData {
  analysis_id: string;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence_score: number;
  correlations: ThreatCorrelation[];
  predictions: ThreatPrediction[];
  network_analysis?: NetworkAnalysis;
  recommended_actions: string[];
  agencies_to_notify: string[];
  estimated_impact_kes: number;
}

type ThreatAnalysisResponse = ApiSuccessResponse<ThreatAnalysisResponseData>;

// GET /api/threats/predictions
interface GetPredictionsRequest {
  county?: string;
  threat_type?: string;
  min_confidence?: number;
  time_range_hours?: number;
  limit?: number;
}

interface GetPredictionsResponseData {
  predictions: ThreatPrediction[];
  total_predictions: number;
}

type GetPredictionsResponse = ApiSuccessResponse<GetPredictionsResponseData>;

// POST /api/threats/correlate
interface CorrelateThreatsRequest {
  primary_intelligence_id: string;
  correlation_threshold?: number; // Default: 0.7
  max_correlations?: number; // Default: 50
}

interface CorrelateThreatsResponseData {
  correlations: ThreatCorrelation[];
  correlation_count: number;
  processing_time_ms: number;
}

type CorrelateThreatsResponse = ApiSuccessResponse<CorrelateThreatsResponseData>;
``````

#### Real-time Operations

``````typescript
// WebSocket /ws/intelligence-feed
interface IntelligenceFeedMessage {
  type: 'new_intelligence' | 'correlation_update' | 'threat_alert' | 'prediction_update';
  data: {
    intelligence?: IntelligenceReport;
    correlation?: ThreatCorrelation;
    alert?: ThreatAlert;
    prediction?: ThreatPrediction;
  };
  timestamp: string;
  agencies_authorized: string[];
  classification_level: string;
}

// POST /api/alerts/create
interface CreateAlertRequest {
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  agencies_to_notify: string[];
  location?: LocationData;
  recommended_actions: string[];
  expires_at?: string;
  related_intelligence_ids?: string[];
}

interface CreateAlertResponseData {
  alert_id: string;
  status: 'sent' | 'pending' | 'acknowledged';
  agencies_notified: string[];
  estimated_response_time_hours: number;
}

type CreateAlertResponse = ApiSuccessResponse<CreateAlertResponseData>;

// GET /api/alerts
interface GetAlertsRequest {
  agency?: string;
  threat_level?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

interface GetAlertsResponseData {
  alerts: ThreatAlert[];
  total_count: number;
}

type GetAlertsResponse = ApiSuccessResponse<GetAlertsResponseData>;
``````

#### Analytics & Reporting

``````typescript
// GET /api/analytics/dashboard
interface DashboardAnalyticsResponseData {
  summary: {
    total_intelligence_reports: number;
    active_threats: number;
    correlations_found_today: number;
    predictions_made_today: number;
    agencies_active: number;
    avg_response_time_hours: number;
  };
  threat_trends: Array<{
    date: string;
    threat_level: string;
    count: number;
    agencies_involved: string[];
  }>;
  agency_performance: Array<{
    agency: string;
    reports_submitted: number;
    correlations_found: number;
    response_time_avg_hours: number;
    threat_prevention_score: number;
  }>;
  geographic_hotspots: Array<{
    county: string;
    threat_count: number;
    threat_level_avg: number;
    coordinates: [number, number];
    primary_threat_types: string[];
  }>;
  correlation_network: {
    nodes: Array<{
      id: string;
      type: 'intelligence' | 'threat' | 'person' | 'organization';
      label: string;
      agency: string;
      threat_level: string;
      size: number;
    }>;
    edges: Array<{
      source: string;
      target: string;
      correlation_score: number;
      correlation_type: string;
      weight: number;
    }>;
  };
}

type DashboardAnalyticsResponse = ApiSuccessResponse<DashboardAnalyticsResponseData>;

// GET /api/analytics/reports/export
interface ExportReportRequest {
  report_type: 'intelligence_summary' | 'threat_analysis' | 'agency_performance' | 'correlation_network';
  date_from: string;
  date_to: string;
  agencies?: string[];
  classification_levels?: string[];
  format: 'pdf' | 'excel' | 'json' | 'csv';
}

interface ExportReportResponseData {
  download_url: string;
  file_size_bytes: number;
  expires_at: string;
}

type ExportReportResponse = ApiSuccessResponse<ExportReportResponseData>;
``````

#### Network Analysis

``````typescript
// GET /api/network/criminal-networks
interface CriminalNetworksResponseData {
  networks: Array<{
    network_id: string;
    network_type: 'corruption' | 'smuggling' | 'terrorism' | 'cybercrime';
    threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    key_players: Array<{
      person_id: string;
      name: string;
      role: string;
      threat_level: string;
      centrality_score: number;
    }>;
    organizations: Array<{
      org_id: string;
      name: string;
      business_type: string;
      threat_level: string;
    }>;
    locations: Array<{
      location_id: string;
      name: string;
      county: string;
      significance: string;
    }>;
    estimated_value_kes: number;
    agencies_tracking: string[];
    last_activity: string;
  }>;
  total_networks: number;
}

type CriminalNetworksResponse = ApiSuccessResponse<CriminalNetworksResponseData>;

// POST /api/network/analyze-connections
interface AnalyzeConnectionsRequest {
  entity_ids: string[];
  entity_types: ('person' | 'organization' | 'location' | 'threat')[];
  max_depth: number;
  min_connection_strength: number;
}

interface AnalyzeConnectionsResponseData {
  connection_graph: {
    nodes: Array<{
      id: string;
      type: string;
      label: string;
      properties: Record<string, any>;
    }>;
    edges: Array<{
      source: string;
      target: string;
      relationship: string;
      strength: number;
      properties: Record<string, any>;
    }>;
  };
  analysis_summary: {
    total_nodes: number;
    total_edges: number;
    strongest_connections: Array<{
      source: string;
      target: string;
      strength: number;
    }>;
  };
}

type AnalyzeConnectionsResponse = ApiSuccessResponse<AnalyzeConnectionsResponseData>;
``````

### API SECURITY SPECIFICATIONS

#### Authentication Flow:
1. **Login:** POST `/api/auth/login` with credentials
2. **Token:** Receive JWT access token (15 min) + refresh token (7 days)
3. **Authorization:** Include `Authorization: Bearer <token>` in headers
4. **Refresh:** Use refresh token to get new access token
5. **Logout:** Invalidate tokens on logout

#### Security Headers:
``````typescript
interface SecurityHeaders {
  'Authorization': 'Bearer <jwt_token>';
  'X-API-Key': '<api_key>'; // For agency integrations
  'X-Request-ID': '<unique_request_id>';
  'X-Agency': '<agency_code>';
  'X-Clearance-Level': '<user_clearance>';
  'Content-Type': 'application/json';
}
``````

#### Rate Limiting:
- **Intelligence Submission:** 100 requests/minute per agency
- **Search Queries:** 1000 requests/minute per user
- **Analytics:** 50 requests/minute per user
- **Real-time Feed:** 10 connections per user

#### Example Success Response:
``````json
{
  "success": true,
  "data": {
    "intelligence_id": "intel_123456789",
    "status": "submitted",
    "correlations_found": 3,
    "threat_level": "HIGH"
  },
  "message": "Intelligence report submitted successfully",
  "timestamp": "2026-01-30T10:30:00Z"
}
``````

#### Example Error Response:
``````json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": "Token expired at 2026-01-30T10:00:00Z"
  },
  "timestamp": "2026-01-30T10:30:00Z",
  "request_id": "req_123456789"
}
``````

### WEBHOOK ENDPOINTS

#### Agency Integration Webhooks:
``````typescript
// POST /webhooks/agencies/{agency_code}
interface AgencyWebhookPayload {
  webhook_id: string;
  agency: string;
  event_type: 'intelligence_submitted' | 'threat_detected' | 'operation_completed';
  timestamp: string;
  data: {
    intelligence_id?: string;
    threat_id?: string;
    classification: string;
    summary: string;
    location?: LocationData;
  };
  signature: string; // HMAC-SHA256 signature
}
``````

### API VERSIONING & DOCUMENTATION

- **Current Version:** `/api/v1/`
- **Interactive Docs:** Available at `/api/docs` (Swagger UI)
- **OpenAPI Spec:** Available at `/api/openapi.json`

---
**API Design Date:** January 30, 2026
**API Architect:** Mercy Karuoya
**Project:** Kenya National Intelligence Fusion Platform
**Version:** 2.0 (Complete API Specification)
"@ | Out-File -FilePath "docs\API_DESIGN.md" -Encoding UTF8 -Force
```

