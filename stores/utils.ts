/**
 * Shared utilities for Zustand stores
 */

import type { Notification } from './types';

/**
 * Format timestamp to relative time string
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `hace ${minutes}m`;
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${days}d`;
}

/**
 * Generate unique ID for notifications
 */
export function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if notification is recent (within last 24 hours)
 */
export function isRecentNotification(notification: Notification): boolean {
  const now = new Date();
  const diff = now.getTime() - notification.timestamp.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours < 24;
}

/**
 * Sort notifications by timestamp (newest first)
 */
export function sortNotificationsByDate(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Storage key prefix for persisted stores
 */
export const STORAGE_PREFIX = 'ecohome-';
