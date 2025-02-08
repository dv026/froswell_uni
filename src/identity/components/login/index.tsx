import React from 'react';

import {
    Box,
    Button,
    Center,
    Flex,
    Link,
    HStack,
    Divider,
    Text,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Image
} from '@chakra-ui/react';
import { capitalizeFirstLetter } from 'common/helpers/strings';
import { Formik, Form, Field } from 'formik';
import i18n from 'i18next';

import { ErrorIcon, InfoIcon, MailIcon } from '../../../common/components/customIcon/general';
import { LanguageEnum } from '../../../common/helpers/i18n/languageEnum';
import { LoginModel } from '../../entities/loginModel';

import mainDict from '../../../common/helpers/i18n/dictionary/main.json';

const textLogo = capitalizeFirstLetter(__APP_NAME__);

interface Props {
    login?: string;
    password?: string;
    errors?: string;
    Submit(model: LoginModel): void;
    LogOut(): void;
}

export const Login: React.FC<Props> = (p: Props) => {
    const changeLanguage = (lng: string): void => {
        i18n.changeLanguage(lng);
        window.location.reload();
    };

    return (
        <Flex
            w='100%'
            minH='100%'
            p={'20px'}
            justifyContent='center'
            bgColor='bg.grey100'
            backgroundImage="url('/images/background.png')"
            backgroundPosition='center'
            backgroundRepeat='no-repeat'
            fontSize='14px'
            lineHeight='18px'
            fontWeight='normal'
        >
            <Center>
                <Flex
                    w='482px'
                    h='528px'
                    bg='bg.white'
                    borderRadius='7px'
                    overflow='hidden'
                    boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.05)'}
                >
                    <Box pos='absolute' top='16px' right='16px' zIndex={1}>
                        <Link href={'#'} onClick={() => changeLanguage(i18n.language === 'ru-RU' ? 'en-US' : 'ru-RU')}>
                            {i18n.language === LanguageEnum.RU ? 'EN' : 'RU'}
                        </Link>
                    </Box>
                    <VStack spacing={4} align='stretch' w='100%' justifyContent='space-between' p='50px 90px'>
                        <Box>
                            <Box w='100%'>
                                <HStack justifyContent='space-between'>
                                    <Box fontSize='28px'>
                                        <LogoComponent />
                                    </Box>
                                    <Box h='44px'>
                                        <Divider orientation='vertical' m='0' />
                                    </Box>
                                    <Box w='125px'>
                                        <Text fontSize='12px' lineHeight='14px'>
                                            {i18n.t(mainDict.identity.tagline)}
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>
                        </Box>
                        <Box>
                            <FormikControl {...p} />
                        </Box>
                        <Box>
                            <VStack spacing='0' alignItems='start'>
                                <Box>
                                    <Button leftIcon={<InfoIcon color='icons.grey' boxSize={7} />} variant='link'>
                                        {i18n.t(mainDict.identity.instructions)}
                                    </Button>
                                </Box>
                                <Box>
                                    <Button leftIcon={<MailIcon color='icons.grey' boxSize={7} />} variant='link'>
                                        {i18n.t(mainDict.identity.writeMessage)}
                                    </Button>
                                </Box>
                            </VStack>
                        </Box>
                    </VStack>
                    {p.errors ? (
                        <Box
                            position='absolute'
                            bottom='0'
                            h='32px'
                            backgroundColor='icons.red'
                            color='bg.white'
                            w='100%'
                        >
                            <Center h='100%'>
                                <ErrorIcon boxSize={6} />
                                {p.errors}
                            </Center>
                        </Box>
                    ) : null}
                </Flex>
            </Center>
            <Box position='absolute' bottom='20px'>
                <div className='copyright'>
                    <a className='facebook' tabIndex={7} href='https://www.facebook.com/teics'>
                        {textLogo} <span className='year'>{new Date().getFullYear()}</span>
                    </a>
                </div>
            </Box>
        </Flex>
    );
};

const LogoComponent = () => {
    return (
        <Flex align='center'>
            <Image src={'/images/logo-login.svg'} w='35px' h='35px' />
            <Text fontSize='24px' paddingLeft='6px'>
                {textLogo}
            </Text>
        </Flex>
    );
};

const FormikControl: React.FC<Props> = (p: Props) => {
    const [login, setLogin] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();

    const validateName = value => {
        let error;
        if (!value) {
            error = 'Name is required';
        }

        return error;
    };

    return (
        <Formik
            initialValues={{}}
            onSubmit={(values, actions) => {
                setTimeout(() => {
                    //alert(JSON.stringify(values, null, 2));
                    actions.setSubmitting(false);
                }, 1000);
            }}
        >
            {props => (
                <Form>
                    <Field name='name' validate={validateName}>
                        {({ field, form }) => (
                            <FormControl isInvalid={form.errors.name && form.touched.name} pb='20px'>
                                <FormLabel htmlFor='name'>{i18n.t(mainDict.identity.name)}</FormLabel>
                                <Input
                                    {...field}
                                    id='name'
                                    placeholder={i18n.t(mainDict.identity.name)}
                                    size='lg'
                                    onChange={e => setLogin(e.target.value)}
                                />
                            </FormControl>
                        )}
                    </Field>
                    <Field name='password' validate={validateName}>
                        {({ field, form }) => (
                            <FormControl isInvalid={form.errors.password && form.touched.password} pb='20px'>
                                <FormLabel htmlFor='password'>{i18n.t(mainDict.account.password)}</FormLabel>
                                <Input
                                    {...field}
                                    id='password'
                                    placeholder={i18n.t(mainDict.account.password)}
                                    size='lg'
                                    type='password'
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <Box mt='10px'>
                                    <Link>{i18n.t(mainDict.identity.forgotPassword)}</Link>
                                </Box>
                            </FormControl>
                        )}
                    </Field>
                    <Button
                        w={'100%'}
                        isLoading={props.isSubmitting}
                        size='lg'
                        type='submit'
                        variant='primary'
                        onClick={() => p.Submit(new LoginModel(login, password))}
                    >
                        {i18n.t(mainDict.identity.login)}
                    </Button>
                    <Center h='40px'>
                        <Link>{i18n.t(mainDict.identity.checkIn)}</Link>
                    </Center>
                </Form>
            )}
        </Formik>
    );
};
