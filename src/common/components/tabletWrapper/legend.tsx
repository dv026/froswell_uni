import React, { FC } from 'react';

import {
    Box,
    Heading,
    VStack,
    Checkbox,
    RadioGroup,
    Radio,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabPanels
} from '@chakra-ui/react';
import { inputColumns } from 'common/entities/tabletCanvas/helpers/constants';
import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import * as d3 from 'd3';
import { includes, map, uniq } from 'ramda';
import { useTranslation } from 'react-i18next';

import { TabletDataModel } from '../../../input/entities/tabletDataModel';
import { TabletSettingsModel } from '../../../input/entities/tabletSettingsModel';
import { WellLoggingEnum } from '../../../input/enums/wellLoggingEnum';
import { WellBrief } from '../../entities/wellBrief';
import { ddmmyyyy, isValidDate } from '../../helpers/date';
import { minMax } from '../../helpers/math';
import { isNullOrEmpty, shallow, toggleListItem } from '../../helpers/ramda';
import { FoldingCurtain } from '../curtain';
import { DropdownOption } from '../dropdown/dropdown';

import dict from '../../helpers/i18n/dictionary/main.json';

interface Props {
    selectedWells: WellBrief[];
    settings: TabletSettingsModel;
    tabletData: TabletDataModel;
    changeSettings: (model: TabletSettingsModel) => void;
}

export const Legend: FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    const settings = p.settings;
    const tabletData = p.tabletData;

    const multipleWells = p.selectedWells && p.selectedWells.length > 1;

    const loggingTypes = [
        { type: WellLoggingEnum.NEUT, key: 'neut', label: t(dict.tablet.logging.neut) },
        { type: WellLoggingEnum.GR, key: 'gr', label: t(dict.tablet.logging.gr) },
        { type: WellLoggingEnum.SP, key: 'sp', label: t(dict.tablet.logging.sp) },
        { type: WellLoggingEnum.GZ3, key: 'gz3', label: t(dict.tablet.logging.gz3) },
        { type: WellLoggingEnum.LLD, key: 'lld', label: t(dict.tablet.logging.lld) },
        { type: WellLoggingEnum.ILD, key: 'ild', label: t(dict.tablet.logging.ild) },
        { type: WellLoggingEnum.CALI, key: 'cali', label: t(dict.tablet.logging.cali) },
        { type: WellLoggingEnum.SONIC, key: 'sonic', label: t(dict.tablet.logging.sonic) },
        { type: WellLoggingEnum.RHOB, key: 'rhob', label: t(dict.tablet.logging.rhob) }
    ];

    return (
        <FoldingCurtain position='top-left' btnLabel={t(dict.common.appearance)} defaultIsOpened={true}>
            <Box>
                <Box pb={4}>
                    <Heading>{t(dict.common.appearance)}</Heading>
                </Box>
                <Box width='250px'>
                    <Tabs isLazy>
                        <TabList pb='10px'>
                            <Tab>{t(dict.common.general)}</Tab>
                            <Tab>{t(dict.common.columns)}</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                {/* <Box>
                                    <VStack spacing={2} align='stretch'>
                                        <Box>
                                            <Checkbox
                                                isChecked={settings.fixedHeader}
                                                onChange={e => {
                                                    p.changeSettings(
                                                        shallow(settings, { fixedHeader: e.target.checked })
                                                    );

                                                    // todo mb
                                                    if (!e.target.checked) {
                                                        d3.selectAll('.tablet__header').attr('y', 0);
                                                    }
                                                }}
                                            >
                                                {t(dict.tablet.freezeTitle)}
                                            </Checkbox>
                                        </Box>
                                        <Box>
                                            <Checkbox
                                                isChecked={settings.showDepth}
                                                onChange={e =>
                                                    p.changeSettings(shallow(settings, { showDepth: e.target.checked }))
                                                }
                                            >
                                                {t(dict.tablet.showHint)}
                                            </Checkbox>
                                        </Box>
                                        {multipleWells && (
                                            <Box>
                                                <Checkbox
                                                    isChecked={settings.profileMode}
                                                    onChange={e =>
                                                        p.changeSettings(
                                                            shallow(settings, { profileMode: e.target.checked })
                                                        )
                                                    }
                                                >
                                                    {t(dict.map.profile)}
                                                </Checkbox>
                                            </Box>
                                        )}
                                    </VStack>
                                </Box> */}

                                <Accordion defaultIndex={[0]} allowMultiple={true}>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                                {t(dict.tablet.loggingTitle)}
                                            </Box>
                                            <AccordionIcon color='icons.grey' />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <VStack spacing={2} align='stretch'>
                                                {map(it => {
                                                    const mm = minMax(map(x => x[it.key], tabletData.wellLogging));
                                                    return (
                                                        <Checkbox
                                                            isChecked={includes(it.type, settings.selectedLogging)}
                                                            isDisabled={
                                                                isNullOrEmpty(tabletData.wellLogging) || mm[0] === mm[1]
                                                            }
                                                            onChange={() =>
                                                                p.changeSettings(
                                                                    shallow(settings, {
                                                                        selectedLogging: toggleListItem(it.type)(
                                                                            settings.selectedLogging
                                                                        )
                                                                    })
                                                                )
                                                            }
                                                        >
                                                            {it.label}
                                                        </Checkbox>
                                                    );
                                                }, loggingTypes)}
                                            </VStack>
                                        </AccordionPanel>
                                    </AccordionItem>

                                    {isNullOrEmpty(tabletData.researchInflowProfile) ? null : (
                                        <AccordionItem>
                                            <AccordionButton>
                                                <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                                    {t(dict.tablet.research)}
                                                </Box>
                                                <AccordionIcon color='icons.grey' />
                                            </AccordionButton>
                                            <AccordionPanel>
                                                <VStack spacing={2} align='stretch'>
                                                    {map(it => {
                                                        return (
                                                            <Checkbox
                                                                isChecked={includes(it, settings.selectedResearch)}
                                                                onChange={() =>
                                                                    p.changeSettings(
                                                                        shallow(settings, {
                                                                            selectedResearch: toggleListItem(it)(
                                                                                settings.selectedResearch
                                                                            )
                                                                        })
                                                                    )
                                                                }
                                                            >
                                                                {ddmmyyyy(new Date(it))}
                                                            </Checkbox>
                                                        );
                                                    }, uniq(map(it => it.dt, tabletData.researchInflowProfile)))}
                                                </VStack>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    )}
                                    {isNullOrEmpty(tabletData.packerHistory) ? null : (
                                        <AccordionItem>
                                            <AccordionButton>
                                                <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                                    {t(dict.tablet.packerHistory)}
                                                </Box>
                                                <AccordionIcon color='icons.grey' />
                                            </AccordionButton>
                                            <AccordionPanel>
                                                <RadioGroup
                                                    value={settings?.selectedPacker?.toString()}
                                                    onChange={val =>
                                                        p.changeSettings(
                                                            shallow(settings, {
                                                                selectedPacker: +val
                                                            })
                                                        )
                                                    }
                                                >
                                                    <VStack spacing={2} align='stretch'>
                                                        <Radio value='0'>{t(dict.tablet.noLayout)}</Radio>
                                                        {map(
                                                            it => (
                                                                <Radio value={it.id.toString()}>
                                                                    {ddmmyyyy(new Date(it.startDate))} -{' '}
                                                                    {isValidDate(new Date(it.closingDate))
                                                                        ? ddmmyyyy(new Date(it.closingDate))
                                                                        : t(dict.common.untilNow)}
                                                                </Radio>
                                                            ),
                                                            tabletData.packerHistory
                                                        )}
                                                    </VStack>
                                                </RadioGroup>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    )}
                                    {isNullOrEmpty(tabletData.downholeHistory) ? null : (
                                        <AccordionItem>
                                            <AccordionButton>
                                                <Box flex='1' textAlign='left' fontWeight={'bold'}>
                                                    {t(dict.tablet.downholeHistory)}
                                                </Box>
                                                <AccordionIcon color='icons.grey' />
                                            </AccordionButton>
                                            <AccordionPanel>
                                                <RadioGroup
                                                    value={settings?.selectedDownhole?.toString()}
                                                    onChange={val =>
                                                        p.changeSettings(
                                                            shallow(settings, {
                                                                selectedDownhole: +val
                                                            })
                                                        )
                                                    }
                                                >
                                                    <VStack spacing={2} align='stretch'>
                                                        {map(
                                                            it => (
                                                                <Radio value={it.id.toString()}>
                                                                    {ddmmyyyy(new Date(it.dt))}
                                                                </Radio>
                                                            ),
                                                            tabletData.downholeHistory
                                                        )}
                                                    </VStack>
                                                </RadioGroup>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    )}
                                </Accordion>
                            </TabPanel>
                            <TabPanel>
                                <VStack spacing={2} align='stretch'>
                                    {map(it => {
                                        return (
                                            <Checkbox
                                                isChecked={!includes(it.index, settings.hiddenColumns)}
                                                isDisabled={it.index <= TabletColumnEnum.Depth}
                                                onChange={() =>
                                                    p.changeSettings(
                                                        shallow(settings, {
                                                            hiddenColumns: toggleListItem(it.index)(
                                                                settings.hiddenColumns
                                                            )
                                                        })
                                                    )
                                                }
                                            >
                                                {it.label}
                                            </Checkbox>
                                        );
                                    }, inputColumns)}
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Box>
        </FoldingCurtain>
    );
};

export const tabletScaleOptions = (standard: number = 10000): Array<DropdownOption> => [
    new DropdownOption(standard / 1, '1:1'),
    new DropdownOption(standard / 5, '1:5'),
    new DropdownOption(standard / 10, '1:10'),
    new DropdownOption(standard / 50, '1:50'),
    new DropdownOption(standard / 75, '1:75'),
    new DropdownOption(standard / 100, '1:100'),
    new DropdownOption(standard / 125, '1:125'),
    new DropdownOption(standard / 150, '1:150'),
    new DropdownOption(standard / 175, '1:175'),
    new DropdownOption(standard / 200, '1:200'),
    new DropdownOption(standard / 250, '1:250'),
    new DropdownOption(standard / 400, '1:400'),
    new DropdownOption(standard / 500, '1:500'),
    new DropdownOption(standard / 1000, '1:1000')
];

// const objectOptions = (objects: KeyValue[]): DropdownOption[] =>
//     R.pipe<KeyValue[], DropdownOption[], DropdownOption[], DropdownOption[]>(
//         R.map(optionFromKeyValue),
//         R.reject(R.isNil),
//         R.prepend(new DropdownOption('null', t(mainDict.common.all)))
//     )(objects);

// const optionFromKeyValue = (raw: KeyValue): DropdownOption =>
//     R.ifElse(
//         x => R.all(isTruthy)([x, x.id, x.name]),
//         x => new DropdownOption(x.id, x.name),
//         nul
//     )(raw);
