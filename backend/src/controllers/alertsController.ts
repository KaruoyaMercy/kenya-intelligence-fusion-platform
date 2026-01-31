import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ThreatAlert, CreateAlertRequest, CreateAlertResponse } from '../types/realtime';
import { AuthenticatedRequest } from '../middleware/auth';
import { WebSocketManager } from '../services/websocketManager';

export class AlertsController {
  // Mock alerts database
  private static alerts: ThreatAlert[] = [];

  static async createAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        threat_level,
        title,
        description,
        agencies_to_notify,
        location,
        recommended_actions,
        expires_at,
        related_intelligence_ids
      }: CreateAlertRequest = req.body;

      // Validate required fields
      if (!threat_level || !title || !description || !agencies_to_notify || agencies_to_notify.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Estimate economic impact based on threat level
      const estimated_impact_kes = AlertsController.estimateAlertImpact(threat_level, description);

      // Create alert
      const alert: ThreatAlert = {
        id: uuidv4(),
        threat_level,
        title,
        description,
        agencies_notified: agencies_to_notify,
        location,
        recommended_actions: recommended_actions || [],
        status: 'sent',
        created_at: new Date(),
        expires_at: expires_at ? new Date(expires_at) : undefined,
        related_intelligence_ids: related_intelligence_ids || [],
        estimated_impact_kes
      };

      // Store alert
      AlertsController.alerts.push(alert);

      // Broadcast alert via WebSocket
      WebSocketManager.broadcastAlert(alert);

      // Estimate response time
      const estimated_response_time_hours = AlertsController.estimateResponseTime(threat_level, agencies_to_notify);

      const response: CreateAlertResponse = {
        success: true,
        data: {
          alert_id: alert.id,
          status: 'sent',
          agencies_notified: agencies_to_notify,
          estimated_response_time_hours
        },
        message: 'Alert created and broadcast successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        agency,
        threat_level,
        status,
        date_from,
        date_to,
        limit = 50,
        offset = 0
      } = req.query;

      let filteredAlerts = [...AlertsController.alerts];

      // Apply filters
      if (agency && typeof agency === 'string') {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.agencies_notified.includes(agency)
        );
      }

      if (threat_level && typeof threat_level === 'string') {
        filteredAlerts = filteredAlerts.filter(alert => alert.threat_level === threat_level);
      }

      if (status && typeof status === 'string') {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
      }

      if (date_from && typeof date_from === 'string') {
        const fromDate = new Date(date_from);
        filteredAlerts = filteredAlerts.filter(alert => alert.created_at >= fromDate);
      }

      if (date_to && typeof date_to === 'string') {
        const toDate = new Date(date_to);
        filteredAlerts = filteredAlerts.filter(alert => alert.created_at <= toDate);
      }

      // Apply pagination
      const limitNum = typeof limit === 'string' ? parseInt(limit) : Number(limit);
      const offsetNum = typeof offset === 'string' ? parseInt(offset) : Number(offset);
      
      const total_count = filteredAlerts.length;
      const paginatedAlerts = filteredAlerts.slice(offsetNum, offsetNum + limitNum);

      res.status(200).json({
        success: true,
        data: {
          alerts: paginatedAlerts,
          total_count
        },
        message: 'Alerts retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async acknowledgeAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { response_notes } = req.body;

      const alert = AlertsController.alerts.find(a => a.id === id);

      if (!alert) {
        res.status(404).json({
          success: false,
          message: 'Alert not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Update alert status
      alert.status = 'acknowledged';

      // Broadcast acknowledgment
      WebSocketManager.broadcastAlertUpdate(alert, req.user?.agency || 'unknown');

      res.status(200).json({
        success: true,
        data: {
          alert_id: id,
          status: 'acknowledged',
          acknowledged_by: req.user?.agency,
          acknowledged_at: new Date().toISOString()
        },
        message: 'Alert acknowledged successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Helper methods
  private static estimateAlertImpact(threatLevel: string, description: string): number {
    const baseImpacts: Record<string, number> = {
      'CRITICAL': 1000000000, // KES 1B
      'HIGH': 500000000,      // KES 500M
      'MEDIUM': 100000000,    // KES 100M
      'LOW': 25000000         // KES 25M
    };

    let impact = baseImpacts[threatLevel] || 25000000;

    // Adjust based on description keywords
    const highImpactKeywords = ['terrorism', 'bomb', 'assassination', 'coup'];
    const mediumImpactKeywords = ['corruption', 'smuggling', 'cybercrime'];
    
    const lowerDescription = description.toLowerCase();
    
    if (highImpactKeywords.some(keyword => lowerDescription.includes(keyword))) {
      impact *= 2;
    } else if (mediumImpactKeywords.some(keyword => lowerDescription.includes(keyword))) {
      impact *= 1.5;
    }

    return Math.round(impact);
  }

  private static estimateResponseTime(threatLevel: string, agencies: string[]): number {
    const baseTimes: Record<string, number> = {
      'CRITICAL': 0.5,  // 30 minutes
      'HIGH': 2,        // 2 hours
      'MEDIUM': 8,      // 8 hours
      'LOW': 24         // 24 hours
    };

    let responseTime = baseTimes[threatLevel] || 24;

    // Faster response with more agencies involved
    if (agencies.length > 3) {
      responseTime *= 0.7;
    } else if (agencies.length > 1) {
      responseTime *= 0.85;
    }

    return Math.round(responseTime * 10) / 10; // Round to 1 decimal place
  }
}
