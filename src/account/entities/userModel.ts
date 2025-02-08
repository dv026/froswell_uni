export class UserModel {
    public id: number;
    public userName: string;
    public email: string;
    public password: string;
    public isAdmin: boolean;

    public constructor(id: number, username: string, email: string, password: string, isAdmin: boolean) {
        this.id = id;
        this.userName = username;
        this.email = email;
        this.password = password;
        this.isAdmin = isAdmin;
    }
}
