export class Property {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(name: string, address: string, createdAt: Date, updatedAt: Date, id?: string) {
    this.id = id || '';
    this.name = name;
    this.address = address;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getName(): string {
    return this.name;
  }

  public getAddress(): string {
    return this.address;
  }
}
