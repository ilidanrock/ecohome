export interface HasherRepository {
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}