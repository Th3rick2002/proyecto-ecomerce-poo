export interface IUser {
    id?: string;
    name: string;
    email: string;
    password: string;
}

export interface IUserResponse {
    id: string;
    name: string;
    email: string;
}