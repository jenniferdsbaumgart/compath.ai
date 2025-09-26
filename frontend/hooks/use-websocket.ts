import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useWebSocketContext } from '@/components/providers/websocket-provider';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export interface WebSocketHook {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export function useWebSocket(): WebSocketHook {
  const { socket, isConnected } = useWebSocketContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    // Notification events
    const handleNotification = (data: Omit<Notification, 'timestamp'>) => {
      const notification: Notification = {
        ...data,
        timestamp: new Date(),
      };

      setNotifications(prev => [notification, ...prev]);

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    };

    const handleCoinsUpdated = (data: { coins: number; reason: string }) => {
      const notification: Notification = {
        id: `coins_${Date.now()}`,
        type: 'success',
        title: 'Moedas Atualizadas',
        message: `Você recebeu ${data.coins} moedas! Motivo: ${data.reason}`,
        timestamp: new Date(),
        data,
      };

      setNotifications(prev => [notification, ...prev]);

      toast({
        title: notification.title,
        description: notification.message,
        variant: 'default',
      });
    };

    const handleReportGenerated = (data: { reportId: string; title: string }) => {
      const notification: Notification = {
        id: `report_${Date.now()}`,
        type: 'success',
        title: 'Relatório Pronto',
        message: `Seu relatório "${data.title}" foi gerado com sucesso!`,
        timestamp: new Date(),
        data,
      };

      setNotifications(prev => [notification, ...prev]);

      toast({
        title: notification.title,
        description: notification.message,
        variant: 'default',
      });
    };

    const handleSystemMaintenance = (data: { message: string; estimatedDowntime?: string }) => {
      const notification: Notification = {
        id: `maintenance_${Date.now()}`,
        type: 'warning',
        title: 'Manutenção Programada',
        message: data.message + (data.estimatedDowntime ? ` Tempo estimado: ${data.estimatedDowntime}` : ''),
        timestamp: new Date(),
        data,
      };

      setNotifications(prev => [notification, ...prev]);

      toast({
        title: notification.title,
        description: notification.message,
        variant: 'default',
      });
    };

    // Register event listeners
    socket.on('notification', handleNotification);
    socket.on('user_coins_updated', handleCoinsUpdated);
    socket.on('report_generated', handleReportGenerated);
    socket.on('system_maintenance', handleSystemMaintenance);

    // Cleanup
    return () => {
      socket.off('notification', handleNotification);
      socket.off('user_coins_updated', handleCoinsUpdated);
      socket.off('report_generated', handleReportGenerated);
      socket.off('system_maintenance', handleSystemMaintenance);
    };
  }, [socket, toast]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, type: 'info' as const } // Mark as read by changing type
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    socket,
    isConnected,
    notifications,
    markAsRead,
    clearNotifications,
  };
}
