export class LoginModel {
    public userName: string;
    public password: string;

    public constructor(userName: string = '', password: string = '') {
        this.userName = userName;
        this.password = password;
    }
}
