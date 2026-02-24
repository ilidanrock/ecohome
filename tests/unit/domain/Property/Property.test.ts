import { describe, it, expect } from 'vitest';
import { Property } from '@/src/domain/Property/Property';

describe('Property', () => {
  const now = new Date('2025-01-15T10:00:00Z');

  it('creates instance with required fields', () => {
    const p = new Property('Casa Norte', 'Av. Principal 123', now, now);
    expect(p.id).toBe('');
    expect(p.name).toBe('Casa Norte');
    expect(p.address).toBe('Av. Principal 123');
    expect(p.createdAt).toBe(now);
    expect(p.updatedAt).toBe(now);
    expect(p.deletedAt).toBeNull();
    expect(p.createdById).toBeNull();
    expect(p.updatedById).toBeNull();
    expect(p.deletedById).toBeNull();
  });

  it('creates instance with id and audit fields', () => {
    const p = new Property(
      'Edificio A',
      'Calle 1',
      now,
      now,
      'prop-1',
      null,
      'user-1',
      'user-1',
      null
    );
    expect(p.id).toBe('prop-1');
    expect(p.name).toBe('Edificio A');
    expect(p.createdById).toBe('user-1');
    expect(p.updatedById).toBe('user-1');
    expect(p.deletedById).toBeNull();
  });

  it('creates instance with deletedAt and deletedById', () => {
    const deletedAt = new Date('2025-02-01');
    const p = new Property('X', 'Y', now, now, 'id-1', deletedAt, 'u1', 'u1', 'u2');
    expect(p.deletedAt).toEqual(deletedAt);
    expect(p.deletedById).toBe('u2');
  });

  it('getName returns name', () => {
    const p = new Property('Mi Propiedad', 'Addr', now, now);
    expect(p.getName()).toBe('Mi Propiedad');
  });

  it('getAddress returns address', () => {
    const p = new Property('Name', 'Calle Secundaria 456', now, now);
    expect(p.getAddress()).toBe('Calle Secundaria 456');
  });
});
