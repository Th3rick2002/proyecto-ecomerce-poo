# Servicios, controladores y rutas

## Interfaces

Definir los contratos de datos en `src/interfaces/user.interface.ts`:

```typescript
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
```

## Servicios (`src/services/user.service.ts`)

El servicio maneja la lógica de negocio y la interacción con el repositorio de TypeORM.

```typescript
import { User } from "../entities/user.entity";
import { DataBase } from "../database/db";
import { IUser, IUserResponse } from "../interfaces/user.interface";

export class UserService {
    private database = DataBase.getDataBaseInstance();
    private userRepository = this.database.getDataSource().getRepository(User);

    async getAllUsers(): Promise<IUserResponse[]> {
        const users = await this.userRepository.find();
        return users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
        }));
    }
    
    async getUserById(id: string): Promise<IUserResponse | null> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) return null;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }

    async createUser(user: IUser) {
        const newUser = this.userRepository.create(user);
        return await this.userRepository.save(newUser);
    }
}
```

## Controladores (`src/controllers/user.controller.ts`)

El controlador procesa las peticiones HTTP y utiliza el servicio.

```typescript
import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
    constructor(private userService: UserService) {}

    async getAllUsers(req: Request, res: Response) {
        const users = await this.userService.getAllUsers();
        res.status(200).json({ data: users });
    }
    
    async getUserById(req: Request, res: Response) {
        const { id } = req.params;
        const user = await this.userService.getUserById(id);
        res.status(200).json({ data: user });
    }

    async createUser(req: Request, res: Response) {
        await this.userService.createUser(req.body);
        res.status(201).json({ message: "Usuario creado correctamente" });
    }
}
```

## Rutas (`src/routes/user.routes.ts`)

```typescript
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";

const userRouter = Router();
const userService = new UserService();
const userController = new UserController(userService);

userRouter.get('/users', (req, res) => userController.getAllUsers(req, res));
userRouter.get('/users/:id', (req, res) => userController.getUserById(req, res));
userRouter.post('/users', (req, res) => userController.createUser(req, res));

export default userRouter;
```

## Integración en el Servidor (`src/server.ts`)

Se recomienda abstraer la configuración de Express en una clase `Server`.

```typescript
import express from "express";
import { DataBase } from "./database/db";
import userRoutes from "./routes/user.routes";
import cors from "cors";

export class Server {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    private config() {
        this.app.use(express.json());
        this.app.use(cors());
    }

    private routes() {
        this.app.use('/api', userRoutes);
    }

    async start() {
        const db = DataBase.getDataBaseInstance();
        await db.init();
        this.app.listen(3000, () => console.log('Server on port 3000'));
    }
}
```
