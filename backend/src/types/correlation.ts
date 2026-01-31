export interface ThreatCorrelation {
  id: string;
  primary_intelligence_id: string;
  correlated_intelligence_ids: string[];
  correlation_type: 'temporal' | 'spatial' | 'semantic' | 'network' | 'behavioral';
  correlation_score: number; // 0.0 to 1.0
  correlation_method: string;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predicted_impact_kes: number;
  recommended_actions: string[];
  agencies_to_notify: string[];
  created_at: Date;
  expires_at?: Date;
}

export interface ThreatPrediction {
  id: string;
  threat_type: string;
  predicted_location: {
    county: string;
    coordinates: [number, number];
    confidence_radius_km: number;
  };
  prediction_confidence: number; // 0.0 to 1.0
  predicted_timeframe: string;
  predicted_impact_kes: number;
  model_version: string;
  input_features: {
    historical_patterns: number;
    seasonal_factors: number;
    economic_indicators: number;
    social_tension_index: number;
    cross_border_activity: number;
  };
  status: 'pending' | 'monitoring' | 'resolved' | 'false_positive';
  created_at: Date;
  last_updated: Date;
}

export interface CorrelationAnalysisRequest {
  intelligence_ids: string[];
  analysis_type: 'correlation' | 'prediction' | 'network' | 'comprehensive';
  time_horizon_hours?: number; // Default: 72
  geographic_scope?: {
    counties: string[];
    radius_km?: number;
    center_coordinates?: [number, number];
  };
  correlation_threshold?: number; // Default: 0.7
}

export interface CorrelationAnalysisResponse {
  success: boolean;
  data?: {
    analysis_id: string;
    threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence_score: number;
    correlations: ThreatCorrelation[];
    predictions: ThreatPrediction[];
    network_analysis?: NetworkAnalysis;
    recommended_actions: string[];
    agencies_to_notify: string[];
    estimated_impact_kes: number;
    processing_time_ms: number;
  };
  message: string;
  timestamp: string;
}

export interface NetworkAnalysis {
  network_id: string;
  network_type: 'corruption' | 'smuggling' | 'terrorism' | 'cybercrime';
  key_entities: Array<{
    entity_id: string;
    entity_type: 'person' | 'organization' | 'location';
    name: string;
    centrality_score: number;
    threat_level: string;
    connections: number;
  }>;
  connections: Array<{
    source_id: string;
    target_id: string;
    connection_type: string;
    strength: number;
    evidence_count: number;
  }>;
  estimated_value_kes: number;
  agencies_tracking: string[];
  vulnerability_points: string[];
  disruption_strategies: string[];
}
