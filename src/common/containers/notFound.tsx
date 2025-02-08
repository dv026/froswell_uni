import React from 'react';

import { Link } from 'react-router-dom';

export class PageNotFound extends React.PureComponent {
    public render(): JSX.Element {
        return (
            <React.Fragment>
                <h1>Страница не найдена</h1>
                <h3>
                    <Link to='/'>Вернуться на главную</Link>
                </h3>
            </React.Fragment>
        );
    }
}
