
import React, { useState, useEffect } from 'react';
import { Bell, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: 'Impossible de charger les notifications.',
      });
    } else {
      setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const handleMarkAsRead = async (id) => {
    const originalNotifications = [...notifications];
    const updatedNotifications = notifications.map(n => n.id === id ? {...n, is_read: true} : n);
    setNotifications(updatedNotifications);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      setNotifications(originalNotifications);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de marquer la notification comme lue.',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:bg-gray-100 relative flex-shrink-0"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-500 text-white rounded-full border-2 border-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune notification</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b flex items-start gap-3 ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-2 text-center border-t">
          <Button variant="link" size="sm" className="w-full">
            Voir toutes les notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
