export enum ListStateEnum {
    Collapsed = 1,
    CollapsedManually = 2,
    Expanded = 3,
    ExpandedManually = 4
}

export const isManualState = (state: ListStateEnum): boolean =>
    state === ListStateEnum.CollapsedManually || state === ListStateEnum.ExpandedManually;

export const isCollapsed = (state: ListStateEnum): boolean =>
    state === ListStateEnum.CollapsedManually || state === ListStateEnum.Collapsed;
