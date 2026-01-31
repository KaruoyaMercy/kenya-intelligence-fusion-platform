export interface IntelligenceFeedMessage {
  type: 'new_intelligence' | 'correlation_update' | 'threat_alert' | 'prediction_update' | 'network_update';
  data: {
    intelligence?: any;
    correlation?: any;
    alert?: any;
    prediction?: any;
    network?: any;
  };
  timestamp: string;
  agencies_authorized: string[];
  classification_level: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_agency: string;
}

export interface ThreatAlert {
  id: string;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  agencies_notified: string[];
  location?: {
    latitude: number;
    longitude: number;
    county: string;
    constituency?: string;
  };
  recommended_actions: string[];
  status: 'sent' | 'acknowledged' | 'resolved';
  created_at: Date;
  expires_at?: Date;
  related_intelligence_ids: string[];
  estimated_impact_kes: number;
}

export interface CreateAlertRequest {
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  agencies_to_notify: string[];
  location?: {
    latitude: number;
    longitude: number;
    county: string;
    constituency?: string;
  };
  recommended_actions: string[];
  expires_at?: string;
  related_intelligence_ids?: string[];
}

export interface CreateAlertResponse {
  success: boolean;
  data?: {
    alert_id: string;
    status: 'sent' | 'pending' | 'acknowledged';
    agencies_notified: string[];
    estimated_response_time_hours: number;
  };
  message: string;
  timestamp: string;
}

export interface WebSocketClient {
  id: string;
  user_id: string;
  agency: string;
  clearance_level: string;
  connected_at: Date;
  last_activity: Date;
}
