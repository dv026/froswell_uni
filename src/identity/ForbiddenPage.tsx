import React, { memo } from 'react';

import { useTranslation } from 'react-i18next';

interface ForbiddenPageProps {
    className?: string;
}

export const ForbiddenPage = memo((props: ForbiddenPageProps) => {
    const { className } = props;

    const { t } = useTranslation();

    return <div>{t('У вас нет доступа к данной странице')}</div>;
});
