import Dexie, { Table } from 'dexie';


export interface StoredEvent {
id?: number;
type: string;
data: Record<string, unknown>;
createdAt: number;
}


class EventDB extends Dexie {
events!: Table<StoredEvent, number>;


constructor() {
super('event-db');
this.version(1).stores({
events: '++id, createdAt',
});
}
}


export const eventDB = new EventDB();