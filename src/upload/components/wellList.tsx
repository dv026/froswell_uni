import React, { FC } from 'react';

import { isNil, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilState, useRecoilValue } from 'recoil';

import { rowsUpload } from '../../common/components/wellRoster/dataManager';
import { WellRoster } from '../../common/components/wellRoster/wellRoster';
import { KeyValue } from '../../common/entities/keyValue';
import { WellBrief } from '../../common/entities/wellBrief';
import { WellModel } from '../../common/entities/wellModel';
import { createOilField } from '../gateways/gateway';
import { selectedOilField } from '../store/currentOilfield';
import { oilFieldsSelector } from '../store/oilFields';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const WellList = () => {
    const { t } = useTranslation();

    const oilFields = useRecoilValue(oilFieldsSelector);

    const [oilField, setOilField] = useRecoilState(selectedOilField);

    const refreshOilFields = useRecoilRefresher_UNSTABLE(oilFieldsSelector);

    if (isNil(oilFields)) {
        return null;
    }

    const clickHandler = well => {
        setOilField(new KeyValue(well.oilFieldId, null));
    };

    const addOilfield = async () => {
        const { data } = await createOilField(t(dict.common.oilfield));

        setOilField(new KeyValue(data, `${name} ${data}`));

        refreshOilFields();
    };

    return (
        <WellRoster
            wells={map(
                (it: KeyValue) => ({ oilFieldId: it.id, oilFieldName: it.name, name: it.name } as WellModel),
                oilFields
            )}
            clicks={{
                oilfield: clickHandler,
                addOilfield: addOilfield
            }}
            makeRows={rowsUpload}
            selected={[new WellBrief(oilField.id)]}
            showActions={true}
            title={t(dict.wellList.oilfield)}
            expandOnlySelectedNode
        />
    );
};
