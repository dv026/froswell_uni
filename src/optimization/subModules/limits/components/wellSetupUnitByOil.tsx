import React from 'react';

import { Box } from '@chakra-ui/react';
import * as d3 from 'd3';
import { descend, filter, find, map, mean, prop, sortWith } from 'ramda';

import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { max, min, round1 } from '../../../../common/helpers/math';
import { headOrDefault, isNullOrEmpty, mapIndexed } from '../../../../common/helpers/ramda';
import { WellSetupModel } from '../entities/wellSetupModel';
import { WellSetupRaw } from '../entities/wellSetupRaw';
import { WellSetupSavedModel } from '../entities/wellSetupSavedModel';
import { GroupType } from '../enums/groupType';
import { appendLegend, appendBar } from '../helpers/barUnit';

import css from './index.module.less';

const sortByOilRate = list => sortWith<WellSetupRaw>([descend(prop('oilRate'))], list);

interface IProps {
    data: WellSetupRaw[];
    groupType: GroupType;
    saved: WellSetupModel[];
    wellType: WellTypeEnum;
    createOrUpdate(model: WellSetupSavedModel): void;
}

export const WellSetupUnitByOil: React.FC<IProps> = (p: IProps) => {
    const containers = [React.useRef(null), React.useRef(null), React.useRef(null), React.useRef(null)];

    React.useEffect(() => {
        mapIndexed((el: React.MutableRefObject<SVGSVGElement>, index) => render(el, index + 1), containers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p.data, p.saved, p.wellType, p.groupType]);

    const render = (el, index) => {
        const data = filter(it => it.charWorkId === p.wellType, p.data);
        const svgMinPressureZab = min(map((it: WellSetupRaw) => it.minPressureZab, data));
        const svgMaxPressureZab = max(map((it: WellSetupRaw) => it.maxPressureZab, data));
        const minOilRate = min(map((it: WellSetupRaw) => it.oilRate, data));
        const maxOilRate = max(map((it: WellSetupRaw) => it.oilRate, data));
        const items = filter(it => getTypeByOil(minOilRate, maxOilRate, it.oilRate) === index, data);
        const pZabScale = d3.scaleLinear().domain([0, svgMaxPressureZab]).range([0, 1]);

        const svg = d3
            .select(el.current)
            .attr('width', items.length * 100 + 400) // todo mb
            .attr('height', isNullOrEmpty(items) ? 100 : 300)
            .attr('font-size', '14px');

        svg.selectAll('*').remove();

        if (index === 1) {
            appendLegend(svg, p.groupType);
        }

        const avgMinPressureZabBySaved = mean(
            map(
                (it: WellSetupModel) => it.minPressureZab,
                filter((it: WellSetupModel) => it.type === index && it.wellType === p.wellType, p.saved ?? [])
            )
        );

        appendBar(svg, {
            type: index,
            wellType: p.wellType,
            groupType: p.groupType,
            range: getRange(minOilRate, maxOilRate),
            items: map(it => {
                const manual = find(x => x.wellId === it.wellId && x.wellType === p.wellType && x.isManual, p.saved);
                return {
                    wellId: it.wellId,
                    wellName: it.wellName,
                    oil: (100 - it.volumeWaterCut) * pZabScale(it.pressureZab),
                    liq: it.volumeWaterCut * pZabScale(it.pressureZab),
                    label: round1(it.pressureZab),
                    maxPressureZab: it.maxPressureZab,
                    minPressureZab: manual ? manual.minPressureZab : it.minPressureZab,
                    pressureZab: it.pressureZab,
                    isManual: !!manual
                };
            }, sortByOilRate(items)),
            saturationPressure: mean(map(it => it.bubblePointPressure, items)),
            globalMinPressureZab: svgMinPressureZab,
            globalMaxPressureZab: svgMaxPressureZab,
            editablePressureZab: headOrDefault(
                {
                    id: null,
                    productionObjectId: null,
                    scenarioId: null,
                    subScenarioId: null,
                    wellType: p.wellType,
                    wells: [],
                    type: index,
                    minPressureZab: isNaN(avgMinPressureZabBySaved)
                        ? mean(map((it: WellSetupRaw) => it.minPressureZab, items))
                        : avgMinPressureZabBySaved,
                    isManual: false
                },
                []
            ),
            createOrUpdate: p.createOrUpdate
        });
    };

    mapIndexed((el: React.MutableRefObject<SVGSVGElement>, index) => render(el, index + 1), containers);

    return mapIndexed(
        (el: React.MutableRefObject<SVGSVGElement>, index) => (
            <Box className={css.limits__item}>
                <svg key={'svg-oil-' + index} className={'d3-component-' + index} ref={el} />
            </Box>
        ),
        containers
    );
};

export const getTypeByOil = (minOilRate: number, maxOilRate: number, value: number): number => {
    if (minOilRate === maxOilRate || minOilRate > maxOilRate) {
        return -1;
    }

    const range = getRange(minOilRate, maxOilRate);

    if (value >= range[0][0] && value <= range[0][1]) {
        return 1;
    } else if (value >= range[1][0] && value <= range[1][1]) {
        return 2;
    } else if (value >= range[2][0] && value <= range[2][1]) {
        return 3;
    } else if (value >= range[3][0] && value <= range[3][1]) {
        return 4;
    }
};

const getRange = (minOilRate: number, maxOilRate: number): number[][] => {
    const diff = (maxOilRate - minOilRate) / 4;

    return [
        [minOilRate, minOilRate + diff],
        [minOilRate + diff, minOilRate + diff * 2],
        [minOilRate + diff * 2, minOilRate + diff * 3],
        [minOilRate + diff * 3, maxOilRate]
    ];
};
