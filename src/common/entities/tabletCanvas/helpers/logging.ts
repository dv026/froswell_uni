import { isNullOrEmpty } from 'common/helpers/ramda';
import * as d3 from 'd3';
import { scaleLinear, ScaleLinear, scaleLog } from 'd3-scale';
import { LoggingSettingModel } from 'input/entities/loggingSettingModel';
import { TabletLoggingChart } from 'input/entities/tabletLoggingChart';
import { TabletLogging } from 'input/entities/tabletModel';
import { WellLoggingEnum } from 'input/enums/wellLoggingEnum';
import {
    tinyCali,
    tinyGr,
    tinyGz3,
    tinyIld,
    tinyLld,
    tinyNeut,
    tinyRhob,
    tinySonic,
    tinySp
} from 'input/helpers/parameters';
import { find, map, reject } from 'ramda';

import colors from '../../../../../theme/colors';
import { max, min, round0, round1 } from '../../../../common/helpers/math';

export const getLoggingChart = (data: TabletLogging[]): Array<TabletLoggingChart> => {
    if (isNullOrEmpty(data)) {
        return null;
    }

    let loggingSettings = [];

    const savedValue = localStorage.getItem('logging_storage');
    if (savedValue !== null) {
        loggingSettings = JSON.parse(savedValue) as LoggingSettingModel[];
    }

    const neut = map(it => it.neut, data);
    const gr = map(it => it.gr, data);
    const sp = map(it => it.sp, data);
    const gz3 = map(it => it.gz3, data);
    const lld = reject(
        x => x <= 0,
        map(it => it.lld, data)
    );
    const ild = reject(
        x => x <= 0,
        map(it => it.ild, data)
    );
    const cali = map(it => it.cali, data);
    const sonic = map(it => it.sonic, data);
    const rhob = map(it => it.rhob, data);

    const maxOffset = 1.15;
    const defaultRange = [0, 394];

    const getRange = (arr: number[], storageValue: number) =>
        min(arr) === max(arr)
            ? [0, 1]
            : [Math.floor(min(arr)), storageValue ? storageValue : Math.ceil(max(arr) * maxOffset)];

    const getLogRange = (arr: number[], storageValue: number) =>
        min(arr) === max(arr) ? [0.1, 1] : [min(arr), storageValue ? storageValue : max(arr)];

    return [
        {
            index: WellLoggingEnum.NEUT,
            label: tinyNeut(),
            dataKey: 'neut',
            scale: scaleLinear()
                .domain(
                    getRange(
                        neut,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.NEUT, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.bg.black,
            strokeWidth: 1.5,
            scaleStep: 0.5
        },
        {
            index: WellLoggingEnum.GR,
            label: tinyGr(),
            dataKey: 'gr',
            scale: scaleLinear()
                .domain(
                    getRange(
                        gr,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.GR, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.colors.red,
            strokeWidth: 1.5,
            scaleStep: 0.5
        },
        {
            index: WellLoggingEnum.SP,
            label: tinySp(),
            dataKey: 'sp',
            scale: scaleLinear()
                .domain(
                    getRange(
                        sp,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.SP, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: '#F2242D',
            scaleStep: 1
        },
        {
            index: WellLoggingEnum.GZ3,
            label: tinyGz3(),
            dataKey: 'gz3',
            scale: scaleLinear()
                .domain(
                    getRange(
                        gz3,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.GZ3, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: '#597952',
            scaleStep: 1
        },
        {
            index: WellLoggingEnum.LLD,
            label: tinyLld(),
            dataKey: 'lld',
            scale: scaleLog()
                .domain(
                    getLogRange(
                        lld,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.LLD, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.colors.blue,
            tickFormat: d3.format(',.0f'),
            scaleStep: 50,
            isScaleLog: true
        },
        {
            index: WellLoggingEnum.ILD,
            label: tinyIld(),
            dataKey: 'ild',
            scale: scaleLog()
                .domain(
                    getLogRange(
                        ild,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.ILD, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: '#254AD0',
            tickFormat: d3.format(',.0f'),
            scaleStep: 50,
            isScaleLog: true
        },
        {
            index: WellLoggingEnum.CALI,
            label: tinyCali(),
            dataKey: 'cali',
            scale: scaleLinear()
                .domain(
                    getRange(
                        cali,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.CALI, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.colors.green,
            scaleStep: 1
        },
        {
            index: WellLoggingEnum.SONIC,
            label: tinySonic(),
            dataKey: 'sonic',
            scale: scaleLinear()
                .domain(
                    getRange(
                        sonic,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.SONIC, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.colors.green,
            scaleStep: 1
        },
        {
            index: WellLoggingEnum.RHOB,
            label: tinyRhob(),
            dataKey: 'rhob',
            scale: scaleLinear()
                .domain(
                    getRange(
                        rhob,
                        find(it => it.wellId === data[0].wellId && it.param === WellLoggingEnum.RHOB, loggingSettings)
                            ?.value
                    )
                )
                .range(defaultRange),
            strokeColor: colors.colors.grey,
            scaleStep: 1
        }
    ];
};
