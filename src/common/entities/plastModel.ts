import i18n from 'i18next';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export class PlastModel {
    public id: number;
    public name: string;

    public constructor(id: number, name: string, objectId: number, objectName: string, includeObject: boolean) {
        this.id = id;
        this.name = includeObject ? `${name} (${objectName})` : name;
    }

    public static byObject = (): PlastModel =>
        new PlastModel(null, i18n.t(dict.common.dataBy.object), null, null, false);
}
