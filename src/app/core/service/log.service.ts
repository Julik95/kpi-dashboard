import { Inject, Injectable } from "@angular/core";
import { LogLevel } from "../model/app.model";
import { LOG_LEVEL } from "../utils/app.utils";

@Injectable({
  providedIn: 'root'
})
export class LogService{

    constructor(@Inject(LOG_LEVEL) private logLevel: LogLevel) { }

    public logInfo(message: string): void {
        if(this.logLevel === LogLevel.INFO || this.logLevel === LogLevel.WARNING || this.logLevel === LogLevel.ERROR){ 
            console.info(`[INFO] ${new Date().toISOString()}: ${message}`);
        }   
    }

    public logError(message: string, error?:any): void {
        if(this.logLevel === LogLevel.ERROR || this.logLevel === LogLevel.WARNING){
            console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
            if(error){
                console.error(error);
            }
        }
    }

    public logWarning(message: string): void {
        if(this.logLevel === LogLevel.WARNING){
            console.warn(`[WARNING] ${new Date().toISOString()}: ${message}`);
        }
    }
}
