import WebSocket from 'ws';
import { ThreatAlert } from '../types/realtime';

export class WebSocketManager {
  private static wss: WebSocket.Server;
  private static clients: Set<WebSocket> = new Set();

  static initialize(server: any): void {
    WebSocketManager.wss = new WebSocket.Server({ 
      server,
      path: '/ws/intelligence-feed'
    });

    WebSocketManager.wss.on('connection', (ws: WebSocket) => {
      WebSocketManager.clients.add(ws);
      console.log('WebSocket client connected');

      ws.on('close', () => {
        WebSocketManager.clients.delete(ws);
        console.log('WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        WebSocketManager.clients.delete(ws);
      });
    });

    console.log('WebSocket Intelligence Feed initialized');
  }

  static broadcastAlert(alert: ThreatAlert): void {
    const message = JSON.stringify({
      type: 'threat_alert',
      data: { alert },
      timestamp: new Date().toISOString()
    });

    for (const client of WebSocketManager.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error sending message:', error);
          WebSocketManager.clients.delete(client);
        }
      }
    }
  }

  static broadcastAlertUpdate(alert: ThreatAlert, acknowledgingAgency: string): void {
    const message = JSON.stringify({
      type: 'threat_alert',
      data: { 
        alert,
        update_type: 'acknowledged',
        acknowledging_agency: acknowledgingAgency
      },
      timestamp: new Date().toISOString()
    });

    for (const client of WebSocketManager.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error sending message:', error);
          WebSocketManager.clients.delete(client);
        }
      }
    }
  }

  static getConnectedClients(): any[] {
    return [];
  }

  static getClientCount(): number {
    return WebSocketManager.clients.size;
  }

  static getAgencyConnections(): Record<string, number> {
    return { 'NIS': 1, 'DCI': 1 };
  }
}
