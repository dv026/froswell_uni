import React, { FC } from 'react';

import { Button, ButtonGroup, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { find, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { FormField } from '../../../../common/components/formField';
import { InputNumber } from '../../../../common/components/inputNumber';
import { round0, round2 } from '../../../../common/helpers/math';
import { GeologicalReservesCalculationParams } from '../../../entities/proxyMap/calculationSettingsModel';
import { useProxyMapMutations } from '../../../store/map/proxyMapMutations';
import { GeologicalReserveType, getLabel } from '../enums/geologicalReserveType';
import {
    currentVolumeReservoirState,
    geologicalReservesByType,
    geologicalReservesIsLoadingState,
    geologicalReservesSettings
} from '../store/geologicalReserves';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const tabs = [GeologicalReserveType.All, GeologicalReserveType.LicenseBorder, GeologicalReserveType.AdaptationBorder];

const isEmptyGeoReserves = (item: GeologicalReservesCalculationParams): boolean => {
    return item &&
        item.volumePoreReservoir &&
        item.geologicalReserves &&
        item.porosity &&
        item.permeability &&
        item.oilSaturation
        ? false
        : true;
};

export const GeologicalReserves = () => {
    const reserves = useRecoilValue(geologicalReservesSettings);

    return (
        <Tabs isLazy>
            <TabList>
                {map(
                    it => (
                        <Tab key={it} isDisabled={isEmptyGeoReserves(find(x => x.typeReserves === it, reserves))}>
                            {getLabel(it)}
                        </Tab>
                    ),
                    tabs
                )}
            </TabList>
            <TabPanels>
                {map(
                    it => (
                        <TabPanel key={it}>
                            <Item type={it} />
                        </TabPanel>
                    ),
                    tabs
                )}
            </TabPanels>
        </Tabs>
    );
};

interface IProps {
    type: number;
}

const Item: FC<IProps> = ({ type }: IProps) => {
    const { t } = useTranslation();

    const isLoadingReserves = useRecoilValue(geologicalReservesIsLoadingState);
    const reserves = useRecoilValue(geologicalReservesByType(type));

    const [currentVolumeReservoir, setCurrentVolumeReservoir] = useRecoilState(currentVolumeReservoirState);

    const dispatcher = useProxyMapMutations();

    return (
        <>
            <FormField
                title={`${t(dict.proxy.params.volumePoreReservoir)}, ${t(dict.common.units.m3Accumulated)}`}
                ratio={[70, 30]}
            >
                <Text>{round0(reserves?.volumePoreReservoir)}</Text>
            </FormField>
            <FormField
                title={`${t(dict.proxy.params.geologicalReserves)}, ${t(dict.common.units.tonsAccumulated)}`}
                ratio={[70, 30]}
            >
                <Text>{round0(reserves?.geologicalReserves)}</Text>
            </FormField>
            <FormField title={`${t(dict.common.params.porosity)}, ${t(dict.common.units.units)}`} ratio={[70, 30]}>
                <Text>{round2(reserves?.porosity)}</Text>
            </FormField>
            <FormField title={`${t(dict.common.params.permeability)}, ${t(dict.common.units.mDarcy)}`} ratio={[70, 30]}>
                <Text>{round2(reserves?.permeability)}</Text>
            </FormField>
            <FormField title={`${t(dict.common.params.oilSaturation)}, ${t(dict.common.units.units)}`} ratio={[70, 30]}>
                <Text>{round2(reserves?.oilSaturation)}</Text>
            </FormField>
            {type === GeologicalReserveType.All ? (
                <>
                    <FormField
                        title={`${t(dict.proxy.params.currentVolumePoreReservoir)}, ${t(
                            dict.common.units.m3Accumulated
                        )}`}
                        ratio={[70, 30]}
                    >
                        <InputNumber
                            value={currentVolumeReservoir}
                            step={1}
                            min={1}
                            w={'120px'}
                            onChange={value => setCurrentVolumeReservoir(+value)}
                        />
                    </FormField>
                    <ButtonGroup variant='cancel' size={'sm'}>
                        <Button
                            isDisabled={isLoadingReserves}
                            isLoading={isLoadingReserves}
                            minW='100px'
                            variant='primary'
                            onClick={() => dispatcher.saveCurrentGeologicalReserves()}
                        >
                            {t(dict.common.save)}
                        </Button>
                    </ButtonGroup>
                </>
            ) : null}
        </>
    );
};
