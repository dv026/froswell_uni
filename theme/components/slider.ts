import { opacity } from '../../src/common/helpers/colors';
import colors from '../colors';

export default {
    parts: ['container', 'thumb', 'track', 'filledTrack'],
    baseStyle: {
        container: {},
        control: {}
    },
    variants: {
        brand: {
            filledTrack: {
                bg: colors.bg.brand
            },
            thumb: {
                boxSize: '12px',
                bg: colors.icons.green,
                marginLeft: '-6px',
                marginTop: '-14px',
                _after: {
                    content: `""`,
                    position: 'absolute',
                    width: '2px',
                    height: '12px',
                    backgroundColor: colors.icons.green,
                    boxShadow: `-2px 0px ${opacity(colors.icons.green, 0.2)}, 2px 0 ${opacity(
                        colors.icons.green,
                        0.2
                    )}`,
                    top: '9px'
                }
            }
        }
    },
    defaultProps: {}
};
