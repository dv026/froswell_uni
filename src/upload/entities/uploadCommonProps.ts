export interface UploadCommonProps {
    keyData: string;
    title: string;
    totalRowCount: number;
    error: string;
    upload: (file: FormData, clearData: boolean) => void;
}
