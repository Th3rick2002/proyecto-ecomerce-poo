import express, {Express} from "express";
import {DataBase} from "./database/db";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import {errorHandler} from "./middlewares/error.middleware";
import orderRoutes from "./routes/order.routes";
import cors from "cors"


export class Server {
    private server: express.Application;

    constructor(server: express.Application) {
        this.server = server;
    }

    async initServices() {
        const db = DataBase.getDataBaseInstance()
        await db.init()

        this.server.use('/api/', userRoutes)
        this.server.use('/api/', categoryRoutes)
        this.server.use('/api', productRoutes)
        this.server.use('/api', orderRoutes)
    }

    async startServer() {
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: true }));
        this.server.use(cors())

        await this.initServices()

        this.server.use(errorHandler)

        this.server.listen(3000, () => {
            console.log('Server is running on port 3000')
        });
    }
}