import { TabletWrapperProps } from '.';

import React from 'react';

import { TabletCanvas } from 'common/components/tabletCanvas/tabletCanvas';
import {
    colorAvgTransmissibility,
    colorAvgVolume,
    colorEffectiveInjection
} from 'common/entities/tabletCanvas/helpers/constants';
import { AbsDepthColumnTabletLayer } from 'common/entities/tabletCanvas/layers/absDepthColumnTabletLayer';
import { BackgroundTabletLayer } from 'common/entities/tabletCanvas/layers/backgroundTabletLayer';
import { DownholeColumnTabletLayer } from 'common/entities/tabletCanvas/layers/downholeColumnTabletLayer';
import { EfficiencyColumnTabletLayer } from 'common/entities/tabletCanvas/layers/efficiencyColumnTabletLayer';
import { GridTabletLayer } from 'common/entities/tabletCanvas/layers/gridTabletLayer';
import { HeaderLoggingTabletLayer } from 'common/entities/tabletCanvas/layers/headerLoggingTabletLayer';
import { HeaderTabletLayer } from 'common/entities/tabletCanvas/layers/headerTabletLayer';
import { HydraulicFracturingColumnTabletLayer } from 'common/entities/tabletCanvas/layers/hydraulicFracturingColumnTabletLayer';
import { LithologyColumnTabletLayer } from 'common/entities/tabletCanvas/layers/lithologyColumnTabletLayer';
import { LoggingColumnTabletLayer } from 'common/entities/tabletCanvas/layers/loggingColumnTabletLayer';
import { LoggingResearchColumnTabletLayer } from 'common/entities/tabletCanvas/layers/loggingResearchColumnTabletLayer';
import { ObjectColumnTabletLayer } from 'common/entities/tabletCanvas/layers/objectColumnTabletLayer';
import { OilSaturationColumnTabletLayer } from 'common/entities/tabletCanvas/layers/oilSaturationColumnTabletLayer';
import { PackerHistoryColumnTabletLayer } from 'common/entities/tabletCanvas/layers/packerHistoryColumnTabletLayer';
import { PackerPumpColumnTabletLayer } from 'common/entities/tabletCanvas/layers/packerPumpColumnTabletLayer';
import { PerforationColumnTabletLayer } from 'common/entities/tabletCanvas/layers/perforationColumnTabletLayer';
import { PermeabilityColumnTabletLayer } from 'common/entities/tabletCanvas/layers/permeabilityColumnTabletLayer';
import { PlastColumnTabletLayer } from 'common/entities/tabletCanvas/layers/plastColumnTabletLayer';
import { PlastHorizontalLinesTabletLayer } from 'common/entities/tabletCanvas/layers/plastHorizontalLinesTabletLayer';
import { PorosityColumnTabletLayer } from 'common/entities/tabletCanvas/layers/porosityColumnTabletLayer';
import { ProxyColumnTabletLayer } from 'common/entities/tabletCanvas/layers/proxyColumnTabletLayer';
import { SaturationColumnTabletLayer } from 'common/entities/tabletCanvas/layers/saturationColumnTabletLayer';
import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { map } from 'ramda';

import { Legend } from './legend';

export const TabletView = (props: TabletWrapperProps) => {
    const { model, well, selectedWells, modelSettings, canvasSize, setModelSettings } = props;

    return (
        <>
            <Legend
                selectedWells={selectedWells}
                settings={modelSettings}
                tabletData={model}
                changeSettings={setModelSettings}
            />
            <TabletCanvas
                key={`input_tablet_${modelSettings.scale}_${modelSettings.hiddenColumns.join()}_${
                    isNullOrEmpty(selectedWells) ? well.toString() : map(it => it.toString(), selectedWells).join('_')
                }`}
                layers={[
                    new BackgroundTabletLayer(canvasSize),
                    new ObjectColumnTabletLayer(TabletColumnEnum.Object, canvasSize),
                    new PlastColumnTabletLayer(TabletColumnEnum.Plast, canvasSize),
                    new AbsDepthColumnTabletLayer(TabletColumnEnum.Depth, canvasSize),
                    new SaturationColumnTabletLayer(TabletColumnEnum.Saturation, canvasSize),
                    new LithologyColumnTabletLayer(TabletColumnEnum.Lithology, canvasSize),
                    new PorosityColumnTabletLayer(TabletColumnEnum.Porosity, canvasSize),
                    new PermeabilityColumnTabletLayer(TabletColumnEnum.Permeability, canvasSize),
                    new OilSaturationColumnTabletLayer(TabletColumnEnum.OilSaturation, canvasSize),

                    new EfficiencyColumnTabletLayer(TabletColumnEnum.ProxyAvgVolume, canvasSize),

                    new ProxyColumnTabletLayer(
                        TabletColumnEnum.ProxyAvgVolume,
                        'avgVolume',
                        colorAvgVolume,
                        canvasSize
                    ),
                    new ProxyColumnTabletLayer(
                        TabletColumnEnum.ProxyAvgTransmissibility,
                        'avgTransmissibility',
                        colorAvgTransmissibility,
                        canvasSize
                    ),
                    new ProxyColumnTabletLayer(TabletColumnEnum.ProxyRelLiqInje, 'relLiqInje', null, canvasSize),
                    new ProxyColumnTabletLayer(
                        TabletColumnEnum.ProxyRelLiqInjeAccum,
                        'relLiqInjeAccum',
                        null,
                        canvasSize
                    ),
                    new ProxyColumnTabletLayer(
                        TabletColumnEnum.ProxyEffectiveInjection,
                        'effectiveInjection',
                        colorEffectiveInjection,
                        canvasSize
                    ),

                    new PerforationColumnTabletLayer(TabletColumnEnum.Perforation, canvasSize),
                    new HydraulicFracturingColumnTabletLayer(TabletColumnEnum.HydraulicFracturing, canvasSize),
                    new LoggingColumnTabletLayer(TabletColumnEnum.Logging, canvasSize),
                    new LoggingResearchColumnTabletLayer(TabletColumnEnum.Logging, canvasSize),
                    new PackerHistoryColumnTabletLayer(TabletColumnEnum.PackerHistory, canvasSize),
                    new PackerPumpColumnTabletLayer(TabletColumnEnum.PackerHistory, canvasSize),
                    new DownholeColumnTabletLayer(TabletColumnEnum.PackerHistory, canvasSize),
                    new GridTabletLayer(canvasSize),
                    new PlastHorizontalLinesTabletLayer(TabletColumnEnum.Plast, canvasSize),
                    new HeaderTabletLayer(canvasSize),
                    new HeaderLoggingTabletLayer(canvasSize)
                ]}
                model={model}
                settings={modelSettings}
                selectedWells={isNullOrEmpty(selectedWells) ? [well] : selectedWells}
                prodObjId={well.prodObjId}
                canvasSize={canvasSize}
            ></TabletCanvas>
        </>
    );
};
