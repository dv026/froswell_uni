import { WellLoggingEnum } from '../enums/wellLoggingEnum';

export class LoggingSettingModel {
    public wellId: number;
    public param: WellLoggingEnum;
    public value: number;

    constructor(wellId: number, param: WellLoggingEnum, value: number) {
        this.wellId = wellId;
        this.param = param;
        this.value = value;
    }
}
