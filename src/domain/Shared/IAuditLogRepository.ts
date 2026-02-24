/**
 * Entry to record in the audit log (who did what, when).
 */
export type AuditLogEntry = {
  entityType: string;
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'restored';
  performedById: string;
  metadata?: Record<string, unknown>;
};

export interface IAuditLogRepository {
  /**
   * Record an audit event. Does not throw; failures should be logged but not block the main flow.
   */
  record(entry: AuditLogEntry): Promise<void>;
}
