import { Injectable } from "@angular/core";
import Dexie, { Table } from 'dexie';
import { KeyValuePair, Log } from "../model/app.model";
import { Kpi, User } from "../model/kpi.model";


@Injectable({
  providedIn: 'root'
})
export class LocalStoreService extends Dexie {

    public logs!: Table<Log, number>;
    public kpis!: Table<Kpi, string>;
    public configs!: Table<KeyValuePair, string>;
    public users!: Table<User, string>;

    constructor() {
        super('KPIDashboardDB');

        this.version(1).stores({
            configs: 'key',
            kpis: 'id',
            logs: '++id, timestamp',
            users: 'id'
        });

        this.configs = this.table('configs');
        this.kpis = this.table('kpis');
        this.logs = this.table('logs');
        this.users = this.table('users');

    }
}