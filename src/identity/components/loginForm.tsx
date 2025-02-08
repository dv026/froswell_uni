import React, { PureComponent } from 'react';

import i18n from 'i18next';
import { Link } from 'react-router-dom';

import { KeyCodeEnum } from '../../common/enums/keyCodesEnum';
import { LoginModel } from '../entities/loginModel';
import { loginName, isLogged } from '../helpers/authHelper';

import dict from '../../common/helpers/i18n/dictionary/main.json';

interface LoginFormProps {
    login?: string;
    password?: string;
    errors?: string;
    Submit(model: LoginModel): void;
    LogOut(): void;
}

interface LoginFormState {
    login: string;
    password: string;
}

export default class LoginForm extends PureComponent<LoginFormProps, LoginFormState> {
    private onKeyDownHandler;

    public constructor(props: LoginFormProps, context: unknown) {
        super(props, context);

        this.state = {
            login: this.props.login ? this.props.login : '',
            password: this.props.password ? this.props.password : ''
        };

        this.onKeyDownHandler = this.keyDownFunction.bind(this);
    }

    public componentDidMount(): void {
        document.addEventListener('keydown', this.onKeyDownHandler, false);
    }

    public componentWillUnmount(): void {
        document.removeEventListener('keydown', this.onKeyDownHandler, false);
    }

    public changeLanguage = (lng: string): void => {
        i18n.changeLanguage(lng);
        window.location.reload();
    };

    public render(): React.ReactNode {
        return !isLogged() ? (
            <div className='login-page'>
                <div className='title-container'>
                    <div className='name'>Teics.One</div>
                    <div className='description'>{i18n.t(dict.identity.tagline)}</div>
                </div>
                <div className='fields-container'>
                    <form>
                        <input
                            className='field'
                            id='name'
                            placeholder={i18n.t(dict.account.userName)}
                            tabIndex={1}
                            type='text'
                            value={this.state.login}
                            onChange={e => this.setState({ login: e.target.value })}
                        />
                        <input
                            className='field'
                            id='password'
                            placeholder={i18n.t(dict.account.password)}
                            tabIndex={2}
                            type='password'
                            value={this.state.password}
                            onChange={e => this.setState({ password: e.target.value })}
                        />
                        {this.props.errors ? <span className='error-label'>{this.props.errors}</span> : null}
                    </form>
                </div>
                <div className='bottom-container'>
                    <input
                        className='button-login'
                        type='button'
                        value={i18n.t(dict.identity.login) as string}
                        tabIndex={3}
                        onClick={() => this.props.Submit(new LoginModel(this.state.login, this.state.password))}
                    />
                    <div className='info-buttons'>
                        <a className='button-info left' tabIndex={5} target='_blank'>
                            {i18n.t(dict.identity.instructions)}
                        </a>
                        <a className='button-info right' tabIndex={6} href='mailto:1@nestlab.ru'>
                            {i18n.t(dict.identity.writeMessage)}
                        </a>
                    </div>
                    <div className='language'>
                        <Link
                            to={'#'}
                            onClick={() => this.changeLanguage(i18n.language === 'ru-RU' ? 'en-US' : 'ru-RU')}
                        >
                            {i18n.t(dict.identity.switchLanguage)}
                        </Link>
                    </div>
                    <div className='copyright'>
                        <a className='facebook' tabIndex={7} href='https://www.facebook.com/teics'>
                            Teics
                        </a>
                        <span className='copyright'> © </span>
                        <span className='year'>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        ) : (
            <div className='loginForm'>
                <div className='row'>
                    {i18n.t(dict.identity.loggedInName)}, {loginName()}
                </div>
            </div>
        );
    }

    private keyDownFunction(event) {
        if (event.keyCode !== KeyCodeEnum.ENTER) {
            return;
        }

        this.props.Submit(new LoginModel(this.state.login, this.state.password));
    }
}
