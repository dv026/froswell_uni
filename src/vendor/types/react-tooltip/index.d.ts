import React = require('react');

declare module 'react-tooltip' {
    interface Props {
        delayUpdate?: number;
    }
}
