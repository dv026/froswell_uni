export default {
    parts: ['preview', 'input'],
    baseStyle: {
        input: {
            padding: '0 10px',
            _focus: { boxShadow: '0 0 0 2px rgba(49, 130, 206, 0.6)' }
        }
    },
    defaultProps: {
        focusBorderColor: 'typo.link'
    }
};
