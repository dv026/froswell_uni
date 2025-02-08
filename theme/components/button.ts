export default {
    // The styles all button have in common
    baseStyle: {
        borderRadius: 'base', // <-- border radius is same for all variants and sizes
        fontWeight: 400,
        textTransform: 'uppercase',
        _focus: {
            boxShadow: 'none'
        }
    },
    // Two sizes: sm and md
    sizes: {
        md: {
            fontSize: '14px',
            lineHeight: '18px'
        }
    },
    // Two variants: outline and solid
    variants: {
        bookmark: {
            textTransform: 'inherit',
            //width: '120px',
            _active: {
                background: 'brand.500',
                border: 'none',
                borderRadius: '3px',
                color: 'typo.light',
                fontWeight: 700,
                _before: {
                    content: 'none'
                }
            },
            _hover: {
                bg: 'bg.grey200'
            },
            _disabled: {
                color: 'typo.secondary'
            },
            _before: {
                content: `""`,
                position: 'absolute',
                width: 'calc(100% - 29px)',
                height: '100%',
                borderBottom: '2px solid',
                borderColor: 'control.grey500'
            }
        },
        tabUnderline: {
            textTransform: 'inherit',
            color: 'typo.primary',
            transition: 'all .25s',
            paddingLeft: 0,
            paddingRight: 0,
            _active: {
                _before: {
                    bg: 'bg.brand',
                    border: '2px solid',
                    borderColor: 'bg.brand',
                    borderRadius: '4px',
                    content: `""`,
                    position: 'absolute',
                    top: '28px',
                    width: '100%'
                }
            },
            _hover: {
                _before: {
                    bg: 'control.grey300',
                    border: '2px solid',
                    borderColor: 'control.grey300',
                    borderRadius: '4px',
                    content: `""`,
                    position: 'absolute',
                    top: '27px',
                    width: '100%'
                }
            },
            _disabled: {
                color: 'typo.secondary'
            },
            _before: {
                content: 'none'
            }
        },
        callWindow: {
            background: 'bg.white',
            border: '1px solid',
            borderColor: 'control.grey300',
            borderRadius: '7px',
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
            textTransform: 'inherit',
            zIndex: 1,
            _hover: {
                background: 'bg.grey200'
            }
        },
        // todo mb
        callWindowActive: {
            color: 'typo.light',
            background: 'bg.brand',
            border: '1px solid',
            borderColor: 'control.grey300',
            borderRadius: '7px',
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
            textTransform: 'inherit',
            zIndex: 1
        },
        primary: {
            background: 'control.lightGreen',
            borderRadius: '4px',
            padding: '12px 15px',
            textTransform: 'inherit',
            _hover: {
                background: 'icons.green'
            },
            _disabled: {
                background: 'control.grey300',
                color: 'typo.secondary'
            }
        },
        stage: {
            borderRadius: '3px',
            width: '140px',
            height: '52px',
            paddingTop: '25px',
            textTransform: 'inherit',
            fontSize: '12px',
            color: 'bg.brand',
            zIndex: 1,
            _hover: {
                background: 'bg.selected'
            },
            _active: {
                background: 'bg.selected',
                fontWeight: 'bold'
            },
            _disabled: {
                //background: 'control.grey300',
                color: 'typo.secondary'
            }
        },
        nextStage: {
            textTransform: 'inherit',
            color: 'typo.link',
            _hover: {
                color: 'typo.hover'
            },
            _disabled: {
                background: 'control.grey300',
                color: 'typo.secondary'
            }
        },
        cancel: {
            bg: 'bg.grey100',
            border: '1px solid',
            borderColor: 'control.grey400',
            color: 'typo.primary',
            minWigth: '120px',
            padding: '12px 8px',
            textTransform: 'initial',
            _hover: {
                background: 'control.grey300'
            },
            _disabled: {
                background: 'control.grey300',
                color: 'typo.secondary'
            }
        },
        wellType: {
            alignItems: 'center',
            background: 'bg.grey200',
            border: '1px solid',
            borderColor: 'control.grey300',
            borderRadius: '3px',
            boxShadow: 'none',
            color: 'bg.brand',
            cursor: 'pointer',
            justifyContent: 'center',
            textTransform: 'inherit',
            _active: {
                bg: 'bg.brand',
                color: 'icons.white',
                fontWeight: 'bold'
            },
            _focus: {
                boxShadow: 'none'
            },
            _disabled: {
                color: 'typo.secondary',
                opacity: 0.5,
                cursor: 'not-allowed'
            }
        },
        outline: {
            border: '2px solid',
            borderColor: 'purple.500',
            color: 'purple.500'
        },
        solid: {
            fontWeight: 700,
            borderRadius: '3px',
            color: 'typo.light',
            textTransform: 'inherit'
        },
        link: {
            color: 'typo.link',
            textTransform: 'inherit'
        },
        unstyled: {
            display: 'inline-flex',
            textTransform: 'inherit',
            _hover: {
                color: 'typo.secondary'
            }
        }
    },
    // The default size and variant values
    defaultProps: {
        size: 'md',
        variant: 'solid',
        colorScheme: 'brand'
    }
};
