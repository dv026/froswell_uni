import React from 'react';

import { Heading, Flex, Box, Spacer, Link, Text, HStack, Button, Wrap, WrapItem } from '@chakra-ui/react';
import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { CompleteIcon, ErrorIcon, ExcelIcon } from '../../../common/components/customIcon/general';
import { RouteEnum } from '../../../common/enums/routeEnum';
import { mapIndexed } from '../../../common/helpers/ramda';
import { RowCountModel } from '../../entities/rowCountModel';
import { UploadCommonProps } from '../../entities/uploadCommonProps';
import { selectedOilField } from '../../store/currentOilfield';
import { rowCountModelSelector } from '../../store/rowCountModel';
import { useUploadMutations } from '../../store/uploadMutations';
import { LoadExcelModal } from './modal/loadExcelModal';
import { LoadGeologicalModal } from './modal/loadGeologicalModal';
import { LoadPhysicalModal } from './modal/loadPhysicalModal';
import { RemoveDataModal } from './modal/removeDataModal';
import { RemoveOilfieldModal } from './modal/removeOilfieldModal';
import { RenameOilfieldModal } from './modal/renameOilfieldModal';

import css from './index.module.less';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

enum GroupType {
    General = 1,
    Numbered = 2,
    Marked = 3,
    Info = 4
}

class Step {
    public enabled: boolean;
    public name: string;
    public route: string;
    public group: GroupType;
    public rowKey: string;
    public keyData: string;
    public fileProps: UploadCommonProps;

    public constructor(
        name: string,
        route: string,
        group: GroupType = GroupType.General,
        enabled: boolean = false,
        rowKey = null,
        keyData = null,
        fileProps = null
    ) {
        this.name = name;
        this.route = route;
        this.group = group;
        this.enabled = enabled;
        this.rowKey = rowKey;
        this.keyData = keyData;
        this.fileProps = fileProps;
    }
}

export const CommonData = () => {
    const { t } = useTranslation();

    const selected = useRecoilValue(selectedOilField);
    const p = useRecoilValue(rowCountModelSelector);

    //const refreshModel = useRecoilRefresher_UNSTABLE(rowCountModelSelector);

    const upload = useUploadMutations();

    // useEffect(() => {
    //     return () => {
    //         refreshModel();
    //     };
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    const merUploaded = !isNil(p.rowCountMer);
    const rigisUploaded = !isNil(p.rowCountRigis);
    const perforationUploaded = !isNil(p.rowCountPerforation);
    const researchUploaded = !isNil(p.rowCountResearch);
    const allowRandomUpload = merUploaded && rigisUploaded && perforationUploaded && researchUploaded;

    const merProps: UploadCommonProps = {
        keyData: 'mer',
        title: t(dict.load.merData),
        totalRowCount: p.rowCountMer,
        error: p.error,
        upload: (file, clear) => upload.mer(file, clear, selected.id)
    };

    const rigisProps: UploadCommonProps = {
        keyData: 'rigis',
        title: t(dict.load.rigis),
        totalRowCount: p.rowCountRigis,
        error: p.error,
        upload: (file, clear) => upload.rigis(file, clear, selected.id)
    };

    const perforationProps: UploadCommonProps = {
        keyData: 'perforation',
        title: t(dict.load.perforation),
        totalRowCount: p.rowCountPerforation,
        error: p.error,
        upload: (file, clear) => upload.perforation(file, clear, selected.id)
    };

    const researchProps: UploadCommonProps = {
        keyData: 'research',
        title: t(dict.load.research),
        totalRowCount: p.rowCountResearch,
        error: p.error,
        upload: (file, clear) => upload.research(file, clear, selected.id)
    };

    const gridsProps: UploadCommonProps = {
        keyData: 'grids',
        title: t(dict.load.grids),
        totalRowCount: p.rowCountGrids,
        error: p.error,
        upload: (file, clear) => upload.grids(file, clear, selected.id)
    };

    const repairsProps: UploadCommonProps = {
        keyData: 'repairs',
        title: t(dict.load.repairs),
        totalRowCount: p.rowCountRepairs,
        error: p.error,
        upload: (file, clear) => upload.repairs(file, clear, selected.id)
    };

    const plastCrossingProps: UploadCommonProps = {
        keyData: 'plast-crossing',
        title: t(dict.load.plastCrossing),
        totalRowCount: p.rowCountPlastCrossing,
        error: p.error,
        upload: (file, clear) => upload.plastCrossing(file, clear, selected.id)
    };

    const plastContoursProps: UploadCommonProps = {
        keyData: 'plast-contours',
        title: t(dict.load.plastContours),
        totalRowCount: p.rowCountPlastContours,
        error: p.error,
        upload: (file, clear) => upload.plastContours(file, clear, selected.id)
    };

    const objectContoursProps: UploadCommonProps = {
        keyData: 'object-contours',
        title: t(dict.load.objectContours),
        totalRowCount: p.rowCountObjectContours,
        error: p.error,
        upload: (file, clear) => upload.objectContours(file, clear, selected.id)
    };

    const permeabilityProps: UploadCommonProps = {
        keyData: 'permeability',
        title: t(dict.load.permeability),
        totalRowCount: p.rowCountPermeability,
        error: p.error,
        upload: (file, clear) => upload.permeability(file, clear, selected.id)
    };

    const sequentialLoadSteps = [
        new Step(t(dict.load.mer), null, GroupType.Numbered, true, 'rowCountMer', 'mer', merProps),
        new Step(t(dict.load.rigis), null, GroupType.Numbered, merUploaded, 'rowCountRigis', 'rigis', rigisProps),
        new Step(
            t(dict.load.perforation),
            null,
            GroupType.Numbered,
            rigisUploaded,
            'rowCountPerforation',
            'perforation',
            perforationProps
        ),
        new Step(
            t(dict.load.research),
            null,
            GroupType.Numbered,
            perforationUploaded,
            'rowCountResearch',
            'research',
            researchProps
        ),
        new Step(
            t(dict.load.repairs),
            null,
            GroupType.Numbered,
            researchUploaded,
            'rowCountRepairs',
            'repairs',
            repairsProps
        )
    ];

    const randomLoadSteps = [
        new Step(t(dict.load.grids), null, GroupType.Marked, allowRandomUpload, 'rowCountGrids', 'grids', gridsProps),
        new Step(
            t(dict.load.plastCrossing),
            null,
            GroupType.Marked,
            allowRandomUpload,
            'rowCountPlastCrossing',
            'plast-crossing',
            plastCrossingProps
        ),
        new Step(
            t(dict.load.plastContours),
            null,
            GroupType.Marked,
            allowRandomUpload,
            'rowCountPlastContours',
            'plast-contours',
            plastContoursProps
        ),
        new Step(
            t(dict.load.objectContours),
            null,
            GroupType.Marked,
            allowRandomUpload,
            'rowCountObjectContours',
            'object-contours',
            objectContoursProps
        ),
        new Step(
            t(dict.load.physicalProperties),
            RouteEnum.UploadPhysicalProperties,
            GroupType.Marked,
            allowRandomUpload,
            'rowCountPhysicalProperties'
        ),
        new Step(
            t(dict.load.geologicalProperties),
            RouteEnum.UploadGeologicalProperties,
            GroupType.Marked,
            allowRandomUpload,
            'rowCountGeologicalProperties'
        ),
        new Step(
            t(dict.load.permeability),
            null,
            GroupType.Marked,
            allowRandomUpload,
            'rowCountPermeability',
            'permeability',
            permeabilityProps
        )
    ];

    const makeSteps = (steps: Step[]): JSX.Element[] => {
        return mapIndexed(
            (step: Step, index: number) =>
                step.enabled ? (
                    <WrapItem key={step.rowKey} className={css.gridItem} bg='bg.white'>
                        <Item props={p} step={step} index={index} />
                    </WrapItem>
                ) : null,
            steps
        );
    };

    return (
        <Flex
            backgroundImage='url(/images/background.png)'
            backgroundPosition='970px 386px'
            backgroundRepeat='no-repeat'
            bg={'bg.grey100'}
            direction='column'
            fontSize={'12px'}
            w='100%'
            h='100%'
        >
            <Flex pl='20px' h='42px' borderBottom='1px' borderColor='control.grey300'>
                <HStack spacing='30px'>
                    <Box>
                        <RenameOilfieldModal key={selected.id} selected={selected} />
                    </Box>
                    <Box>
                        <RemoveDataModal key={selected.id} selected={selected} />
                    </Box>
                    <Box>
                        <RemoveOilfieldModal key={selected.id} selected={selected} />
                    </Box>
                </HStack>
            </Flex>
            <Box className={css.commonData}>
                <Heading size='h4' textTransform='uppercase'>
                    {t(dict.common.wells)}
                </Heading>
                <Wrap className={css.grid} spacing={5} pb='15px'>
                    {makeSteps(sequentialLoadSteps)}
                </Wrap>
                <Heading size='h4' textTransform='uppercase'>
                    {t(dict.common.plasts)}
                </Heading>
                <Wrap className={css.grid} spacing={5}>
                    {makeSteps(randomLoadSteps)}
                </Wrap>
            </Box>
        </Flex>
    );
};

interface ItemProps {
    props: RowCountModel;
    step: Step;
    index: number;
}

const Item: React.FC<ItemProps> = (p: ItemProps) => {
    const { t } = useTranslation();
    const uploadedMark = (step: Step) => {
        if (step.group !== GroupType.Marked && step.group !== GroupType.Numbered) {
            return null;
        }

        //const isNumbered = step.group === GroupType.Numbered;

        return !isNil(p.props[step.rowKey]) ? (
            <CompleteIcon color='icons.green' boxSize={7} />
        ) : (
            <ErrorIcon color='icons.grey' boxSize={7} />
        );
    };

    const isExcelType = !isNil(p.step.keyData);

    return (
        <Flex direction='column' w='100%' h='100%'>
            <Box p='20px' pr='35px'>
                <Text fontSize='18px' lineHeight='22px'>
                    {p.step.name}
                </Text>
            </Box>
            <Spacer justifySelf='stretch' />
            <Box px='4'>{isExcelType ? <LoadExcelModal {...p.step.fileProps} /> : null}</Box>
            <Box px='4' mb='5'>
                {isExcelType ? (
                    <Button leftIcon={<ExcelIcon color='icons.grey' boxSize={6} />} variant='link' fontSize='12px'>
                        <Link
                            href={`/public/upload/template_${p.step.keyData}_sample.xlsx`}
                            download={`template_${p.step.keyData}_sample.xlsx`}
                        >
                            {t(dict.common.download)}
                        </Link>
                    </Button>
                ) : p.step.route === RouteEnum.UploadPhysicalProperties ? (
                    <LoadPhysicalModal />
                ) : p.step.route === RouteEnum.UploadGeologicalProperties ? (
                    <LoadGeologicalModal />
                ) : null}
            </Box>
            <Box position='absolute' top='10px' right='10px'>
                {uploadedMark(p.step)}
            </Box>
        </Flex>
    );
};
