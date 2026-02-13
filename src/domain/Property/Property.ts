export class Property {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;

  constructor(
    name: string,
    address: string,
    createdAt: Date,
    updatedAt: Date,
    id?: string,
    deletedAt?: Date | null,
    createdById?: string | null,
    updatedById?: string | null,
    deletedById?: string | null
  ) {
    this.id = id || '';
    this.name = name;
    this.address = address;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt ?? null;
    this.createdById = createdById ?? null;
    this.updatedById = updatedById ?? null;
    this.deletedById = deletedById ?? null;
  }

  public getName(): string {
    return this.name;
  }

  public getAddress(): string {
    return this.address;
  }
}
