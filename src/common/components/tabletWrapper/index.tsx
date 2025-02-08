import { Box, HStack } from '@chakra-ui/react';
import { EmptyData } from 'common/components/emptyData';
import { CanvasSize } from 'common/entities/canvas/canvasSize';
import { WellBrief } from 'common/entities/wellBrief';
import { DisplayModeEnum } from 'common/enums/displayModeEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { TabletTableView } from 'input/components/tablet/tabletTableView';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletSettingsModel } from 'input/entities/tabletSettingsModel';

import colors from '../../../../theme/colors';
import { TabletView } from './tabletView';

export interface TabletWrapperProps {
    model: TabletDataModel;
    well: WellBrief;
    selectedWells: WellBrief[];
    displayMode: DisplayModeEnum;
    modelSettings: TabletSettingsModel;
    canvasSize: CanvasSize;
    setModelSettings: (settings: TabletSettingsModel) => void;
}

export const TabletWrapper = (props: TabletWrapperProps) => {
    const { model, well, displayMode } = props;

    if (isNullOrEmpty(model.data) || !well.id) {
        return <EmptyData />;
    }

    if (displayMode === DisplayModeEnum.Table) {
        return <TabletTableView rigis={model.data} perforation={model.perforation} />;
    }

    if (displayMode === DisplayModeEnum.TabletPlusTable) {
        return (
            <HStack h='100%' gap={0}>
                <Box w='50%' h='100%'>
                    <TabletView {...props} />
                </Box>
                <Box w='50%' h='100%' borderColor={colors.control.grey300} borderLeftWidth={1}>
                    <TabletTableView rigis={model.data} perforation={model.perforation} />
                </Box>
            </HStack>
        );
    }

    return <TabletView {...props} />;
};
