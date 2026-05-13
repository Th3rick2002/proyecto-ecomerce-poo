import { Router, Request, Response } from "express";
import {UserController} from "../controllers/user.controller";
import {UserService} from "../services/user.service";

const userRouter = Router();

const userService = new UserService();
const userController = new UserController(userService);

userRouter.get('/users', (req: Request, res: Response) => userController.getAllUsers(req, res));

userRouter.post('/users', (req: Request, res: Response) => userController.createUser(req, res));

userRouter.get('/users/:id', (req: Request, res: Response) => userController.getUserById(req, res));

export default userRouter;