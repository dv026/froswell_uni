export class WellCommentModel {
    public id?: number;
    public oilFieldId: number;
    public productionObjectId: number;
    public wellId: number;
    public wellName?: string;
    public plastId?: number;
    public dt?: Date;
    public comment: string;
    public author: string;
    public fileName?: string;
    public file?: FormData;
}
