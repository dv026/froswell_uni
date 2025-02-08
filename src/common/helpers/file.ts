import { saveAs } from 'file-saver';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const downloadFile = response => {
    let url = window.URL.createObjectURL(new Blob([response.data]));

    let filename = response.headers['content-disposition']
        .split(';')
        .find(n => n.includes('filename='))
        .replace('filename=', '')
        .trim();

    saveAs(url, filename);
};
