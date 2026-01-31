import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  ThreatCorrelation, 
  ThreatPrediction, 
  CorrelationAnalysisRequest, 
  CorrelationAnalysisResponse,
  NetworkAnalysis 
} from '../types/correlation';
import { IntelligenceReport } from '../types/intelligence';
import { AuthenticatedRequest } from '../middleware/auth';

export class CorrelationController {
  // Mock correlation database
  private static correlations: ThreatCorrelation[] = [];
  private static predictions: ThreatPrediction[] = [];

  static async analyzeThreats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      const {
        intelligence_ids,
        analysis_type = 'correlation',
        time_horizon_hours = 72,
        geographic_scope,
        correlation_threshold = 0.7
      } = req.body;

      // Validate input
      if (!intelligence_ids || intelligence_ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Intelligence IDs are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Mock intelligence reports for demo
      const mockReports: IntelligenceReport[] = [
        {
          id: intelligence_ids[0] || 'mock-1',
          agency: 'NIS',
          classification: 'SECRET',
          data_type: 'HUMINT',
          threat_category: 'terrorism',
          title: 'Mock Intelligence Report',
          content: 'Mock content for correlation analysis',
          confidence_score: 0.85,
          source_reliability: 'A',
          correlation_tags: ['terrorism', 'nairobi'],
          threat_level: 'HIGH',
          created_at: new Date(),
          created_by: req.user?.user_id || 'unknown',
          status: 'ACTIVE'
        }
      ];

      // Perform correlation analysis
      const correlations = CorrelationController.performCorrelationAnalysis(mockReports, correlation_threshold);

      // Generate threat predictions
      const predictions = CorrelationController.generateThreatPredictions(mockReports, correlations, time_horizon_hours);

      // Perform network analysis if requested
      let network_analysis: NetworkAnalysis | undefined;
      if (analysis_type === 'network' || analysis_type === 'comprehensive') {
        network_analysis = CorrelationController.performNetworkAnalysis(mockReports, correlations);
      }

      // Determine overall threat level
      const threat_level = CorrelationController.determineOverallThreatLevel(correlations, predictions);

      // Calculate confidence score
      const confidence_score = CorrelationController.calculateConfidenceScore(correlations, predictions);

      // Generate recommendations
      const recommended_actions = CorrelationController.generateRecommendations(threat_level, correlations, predictions);

      // Determine agencies to notify
      const agencies_to_notify = CorrelationController.determineAgenciesToNotify(threat_level, mockReports);

      // Estimate economic impact
      const estimated_impact_kes = CorrelationController.estimateEconomicImpact(threat_level, correlations, predictions);

      const processing_time_ms = Date.now() - startTime;

      const response: CorrelationAnalysisResponse = {
        success: true,
        data: {
          analysis_id: uuidv4(),
          threat_level,
          confidence_score,
          correlations,
          predictions,
          network_analysis,
          recommended_actions,
          agencies_to_notify,
          estimated_impact_kes,
          processing_time_ms
        },
        message: 'Threat analysis completed successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Threat analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async getPredictions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        county,
        threat_type,
        min_confidence = 0.5,
        time_range_hours = 168,
        limit = 20
      } = req.query;

      let filteredPredictions = [...CorrelationController.predictions];

      // Apply filters with type checking
      if (county && typeof county === 'string') {
        filteredPredictions = filteredPredictions.filter(p => 
          p.predicted_location.county.toLowerCase() === county.toLowerCase()
        );
      }

      if (threat_type && typeof threat_type === 'string') {
        filteredPredictions = filteredPredictions.filter(p => 
          p.threat_type.toLowerCase().includes(threat_type.toLowerCase())
        );
      }

      const minConf = typeof min_confidence === 'string' ? parseFloat(min_confidence) : Number(min_confidence);
      filteredPredictions = filteredPredictions.filter(p => p.prediction_confidence >= minConf);

      // Apply limit
      const limitNum = typeof limit === 'string' ? parseInt(limit) : Number(limit);
      filteredPredictions = filteredPredictions.slice(0, limitNum);

      res.status(200).json({
        success: true,
        data: {
          predictions: filteredPredictions,
          total_predictions: filteredPredictions.length
        },
        message: 'Predictions retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get predictions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Simplified AI Correlation Methods
  private static performCorrelationAnalysis(reports: IntelligenceReport[], threshold: number): ThreatCorrelation[] {
    const correlations: ThreatCorrelation[] = [];

    if (reports.length >= 2) {
      const correlation: ThreatCorrelation = {
        id: uuidv4(),
        primary_intelligence_id: reports[0].id,
        correlated_intelligence_ids: [reports[1]?.id || 'mock-2'],
        correlation_type: 'semantic',
        correlation_score: 0.85,
        correlation_method: 'AI_MULTI_DIMENSIONAL_ANALYSIS',
        threat_level: 'HIGH',
        predicted_impact_kes: 250000000,
        recommended_actions: [
          'Enhanced surveillance and monitoring',
          'Coordinate with partner agencies',
          'Prepare response teams'
        ],
        agencies_to_notify: ['NIS', 'DCI', 'KDF'],
        created_at: new Date()
      };

      correlations.push(correlation);
    }

    return correlations;
  }

  private static generateThreatPredictions(
    reports: IntelligenceReport[],
    correlations: ThreatCorrelation[],
    timeHorizon: number
  ): ThreatPrediction[] {
    const predictions: ThreatPrediction[] = [];

    if (correlations.length > 0 && correlations[0].correlation_score > 0.7) {
      const prediction: ThreatPrediction = {
        id: uuidv4(),
        threat_type: reports[0]?.threat_category || 'terrorism',
        predicted_location: {
          county: reports[0]?.location?.county || 'Nairobi',
          coordinates: [reports[0]?.location?.latitude || -1.2921, reports[0]?.location?.longitude || 36.8219],
          confidence_radius_km: 15
        },
        prediction_confidence: 0.82,
        predicted_timeframe: `${timeHorizon} hours`,
        predicted_impact_kes: 375000000,
        model_version: 'KENYA_AI_v1.0',
        input_features: {
          historical_patterns: 0.8,
          seasonal_factors: 0.6,
          economic_indicators: 0.7,
          social_tension_index: 0.5,
          cross_border_activity: 0.4
        },
        status: 'pending',
        created_at: new Date(),
        last_updated: new Date()
      };

      predictions.push(prediction);
    }

    return predictions;
  }

  private static performNetworkAnalysis(
    reports: IntelligenceReport[],
    correlations: ThreatCorrelation[]
  ): NetworkAnalysis {
    return {
      network_id: uuidv4(),
      network_type: (reports[0]?.threat_category as any) || 'terrorism',
      key_entities: [
        {
          entity_id: 'entity-1',
          entity_type: 'person',
          name: 'Suspect Alpha',
          centrality_score: 0.85,
          threat_level: 'HIGH',
          connections: 12
        },
        {
          entity_id: 'entity-2',
          entity_type: 'organization',
          name: 'Shell Company Beta',
          centrality_score: 0.72,
          threat_level: 'MEDIUM',
          connections: 8
        }
      ],
      connections: [
        {
          source_id: 'entity-1',
          target_id: 'entity-2',
          connection_type: 'financial',
          strength: 0.9,
          evidence_count: 5
        }
      ],
      estimated_value_kes: 150000000,
      agencies_tracking: ['NIS', 'DCI', 'FRC'],
      vulnerability_points: ['Communication intercepts', 'Financial transactions', 'Border crossings'],
      disruption_strategies: ['Coordinated arrests', 'Asset freezing', 'Communication monitoring']
    };
  }

  private static determineOverallThreatLevel(
    correlations: ThreatCorrelation[],
    predictions: ThreatPrediction[]
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (correlations.length === 0 && predictions.length === 0) return 'LOW';

    const maxCorrelationScore = correlations.reduce((max, corr) => Math.max(max, corr.correlation_score), 0);
    const maxPredictionConfidence = predictions.reduce((max, pred) => Math.max(max, pred.prediction_confidence), 0);

    const maxScore = Math.max(maxCorrelationScore, maxPredictionConfidence);

    if (maxScore > 0.9) return 'CRITICAL';
    if (maxScore > 0.7) return 'HIGH';
    if (maxScore > 0.5) return 'MEDIUM';
    return 'LOW';
  }

  private static calculateConfidenceScore(
    correlations: ThreatCorrelation[],
    predictions: ThreatPrediction[]
  ): number {
    if (correlations.length === 0 && predictions.length === 0) return 0;

    const avgCorrelationScore = correlations.length > 0 
      ? correlations.reduce((sum, corr) => sum + corr.correlation_score, 0) / correlations.length 
      : 0;
    
    const avgPredictionScore = predictions.length > 0 
      ? predictions.reduce((sum, pred) => sum + pred.prediction_confidence, 0) / predictions.length 
      : 0;
    
    return Math.min((avgCorrelationScore + avgPredictionScore) / 2, 1.0);
  }

  private static generateRecommendations(
    threatLevel: string,
    correlations: ThreatCorrelation[],
    predictions: ThreatPrediction[]
  ): string[] {
    const actions = [];

    switch (threatLevel) {
      case 'CRITICAL':
        actions.push('IMMEDIATE: Activate emergency response protocols');
        actions.push('IMMEDIATE: Deploy all available resources');
        actions.push('IMMEDIATE: Coordinate with all relevant agencies');
        break;
      case 'HIGH':
        actions.push('URGENT: Enhanced surveillance and monitoring');
        actions.push('URGENT: Prepare response teams');
        actions.push('URGENT: Increase inter-agency coordination');
        break;
      case 'MEDIUM':
        actions.push('Monitor situation closely');
        actions.push('Gather additional intelligence');
        actions.push('Prepare contingency plans');
        break;
      default:
        actions.push('Continue routine monitoring');
        actions.push('File for pattern analysis');
    }

    return actions;
  }

  private static determineAgenciesToNotify(
    threatLevel: string,
    reports: IntelligenceReport[]
  ): string[] {
    const agencies = new Set<string>();

    if (threatLevel === 'CRITICAL' || threatLevel === 'HIGH') {
      agencies.add('NIS');
    }

    reports.forEach(report => {
      switch (report.threat_category) {
        case 'terrorism':
          agencies.add('NIS');
          agencies.add('DCI');
          agencies.add('KDF');
          break;
        case 'corruption':
          agencies.add('EACC');
          agencies.add('DCI');
          agencies.add('KRA');
          break;
        case 'cybercrime':
          agencies.add('DCI');
          agencies.add('NIS');
          break;
        case 'smuggling':
          agencies.add('KRA');
          agencies.add('DCI');
          agencies.add('KDF');
          break;
        default:
          agencies.add('DCI');
      }
    });

    return Array.from(agencies);
  }

  private static estimateEconomicImpact(
    threatLevel: string,
    correlations: ThreatCorrelation[],
    predictions: ThreatPrediction[]
  ): number {
    const baseImpact = correlations.reduce((sum, corr) => sum + corr.predicted_impact_kes, 0);
    const predictionImpact = predictions.reduce((sum, pred) => sum + pred.predicted_impact_kes, 0);

    const multipliers: Record<string, number> = {
      'CRITICAL': 3,
      'HIGH': 2,
      'MEDIUM': 1.5,
      'LOW': 1
    };

    const multiplier = multipliers[threatLevel] || 1;
    return Math.round((baseImpact + predictionImpact) * multiplier);
  }
}
