import { Injectable } from "@angular/core";
import { LocalStoreService } from "./local-store.service";
import { v4 as uuidv4 } from 'uuid';
import { liveQuery } from 'dexie';
import { Kpi, KpiUnit, User } from "../model/kpi.model";
import { catchError, forkJoin, from, map, Observable, of, switchMap, tap, throwError } from "rxjs";
import { LogService } from "./log.service";


@Injectable({
  providedIn: 'root'
})
export class KpiService {
    
    constructor(
        private localStoreService: LocalStoreService,
        private logService: LogService
    ) { } 


    setKpi(name: string, value: number, target: number, unit: KpiUnit): Observable<string> {
        const toStore: Kpi = {
            id: uuidv4(),
            name,
            value,
            target,
            unit
        };
        return from(this.localStoreService.kpis.put(toStore)).pipe(
            tap(() => { this.logService.logInfo(`KPI Service set: KPI ${toStore.id} created`);}),
            map(() => toStore.id),
            catchError(error => {
                this.logService.logError(`KPI Service set: Error creating KPI ${toStore.name}`, error);
                return throwError(() => error);
            })
        );
    }

    setUser(name: string, sName?: string, kpis?: Kpi[]): Observable<User> {
        const toStore: User = {
            id: uuidv4(),
            name,
            sName,
            kpis
        };
        return from(this.localStoreService.users.put(toStore)).pipe(
            tap(() => this.logService.logInfo(`KPI Service setUser: User ${toStore.id}, ${toStore.name} created`)),
            map(() => toStore),
            catchError(error => {
                this.logService.logError(`KPI Service setUser: Error creating user ${toStore.name}`, error);
                return throwError(() => error);
            })
        );
    }

    get(id: string): Observable<Kpi | undefined> {
        return from(liveQuery(() => this.localStoreService.kpis.get(id))).pipe(
            tap(kpi => {
                if (kpi) {
                    this.logService.logInfo(`KPI Service get: KPI ${id} retrieved`);
                } else {
                    this.logService.logWarning(`KPI Service get: KPI ${id} not found`);
                }
            })
        );
    }

    getUser(id: string): Observable<User | undefined> {
        return from(liveQuery(() => this.localStoreService.users.get(id))).pipe(
            tap(user => {  
                if (user) {
                    this.logService.logInfo(`KPI Service getUser: User ${id} retrieved`);
                } else {
                    this.logService.logWarning(`KPI Service getUser: User ${id} not found`);
                }
            })
        );
    }


    deleteUser(id: string): Observable<void> {
        return from(this.localStoreService.users.delete(id)).pipe(
            tap(() => this.logService.logInfo(`KPI Service deleteUser: User ${id} deleted`)),
            map(() => undefined),
            catchError((error) => {
                this.logService.logError(`KPI Service deleteUser: Error deleting user ${id}`, error);
                return throwError(() => error);
            })
        );
    }

    getAll(): Observable<Kpi[]> {
        return from(liveQuery(() => this.localStoreService.kpis.toArray()))
            .pipe(
                tap(kpis => this.logService.logInfo(`KPI Service getAll: ${kpis.length} KPIs retrieved`))
            );
    }

    updateUser(user: User | User[]): Observable<void> {
        let call: Observable<undefined> = of(undefined);
        if(Array.isArray(user)){
            call = from(this.localStoreService.users.bulkPut(user)).pipe(map(() => undefined));
        } else {
            call = from(this.localStoreService.users.put(user)).pipe( map(() => undefined) );
        }
        return call.pipe(
            tap(() => this.logService.logInfo(`KPI Service updateUser: ${Array.isArray(user) ? user.length : 1} users updated`)),
            catchError((error) => {
                this.logService.logError(`KPI Service updateUser: Error updating user ${Array.isArray(user) ? user.map(u => u.id).join(', ') : user.id}`, error);
                return throwError(() => error);
            })
        );

    }

    updateKpi(kpi: Kpi): Observable<void> {
        return from(this.localStoreService.kpis.put(kpi)).pipe(
            tap(() => this.logService.logInfo(`KPI Service updateKpi: KPI ${kpi.id}, ${kpi.name} updated`)),
            map(() => undefined),
            catchError((error) => {
                this.logService.logError(`KPI Service updateKpi: Error updating KPI ${kpi.id}`, error);
                return throwError(() => error);
            })
        );
    }

    getUsersByKpi(kpi: Kpi): Observable<User[]> {
        return this.getUsersByKpiId(kpi.id);
    }

    getUsersByKpiId(kpiId: string): Observable<User[]> {
        return this.getAllUsersSnapshot().pipe(
            map(users => users.filter(user => user.kpis?.some(userKpi => userKpi.id === kpiId)))
        );
    }


    checkIfKpiIsUsed(kpiId: string): Observable<User[]> {
        return this.getAllUsersSnapshot().pipe(
            map(users => users.filter(user => user.kpis?.some(kpi => kpi.id === kpiId)))
        );
    }

    deleteKpi(id: string, deep:boolean = false): Observable<void> {
        if(deep){
            return this.getAllUsersSnapshot().pipe(
                map(users => users.filter(user => user.kpis?.some(kpi => kpi.id === id))),
                switchMap(usersUsingKpi => {
                    const usersToUpdate = usersUsingKpi.map(user => ({
                        ...user,
                        kpis: user.kpis?.filter(kpi => kpi.id !== id)
                    }));

                    const updateUsers$ = usersToUpdate.length > 0
                        ? forkJoin(usersToUpdate.map(user => this.updateUser(user)))
                        : of([]);

                    return updateUsers$.pipe(
                        switchMap(() => this.deleteTechKpi(id))
                    );
                }),
                map(() => undefined),
                catchError((error) => {
                    this.logService.logError(`KPI Service deleteKpi: Error deleting KPI ${id}`, error);
                    return throwError(() => error);
                })

            );
        }else{
            return this.deleteTechKpi(id);
        }
    }

    private deleteTechKpi(id: string): Observable<void> {
        return from(this.localStoreService.kpis.delete(id)).pipe(
            tap(() => {
                this.logService.logInfo(`KPI Service deleteKpi: KPI ${id} deleted`);
            }),
            catchError((error) => {
                this.logService.logError(`KPI Service deleteKpi: Error deleting KPI ${id}`, error);
                return throwError(() => error);
            })
        );

    }

    getAllUsers(): Observable<User[]> {
        return from(liveQuery(() => this.localStoreService.users.toArray()))
            .pipe(
                tap(users => this.logService.logInfo(`KPI Service getAllUsers: ${users.length} users retrieved`))
            );
    }

    private getAllUsersSnapshot(): Observable<User[]> {
        return from(this.localStoreService.users.toArray()).pipe(
            tap(users => this.logService.logInfo(`KPI Service getAllUsersSnapshot: ${users.length} users retrieved`))
        );
    }
}