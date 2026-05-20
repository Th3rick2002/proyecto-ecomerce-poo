import {Request, Response} from "express";
import {UserService} from "../services/user.service";
import {IUser} from "../interfaces/user.interface";

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async getAllUsers(req: Request, res: Response) {
        const users = await this.userService.getAllUsers();

        res.status(200).json({
            data: users,
        });
    }

    async getUserById(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({ message: "ID inválido" });
        }

        const user = await this.userService.getUserById(id);

        res.status(200).json({
            data: user,
        })
    }

    async createUser(req: Request, res: Response) {
        const user: IUser = req.body;

        await this.userService.createUser(user);

        res.status(201).json({
            message: "Usuario creado correctamente",
        })
    }

    async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const user: IUser = req.body;

        if (typeof id !== 'string') {
            return res.status(400).json({ message: "ID inválido" });
        }

        await this.userService.updateUser(id, user);

        res.status(200).json({
            message: "Usuario actualizado correctamente",
        })
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({ message: "ID inválido" });
        }

        await this.userService.deleteUser(id);

        res.status(200).json({
            message: "Usuario eliminado correctamente",
        })
    }
}