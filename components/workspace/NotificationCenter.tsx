'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceNotification, NotificationType } from '@/packages/types/src';

interface NotificationCenterProps {
  workspaceId?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  workspaceId = 'ws_default_01'
}) => {
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspace/notifications?workspaceId=${workspaceId}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await fetchNotifications();
    };
    run();
    return () => {
      active = false;
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/workspace/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const typeColor = (type: NotificationType) => {
    switch (type) {
      case 'Success': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Error': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'Warning': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Approval': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Execution': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      default: return 'text-zinc-300 border-zinc-700 bg-zinc-800/40';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 overflow-hidden text-zinc-200">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
            <span className="font-semibold text-xs text-zinc-100 flex items-center gap-2">
              Notification Center
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-200 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="py-6 text-center text-xs text-zinc-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">No notifications.</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`p-2.5 rounded border text-xs cursor-pointer transition ${n.read ? 'bg-zinc-950/40 border-zinc-850 opacity-70' : 'bg-zinc-950 border-zinc-750'} hover:border-zinc-700`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-zinc-100">{n.title}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] rounded border ${typeColor(n.type)}`}>
                      {n.type}
                    </span>
                  </div>
                  <p className="text-zinc-400 mt-1 leading-normal text-[11px]">{n.message}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!n.read && <span className="text-emerald-400 font-medium">Mark as read</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
