import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { IntelligenceReport, SubmitIntelligenceRequest, IntelligenceResponse, SearchIntelligenceRequest } from '../types/intelligence';
import { AuthenticatedRequest } from '../middleware/auth';

export class IntelligenceController {
  // Mock intelligence database (replace with real database later)
  private static intelligenceReports: IntelligenceReport[] = [];

  static async submitIntelligence(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        agency,
        classification,
        data_type,
        threat_category,
        title,
        content,
        location,
        confidence_score,
        source_reliability,
        correlation_tags
      }: SubmitIntelligenceRequest = req.body;

      // Validate required fields
      if (!agency || !classification || !data_type || !threat_category || !title || !content) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate confidence score
      if (confidence_score < 0 || confidence_score > 1) {
        res.status(400).json({
          success: false,
          message: 'Confidence score must be between 0 and 1',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Determine threat level
      const threat_level = IntelligenceController.determineThreatLevel(content, threat_category, confidence_score);

      // Create intelligence report
      const intelligenceReport: IntelligenceReport = {
        id: uuidv4(),
        agency,
        classification,
        data_type,
        threat_category,
        title,
        content,
        location,
        confidence_score,
        source_reliability,
        correlation_tags: correlation_tags || [],
        threat_level,
        created_at: new Date(),
        created_by: req.user?.user_id || 'unknown',
        status: 'ACTIVE'
      };

      // Store intelligence report
      IntelligenceController.intelligenceReports.push(intelligenceReport);

      // Simulate correlation analysis
      const correlations = IntelligenceController.findCorrelations(intelligenceReport);
      
      // Estimate economic impact
      const estimated_impact_kes = IntelligenceController.estimateEconomicImpact(threat_level, threat_category);

      // Generate recommended actions
      const recommended_actions = IntelligenceController.generateRecommendedActions(threat_level, threat_category, agency);

      // Determine agencies to notify
      const agencies_to_notify = IntelligenceController.determineAgenciesToNotify(threat_category, threat_level);

      const response: IntelligenceResponse = {
        success: true,
        data: {
          intelligence_id: intelligenceReport.id,
          status: correlations.length > 0 ? 'correlated' : 'submitted',
          correlations_found: correlations.length,
          threat_level,
          estimated_impact_kes,
          recommended_actions,
          agencies_to_notify
        },
        message: 'Intelligence report submitted successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Submit intelligence error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async searchIntelligence(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        query,
        agency,
        classification,
        threat_category,
        county,
        date_from,
        date_to,
        threat_level,
        limit = 50,
        offset = 0
      } = req.query;

      let filteredReports = [...IntelligenceController.intelligenceReports];

      // Apply filters with type checking
      if (query && typeof query === 'string') {
        filteredReports = filteredReports.filter(report => 
          report.title.toLowerCase().includes(query.toLowerCase()) ||
          report.content.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (agency && typeof agency === 'string') {
        filteredReports = filteredReports.filter(report => report.agency === agency);
      }

      if (classification && typeof classification === 'string') {
        filteredReports = filteredReports.filter(report => report.classification === classification);
      }

      if (threat_category && typeof threat_category === 'string') {
        filteredReports = filteredReports.filter(report => report.threat_category === threat_category);
      }

      if (county && typeof county === 'string') {
        filteredReports = filteredReports.filter(report => 
          report.location?.county?.toLowerCase() === county.toLowerCase()
        );
      }

      if (threat_level && typeof threat_level === 'string') {
        filteredReports = filteredReports.filter(report => report.threat_level === threat_level);
      }

      // Apply pagination
      const limitNum = typeof limit === 'string' ? parseInt(limit) : 50;
      const offsetNum = typeof offset === 'string' ? parseInt(offset) : 0;
      
      const total_count = filteredReports.length;
      const paginatedReports = filteredReports.slice(offsetNum, offsetNum + limitNum);

      res.status(200).json({
        success: true,
        data: {
          intelligence_reports: paginatedReports,
          total_count,
          page: Math.floor(offsetNum / limitNum) + 1,
          limit: limitNum
        },
        message: 'Intelligence reports retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search intelligence error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async getIntelligenceById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const report = IntelligenceController.intelligenceReports.find(r => r.id === id);

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Intelligence report not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check clearance level access
      const userClearance = req.user?.clearance_level;
      if (!IntelligenceController.hasAccessToClassification(userClearance, report.classification)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient clearance level',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          intelligence: report,
          correlations: IntelligenceController.findCorrelations(report)
        },
        message: 'Intelligence report retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get intelligence error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Helper methods
  private static determineThreatLevel(content: string, category: string, confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalKeywords = ['terrorism', 'bomb', 'attack', 'assassination', 'coup'];
    const highKeywords = ['smuggling', 'corruption', 'money laundering', 'cybercrime'];
    const mediumKeywords = ['fraud', 'theft', 'illegal', 'suspicious'];

    const lowerContent = content.toLowerCase();
    
    if (criticalKeywords.some(keyword => lowerContent.includes(keyword)) && confidence > 0.8) {
      return 'CRITICAL';
    } else if (highKeywords.some(keyword => lowerContent.includes(keyword)) && confidence > 0.7) {
      return 'HIGH';
    } else if (mediumKeywords.some(keyword => lowerContent.includes(keyword)) && confidence > 0.6) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  private static findCorrelations(report: IntelligenceReport): IntelligenceReport[] {
    return IntelligenceController.intelligenceReports.filter(existing => 
      existing.id !== report.id &&
      (existing.threat_category === report.threat_category ||
       existing.location?.county === report.location?.county ||
       existing.correlation_tags.some(tag => report.correlation_tags.includes(tag)))
    );
  }

  private static estimateEconomicImpact(threatLevel: string, category: string): number {
    const baseImpacts: Record<string, number> = {
      'terrorism': 500000000,
      'corruption': 100000000,
      'cybercrime': 50000000,
      'smuggling': 25000000,
      'fraud': 10000000
    };

    const multipliers: Record<string, number> = {
      'CRITICAL': 5,
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1
    };

    const baseImpact = baseImpacts[category] || 5000000;
    const multiplier = multipliers[threatLevel] || 1;

    return baseImpact * multiplier;
  }

  private static generateRecommendedActions(threatLevel: string, category: string, agency: string): string[] {
    const actions = [];

    if (threatLevel === 'CRITICAL') {
      actions.push('Immediate deployment of response teams');
      actions.push('Coordinate with all relevant agencies');
      actions.push('Activate emergency protocols');
    } else if (threatLevel === 'HIGH') {
      actions.push('Enhanced surveillance and monitoring');
      actions.push('Coordinate with partner agencies');
      actions.push('Prepare response teams');
    } else if (threatLevel === 'MEDIUM') {
      actions.push('Continue monitoring situation');
      actions.push('Gather additional intelligence');
    } else {
      actions.push('File for future reference');
      actions.push('Monitor for pattern development');
    }

    return actions;
  }

  private static determineAgenciesToNotify(category: string, threatLevel: string): string[] {
    const agencies = [];

    if (threatLevel === 'CRITICAL' || threatLevel === 'HIGH') {
      agencies.push('NIS');
    }

    switch (category) {
      case 'terrorism':
        agencies.push('NIS', 'DCI', 'KDF');
        break;
      case 'corruption':
        agencies.push('EACC', 'DCI', 'KRA');
        break;
      case 'cybercrime':
        agencies.push('DCI', 'NIS');
        break;
      case 'smuggling':
        agencies.push('KRA', 'DCI', 'KDF');
        break;
      default:
        agencies.push('DCI');
    }

    return [...new Set(agencies)];
  }

  private static hasAccessToClassification(userClearance: string | undefined, reportClassification: string): boolean {
    const clearanceLevels: Record<string, number> = {
      'UNCLASSIFIED': 1,
      'RESTRICTED': 2,
      'CONFIDENTIAL': 3,
      'SECRET': 4
    };

    const userLevel = clearanceLevels[userClearance || ''] || 0;
    const requiredLevel = clearanceLevels[reportClassification] || 0;

    return userLevel >= requiredLevel;
  }
}
