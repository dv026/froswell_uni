// theme.js
import { extendTheme } from '@chakra-ui/react';

// Global colors
import colors from './colors';
// Component style overrides
import Accordion from './components/accordion';
import Breadcrumb from './components/breadcrumb';
import Button from './components/button';
import Checkbox from './components/checkbox';
import Divider from './components/divider';
import Editable from './components/editable';
import Form from './components/form';
import FormControl from './components/formControl';
import FormLabel from './components/formLabel';
import Heading from './components/heading';
import Input from './components/input';
import Link from './components/link';
import Menu from './components/menu';
import Modal from './components/modal';
import NumberInput from './components/numberInput';
import Popover from './components/popover';
import Progress from './components/progress';
import Radio from './components/radio';
import Skeleton from './components/skeleton';
import Slider from './components/slider';
import Stat from './components/stat';
import Switch from './components/switch';
import Table from './components/table';
import Tabs from './components/tabs';
// Foundational style overrides
import borders from './foundations/borders';
// Global style overrides
import styles from './styles';

const overrides = {
    colors,
    styles,
    borders,
    fonts: {
        body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        heading:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        mono: 'Inter, SFMono-Regular, Menlo, Monaco,Consolas, "Liberation Mono", "Courier New", monospace'
    },
    // Other foundational style overrides go here
    components: {
        Accordion: Accordion,
        Breadcrumb: Breadcrumb,
        Button: Button,
        Checkbox: Checkbox,
        Divider: Divider,
        Editable: Editable,
        Form: Form,
        FormControl: FormControl,
        FormLabel: FormLabel,
        Heading: Heading,
        Input: Input,
        Link: Link,
        Menu: Menu,
        Modal: Modal,
        NumberInput: NumberInput,
        Popover: Popover,
        Progress: Progress,
        Radio: Radio,
        Skeleton: Skeleton,
        Slider: Slider,
        Stat: Stat,
        Switch: Switch,
        Table: Table,
        Tabs: Tabs
    }
    //Other components go here
};
export default extendTheme(overrides);
