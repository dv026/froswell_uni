export class OptimisationSkinFactorModel {
    public wellId: number;

    public plastId: number;

    public value: number;

    public defaultValue: number;

    public startDate: Date;

    public endDate: Date;

    public spike: number;

    public constructor(
        wellId: number,
        plastId: number,
        value: number,
        defaultValue: number,
        startDate: Date,
        endDate: Date,
        spike: number
    ) {
        this.wellId = wellId;
        this.plastId = plastId;
        this.value = value;
        this.defaultValue = defaultValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.spike = spike;
    }
}
