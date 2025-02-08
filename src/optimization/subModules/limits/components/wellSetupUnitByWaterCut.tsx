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

export const WellSetupUnitByWaterCut: React.FC<IProps> = (p: IProps) => {
    const containers = [React.useRef(null), React.useRef(null), React.useRef(null), React.useRef(null)];

    React.useEffect(() => {
        mapIndexed((el: React.MutableRefObject<SVGSVGElement>, index) => render(el, index + 1), containers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p.data, p.saved, p.wellType, p.groupType]);

    const render = (el, index) => {
        const data = filter(it => it.charWorkId === p.wellType, p.data);
        const svgMinPressureZab = min(map((it: WellSetupRaw) => it.minPressureZab, data));
        const svgMaxPressureZab = max(map((it: WellSetupRaw) => it.maxPressureZab, data));
        const avgMaxPressureZab = mean(map((it: WellSetupRaw) => it.maxPressureZab, data));
        const items = filter(it => getTypeByVolume(it.volumeWaterCut) === index, data);
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
                filter(it => it.type === index && it.wellType === p.wellType, p.saved)
            )
        );

        appendBar(svg, {
            type: index,
            wellType: p.wellType,
            groupType: p.groupType,
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
                    subScenarioId: null,
                    wellType: p.wellType,
                    wells: [],
                    type: index,
                    minPressureZab: isNaN(avgMinPressureZabBySaved)
                        ? p.wellType === WellTypeEnum.Oil
                            ? mean(map((it: WellSetupRaw) => it.minPressureZab, items))
                            : avgMaxPressureZab
                        : avgMinPressureZabBySaved,
                    isManual: false
                },
                []
            ),
            createOrUpdate: p.createOrUpdate
        });
    };

    return mapIndexed(
        (el: React.MutableRefObject<SVGSVGElement>, index) => (
            <Box className={css.limits__item}>
                <svg key={'svg-watercut-' + index} className={'d3-component-' + index} ref={el} />
            </Box>
        ),
        containers
    );
};

export const getTypeByVolume = (v: number): number => {
    if (v >= 0 && v < 26) {
        return 1;
    } else if (v >= 26 && v < 51) {
        return 2;
    } else if (v > 51 && v < 76) {
        return 3;
    } else if (v >= 76 && v <= 100) {
        return 4;
    } else {
        return -1;
    }
};
