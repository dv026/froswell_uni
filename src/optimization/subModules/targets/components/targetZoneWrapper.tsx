import React from 'react';

import { map } from 'ramda';
import { AutoSizer, Size } from 'react-virtualized';
import { useRecoilValue } from 'recoil';

import { insimCalcParams } from '../../../../calculation/store/insimCalcParams';
import { WellBrief } from '../../../../common/entities/wellBrief';
import { max, min } from '../../../../common/helpers/math';
import { ChartModel } from '../entities/chartModel';
import { SettingsModel } from '../entities/settingsModel';
import { TargetOptionModel } from '../entities/targetOptionModel';
import { useTargetMutations, xRange } from '../store/targetMutations';
import { TargetZone } from './targetZone';

interface IProps {
    zones?: TargetOptionModel[];
    data?: ChartModel[];
    well: WellBrief;
    settings: SettingsModel;
}

export const TargetZoneWrapper: React.FC<IProps> = (p: IProps) => {
    const params = useRecoilValue(insimCalcParams);

    const dispatcher = useTargetMutations();

    const yRange = () => {
        const y1 = Math.min(
            0,
            min(
                map(
                    it =>
                        min([
                            it.oilRate,
                            it.liqRate,
                            it.injection,
                            it.oilRateForecast,
                            it.liqRateForecast,
                            it.injectionForecast
                        ]),
                    p.data
                )
            )
        );
        const y2 = Math.max(
            10,
            max(
                map(
                    it =>
                        max([
                            it.oilRate,
                            it.liqRate,
                            it.injection,
                            it.oilRateForecast,
                            it.liqRateForecast,
                            it.injectionForecast
                        ]),
                    p.data
                )
            )
        );

        return [y1, y2 * (1 + p.settings.percentLimit / 100)];
    };

    return (
        <AutoSizer>
            {(size: Size) =>
                size.width && size.height ? (
                    <TargetZone
                        width={size.width}
                        height={size.height}
                        zones={p.zones}
                        xRange={xRange(p.data, p.settings, params.adaptationEnd, params.forecastEnd)}
                        yRange={yRange()}
                        showPredictionChart={p.settings.showPredictionChart}
                        data={map(
                            it => ({
                                dt: new Date(it.dt),
                                oilRate: it.oilRate,
                                liqRate: it.liqRate,
                                injection: it.injection,
                                isReal: it.isReal,
                                oilRateForecast: it.oilRateForecast,
                                liqRateForecast: it.liqRateForecast,
                                injectionForecast: it.injectionForecast
                            }),
                            p.data
                        )}
                        updateTargetZone={model => dispatcher.update(model)}
                        removeTargetZone={model => dispatcher.remove(model)}
                    />
                ) : null
            }
        </AutoSizer>
    );
};
