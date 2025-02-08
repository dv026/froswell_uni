import { CanvasSize } from 'common/entities/canvas/canvasSize';
import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { max, min } from 'common/helpers/math';
import { removeNulls } from 'common/helpers/ramda';
import { scaleLinear } from 'd3-scale';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { getColumns } from 'input/entities/tabletSettingsModel';
import { concat, map, sum } from 'ramda';

export const getAbsDepth = (allData: TabletDataModel, scale: number) => {
    const { data, perforation, packerHistory, downholeHistory, trajectories } = allData;

    const trajectoryScale = scaleLinear()
        .domain(map(it => it.zAbs, trajectories))
        .range(map(it => it.z, trajectories));

    const absDataDepth = concat(
        map(it => it.topAbs, data),
        map(it => it.bottomAbs, data)
    );

    const absPerforationDepth = concat(
        map(it => it.topAbs, perforation),
        map(it => it.bottomAbs, perforation)
    );

    const absPackerHistory = concat(
        concat(
            map(it => trajectoryScale.invert(it), removeNulls(map(x => x.topPacker, packerHistory ?? []))),
            map(it => trajectoryScale.invert(it), removeNulls(map(x => x.bottomPacker, packerHistory ?? [])))
        ),
        map(it => trajectoryScale.invert(it), removeNulls(map(x => x.topPump, packerHistory ?? [])))
    );

    const absDownholeDepth = map(
        it => trajectoryScale.invert(it),
        removeNulls(map(x => x.depth, downholeHistory ?? []))
    );

    const absDepth = concat(concat(concat(absDataDepth, absPerforationDepth), absPackerHistory), absDownholeDepth);

    const realDataDepth = concat(
        map(it => it.top, data),
        map(it => it.bottom, data)
    );
    const realPerforationDepth = concat(
        map(it => it.top, perforation),
        map(it => it.bottom, perforation)
    );
    const realPackerHistory = removeNulls(
        concat(
            concat(
                map(it => it.topPacker, packerHistory ?? []),
                map(it => it.bottomPacker, packerHistory ?? [])
            ),
            map(it => it.topPump, packerHistory ?? [])
        )
    );

    const realDepth = concat(concat(realDataDepth, realPerforationDepth), realPackerHistory);

    // todo mb
    const minAbsDepth = min(absDepth) - 10;
    const maxAbsDepth = max(absDepth) + 5;

    return [minAbsDepth, maxAbsDepth];
};

export const getCanvasSize = (allData: TabletDataModel, scale: number, hiddenColumns: TabletColumnEnum[]) => {
    const [minAbsDepth, maxAbsDepth] = getAbsDepth(allData, scale);

    const width = sum(map(it => it.width, getColumns(allData, hiddenColumns)));

    const bodyHeight = (Math.abs(minAbsDepth - maxAbsDepth) * scale) / 3; // todo mb

    return new CanvasSize(0, 0, width, bodyHeight);
};
