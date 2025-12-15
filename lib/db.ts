import Dexie, { Table } from 'dexie';

export interface LogEvent {
    id?: number,
    type: string,
    payload: unknown,
    createdAt:number
}

class LogDB extends Dexie {
    logs!: Table<LogEvent, number>;

    constructor() {
        super("analytics-db");
        this.version(1).stores({
            logs: '++id, createdAt',
        })
    }
}

export const logDB = new LogDB()