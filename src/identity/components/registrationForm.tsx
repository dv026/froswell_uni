import React, { PureComponent, RefObject } from 'react';

import i18n from 'i18next';
import { Link } from 'react-router-dom';

import { KeyCodeEnum } from '../../common/enums/keyCodesEnum';
import { shallow } from '../../common/helpers/ramda';
import { cls } from '../../common/helpers/styles';
import { LoginModel } from '../entities/loginModel';
import { RegistrationModel } from '../entities/registrationModel';
import { loginName, isLogged } from '../helpers/authHelper';
import { WelcomeLogo } from './welcomeLogo';

import dict from '../../common/helpers/i18n/dictionary/main.json';

interface RegistrationFormProps {
    loginErrors?: string;
    regErrors?: string;
    singIn(model: LoginModel): void;
    register(model: RegistrationModel): void;
}

interface RegistrationFormState {
    login: LoginModel;
    registration: RegistrationModel;
}

export default class RegistrationForm extends PureComponent<RegistrationFormProps, RegistrationFormState> {
    private onKeyDownHandler;

    private elementLoginUserName: RefObject<HTMLInputElement>;
    private elementLoginPassword: RefObject<HTMLInputElement>;

    public constructor(props: RegistrationFormProps, context: unknown) {
        super(props, context);

        this.state = {
            login: new LoginModel(),
            registration: new RegistrationModel()
        };

        this.elementLoginUserName = React.createRef();
        this.elementLoginPassword = React.createRef();

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
            <div className='registration-page'>
                <header className='registration__header'>
                    <div className='registration__container'>
                        <div className='header__logo'>
                            <div className='logo-animation'>
                                <a className='first-logo' href='/' title='Teics' />
                                <a className='second-logo' href='/' title='Teics' />
                            </div>
                        </div>
                        <div className='header__login'>
                            <div className='fields-container'>
                                <div className='field-item'>
                                    <div>{i18n.t(dict.identity.email)}</div>
                                    <input
                                        className={cls(['field', this.props.loginErrors ? 'error' : ''])}
                                        id='name'
                                        ref={this.elementLoginUserName}
                                        placeholder={i18n.t(dict.account.userName)}
                                        tabIndex={1}
                                        type='text'
                                        value={this.state.login.userName}
                                        onChange={e => this.setLoginState({ userName: e.target.value })}
                                    />
                                </div>
                                <div className='field-item'>
                                    <div>{i18n.t(dict.account.password)}</div>
                                    <input
                                        className={'field ' + (this.props.loginErrors ? 'error' : '')}
                                        id='password'
                                        ref={this.elementLoginPassword}
                                        placeholder={i18n.t(dict.account.password)}
                                        tabIndex={2}
                                        type='password'
                                        value={this.state.login.password}
                                        onChange={e => this.setLoginState({ password: e.target.value })}
                                    />
                                    <div>
                                        <a href='/'>{i18n.t(dict.identity.forgotPassword)}?</a>
                                    </div>
                                </div>
                                <div className='field-item'>
                                    <input
                                        className='button-login'
                                        type='button'
                                        value={i18n.t(dict.identity.login) as string}
                                        tabIndex={3}
                                        onClick={() => this.props.singIn(this.state.login)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className='registration__content'>
                    <div className='registration__container'>
                        <div className='welcome'>
                            <h1>{i18n.t(dict.identity.welcome)}!</h1>
                            <h2>{i18n.t(dict.identity.discoverNewOpportunities)}</h2>
                            <WelcomeLogo />
                        </div>
                        <div className='registration-form'>
                            <h3>{i18n.t(dict.identity.createAccount)}</h3>
                            <span>{i18n.t(dict.identity.enterData)}</span>
                            <div className='fields-container'>
                                <div className='field-item'>
                                    <input
                                        className='field'
                                        id='firstname'
                                        placeholder={i18n.t(dict.identity.name)}
                                        tabIndex={4}
                                        type='text'
                                        value={this.state.registration.firstName}
                                        onChange={e => this.setRegistrationState({ firstName: e.target.value })}
                                    />
                                    <input
                                        className='field'
                                        id='lastname'
                                        placeholder={i18n.t(dict.identity.surName)}
                                        tabIndex={5}
                                        type='text'
                                        value={this.state.registration.lastName}
                                        onChange={e => this.setRegistrationState({ lastName: e.target.value })}
                                    />
                                </div>
                                <div className='field-item'>
                                    <input
                                        className='field'
                                        id='email'
                                        placeholder={i18n.t(dict.identity.email)}
                                        tabIndex={6}
                                        type='text'
                                        value={this.state.registration.email}
                                        onChange={e => this.setRegistrationState({ email: e.target.value })}
                                    />
                                </div>
                                <div className='field-item'>
                                    <input
                                        className='field'
                                        id='company'
                                        placeholder={i18n.t(dict.identity.company)}
                                        tabIndex={7}
                                        type='text'
                                        value={this.state.registration.company}
                                        onChange={e => this.setRegistrationState({ company: e.target.value })}
                                    />
                                </div>
                                <div className='field-item'>
                                    <input
                                        className='field'
                                        id='password'
                                        placeholder={i18n.t(dict.account.password)}
                                        tabIndex={8}
                                        type='password'
                                        value={this.state.registration.password}
                                        onChange={e => this.setRegistrationState({ password: e.target.value })}
                                    />
                                </div>
                                <div className='field-item'>
                                    <input
                                        className='field'
                                        id='repassword'
                                        placeholder={i18n.t(dict.identity.passwordConfirmation)}
                                        tabIndex={9}
                                        type='password'
                                        value={this.state.registration.rePassword}
                                        onChange={e => this.setRegistrationState({ rePassword: e.target.value })}
                                    />
                                </div>
                                {this.props.regErrors ? (
                                    <span className='error-label'>{this.props.regErrors}</span>
                                ) : null}
                                <div className='field-item'>
                                    <input
                                        className='button-login'
                                        type='button'
                                        value={i18n.t(dict.identity.checkIn) as string}
                                        tabIndex={10}
                                        onClick={() => this.props.register(this.state.registration)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <footer className='registration__footer'>
                    <div className='registration__container'>
                        <div className='bottom-item'>
                            <div className='language-bar'>
                                <p>
                                    <Link
                                        to={'#'}
                                        onClick={() =>
                                            this.changeLanguage(i18n.language === 'ru-RU' ? 'en-US' : 'ru-RU')
                                        }
                                    >
                                        {i18n.t(dict.identity.switchLanguage)}
                                    </Link>
                                </p>
                            </div>
                            <div className='copyright-bar'>
                                <p>Teics © {new Date().getFullYear()}</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        ) : (
            <div className='loginForm'>
                <div className='row'>
                    {i18n.t(dict.identity.loggedInName)}, {loginName()}
                </div>
            </div>
        );
    }

    private setLoginState = (model: Partial<LoginModel>) => {
        this.setState({ login: shallow<LoginModel>(this.state.login, model) });
    };

    private setRegistrationState = (model: Partial<RegistrationModel>) => {
        this.setState({
            registration: shallow<RegistrationModel>(this.state.registration, model)
        });
    };

    private keyDownFunction(event) {
        if (event.keyCode === KeyCodeEnum.ENTER) {
            if (
                this.elementLoginUserName.current === document.activeElement ||
                this.elementLoginPassword.current === document.activeElement
            ) {
                this.props.singIn(this.state.login);
            } else {
                this.props.register(this.state.registration);
            }
        }
    }
}
