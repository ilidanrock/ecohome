import { PrismaClient } from '@prisma/client';
import type { IAuditLogRepository, AuditLogEntry } from '@/src/domain/Shared/IAuditLogRepository';
import { logger } from '@/lib/logger';

export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private prisma: PrismaClient) {}

  async record(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          performedById: entry.performedById,
          metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
        },
      });
    } catch (error) {
      logger.error('AuditLog.record failed', {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        error: error instanceof Error ? error.message : String(error),
      });
      // Do not rethrow; audit failure should not block the main flow
    }
  }
}
