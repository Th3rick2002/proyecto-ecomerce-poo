# Practica 12 POO

Para esta práctica se realizarán las siguientes tareas:
- Se crearán los CRUD de **product**, **order** y **orderDetails**.
- Se creará un middleware para capturar errores de forma global en el servidor.
- Se creará una entidad base para que todas las entidades hagan herencia de esta entidad.
- Se reescribirá la instancia principal de Express para que sea una clase.

---

## 1. Actualización de Configuración (tsconfig.json)

Si vienes de las prácticas anteriores, es importante agregar la siguiente propiedad en tu archivo `tsconfig.json` dentro de `compilerOptions`. Esto evitará que TypeScript marque errores en las propiedades de las entidades de TypeORM que no se inicializan en el constructor.

Abre `tsconfig.json` y asegúrate de agregar `"strictPropertyInitialization": false`:

```json
{
  "compilerOptions": {
    // ... configuraciones anteriores
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  },
  "include": ["src"]
}
```

## 2. Instalación de Dependencias

Instalar las dependencias de CORS antes de empezar para permitir peticiones desde el frontend:

```bash
pnpm i cors
pnpm i -D @types/cors
```

---

## 3. Middleware de Errores

En el directorio `src/middlewares` crear el archivo `error.middleware.ts`. Este middleware se encargará de mostrar mensajes claros y sus respectivos códigos HTTP para el usuario que consuma la API.

```typescript
import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Not Found") {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Conflict") {
        super(message, 409);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (!(err instanceof AppError)) {
        const msg = message.toLowerCase();
        
        if (msg.includes("not found")) {
            statusCode = 404;
        } else if (msg.includes("already exists") || msg.includes("conflict") || msg.includes("unique constraint")) {
            statusCode = 409;
        } else if (msg.includes("unauthorized") || msg.includes("invalid token") || msg.includes("login failed")) {
            statusCode = 401;
        } else if (msg.includes("forbidden") || msg.includes("permission denied")) {
            statusCode = 403;
        } else if (msg.includes("bad request") || msg.includes("invalid") || msg.includes("validation") || msg.includes("bad data")) {
            statusCode = 400;
        }
    }

    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        message = "Internal Server Error";
    }

    res.status(statusCode).json({
        status: "error",
        statusCode: statusCode,
        message: message,
    });
};
```

### 3.1. ¿Cómo usar los errores del Middleware?

Antes del middleware se tenían errores genéricos que terminaban en un código 500 o hacían que el servidor se detuviera si no se manejaban. Ahora, debemos usar las clases específicas creadas arriba para que el `errorHandler` pueda identificarlas y devolver el código HTTP correcto automáticamente.

**Antes (Mal):**
```typescript
if (!user) {
    throw new Error("User not found"); // Esto devolverá un 500 por defecto
}
```

**Ahora (Bien):**
```typescript
import { NotFoundError } from "../middlewares/error.middleware";

if (!user) {
    throw new NotFoundError("El usuario solicitado no existe"); // El middleware devolverá un 404
}
```

**Otro ejemplo (Conflicto/Duplicado):**
```typescript
import { ConflictError } from "../middlewares/error.middleware";

if (emailExists) {
    throw new ConflictError("El correo ya está registrado"); // El middleware devolverá un 409
}
```

Esto permite que tus servicios se enfoquen solo en lanzar la excepción correcta, y el controlador/middleware se encarguen de la respuesta al cliente.

---

## 4. Instancia del Servidor

En el directorio `src` crear el archivo `server.ts` el cual contendrá la clase principal del servidor:

```typescript
import express from "express";
import { DataBase } from "./database/db";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import { errorHandler } from "./middlewares/error.middleware";
import cors from "cors";

export class Server {
    private server: express.Application;

    constructor(server: express.Application) {
        this.server = server;
    }

    async initServices() {
        const db = DataBase.getDataBaseInstance();
        await db.init();

        this.server.use('/api/', userRoutes);
        this.server.use('/api/', categoryRoutes);
        this.server.use('/api/', productRoutes);
        this.server.use('/api/', orderRoutes);
    }

    async startServer() {
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: true }));
        this.server.use(cors());

        await this.initServices();

        this.server.use(errorHandler);

        this.server.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    }
}
```

Como ahora tenemos esta clase principal, el `index.ts` nos quedará de la siguiente forma:

```typescript
import 'reflect-metadata';
import 'dotenv/config';
import { Server } from "./server";
import express from "express";

const server = new Server(express());
server.startServer();
```

---

## 5. Entidad Base

Para agregar campos de auditoría como `created_at`, `updated_at` y `deleted_at` se puede hacer entidad por entidad, pero como las entidades son clases, se puede hacer mediante una clase abstracta.

Código del archivo `src/entities/baseEntity.ts`:

```typescript
import {
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn
} from "typeorm";

export abstract class BaseEntity {
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
```

> [!IMPORTANT]
> Debe ser una clase **abstracta** ya que si es una clase normal dará error cuando se creen los campos en la base de datos.

En las entidades (User, Category, Product, Order, OrderDetails) debemos heredar de esta clase. Ejemplo con `Category`:

```typescript
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { BaseEntity } from "./baseEntity";

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({
        type: "varchar",
        length: 20,
        unique: true,
    })
    name: string;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
```

---

## 6. Guía de Implementación: Product, Order y OrderDetails

En esta sección implementaremos toda la lógica de negocio para los productos y los pedidos (órdenes), incluyendo el detalle de cada pedido.

### 6.1. Entidades (Relaciones y Herencia)

Debemos actualizar nuestras entidades para que hereden de `BaseEntity` y establecer las relaciones necesarias.

**Entidad de Producto (`src/entities/product.entity.ts`)**
```typescript
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";
import { BaseEntity } from "./baseEntity";

@Entity()
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 20 })
    name: string;

    @Column({ type: "decimal" })
    price: number;

    @Column({ type: "int", default: 0 })
    stock: number;

    @Column({ type: "int", nullable: true })
    categoryId: number;

    @ManyToOne(() => Category)
    @JoinColumn({ name: "categoryId" })
    category: Category;
}
```

**Entidad de Pedido (`src/entities/order.entity.ts`)**
```typescript
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "./baseEntity";
import { OrderDetailsEntity } from "./orderDetails.entity";

export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

@Entity()
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    status: OrderStatus;

    @Column({ type: "decimal", scale: 2, default: 0 })
    total: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @OneToMany(() => OrderDetailsEntity, (orderDetails) => orderDetails.order)
    orderDetails: OrderDetailsEntity[];
}
```

**Entidad de Detalle de Pedido (`src/entities/orderDetails.entity.ts`)**
```typescript
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "./product.entity";
import { BaseEntity } from "./baseEntity";

@Entity()
export class OrderDetailsEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "int", default: 0 })
    quantity: number;

    @Column({ type: "decimal", scale: 2, default: 0 })
    unitPrice: number;

    @ManyToOne(() => Order, (order) => order.orderDetails)
    @JoinColumn({ name: "orderId" })
    order: Order;

    @ManyToOne(() => Product)
    @JoinColumn({ name: "productId" })
    product: Product;
}
```

---

### 6.2. Interfaces (Contratos de Datos)

Las interfaces nos ayudan a definir cómo deben lucir los datos que recibimos y enviamos.

**Producto (`src/interfaces/Product.interface.ts`)**
```typescript
export interface IProduct {
    id?: string;
    name: string;
    price: number;
    stock: number;
    categoryId: number;
}

export interface IProductResponse extends IProduct {
    category: string;
}
```

**Pedido y Detalles (`src/interfaces/Order.interface.ts`)**
```typescript
import { OrderStatus } from "../entities/order.entity";

export interface IOrder {
    id?: string;
    status: OrderStatus;
    total: number;
    userId: string;
}

export interface IOrderDetails {
    id?: string;
    quantity: number;
    unitPrice: number;
    orderId?: string;
    productId: string;
}

export interface IOrderCreate extends IOrder {
    orderDetails: IOrderDetails[];
}

export interface IOrderResponse {
    id: string;
    status: OrderStatus;
    total: number;
    userName: string;
    userEmail: string;
    orderDetails: IOrderDetailsResponse[];
}

export interface IOrderDetailsResponse extends IOrderDetails {
    productName: string;
    productPrice: number;
    productCategory: string;
}
```

---

### 6.3. Servicios (Lógica de Negocio)

> [!NOTE]
> En el servicio de Pedidos (`OrderService`) utilizamos **Transacciones de TypeORM**. Esto asegura que si algo falla al guardar los detalles, no se cree el pedido a medias, garantizando la integridad de la base de datos.

**Servicio de Producto (`src/services/product.service.ts`)**
```typescript
import { DataBase } from "../database/db";
import { Product } from "../entities/product.entity";
import { IProduct, IProductResponse } from "../interfaces/Product.interface";
import { Category } from "../entities/category.entity";
import { NotFoundError } from "../middlewares/error.middleware";

export class ProductService {
    private database = DataBase.getDataBaseInstance();
    private categoryRepository = this.database.getDataSource().getRepository(Category);
    private productRepository = this.database.getDataSource().getRepository(Product);

    async getAllProducts() {
        const products = await this.productRepository.find({
            relations: ['category']
        });

        return products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            categoryId: product.category.id,
            category: product.category.name
        }));
    }

    async createProduct(product: IProduct) {
        const categoryExist = await this.categoryRepository.findOneBy({ id: product.categoryId });
        if (!categoryExist) throw new NotFoundError("Category not found");

        const newProduct = this.productRepository.create({
            ...product,
            category: categoryExist
        });

        return this.productRepository.save(newProduct);
    }
}
```

**Servicio de Pedido (`src/services/order.service.ts`)**
```typescript
import { DataBase } from "../database/db";
import { Product } from "../entities/product.entity";
import { Order } from "../entities/order.entity";
import { OrderDetailsEntity } from "../entities/orderDetails.entity";
import { IOrderCreate, IOrderResponse } from "../interfaces/Order.interface";
import { User } from "../entities/user.entity";
import { BadRequestError, NotFoundError } from "../middlewares/error.middleware";

export class OrderService {
    private database = DataBase.getDataBaseInstance();
    private queryRunner = this.database.getDataSource().createQueryRunner();
    private productRepository = this.database.getDataSource().getRepository(Product);
    private userRepository = this.database.getDataSource().getRepository(User);
    private orderRepository = this.database.getDataSource().getRepository(Order);

    async getAllOrders(offset: number, limit: number) {
        const orders = await this.orderRepository.find({
            relations: ['user', 'orderDetails', 'orderDetails.product', 'orderDetails.product.category'],
            skip: offset,
            take: limit,
            order: { createdAt: "DESC" }
        });

        return orders.map(order => ({
            id: order.id,
            status: order.status,
            total: order.total,
            userName: order.user?.name || "Unknown",
            userEmail: order.user?.email || "Unknown",
            orderDetails: order.orderDetails.map(od => ({
                id: od.id,
                quantity: od.quantity,
                unitPrice: od.unitPrice,
                productId: od.product?.id,
                productName: od.product?.name || "Unknown",
                productPrice: od.product?.price,
                productCategory: od.product?.category?.name || "Unknown"
            }))
        }));
    }

    async createOrder(order: IOrderCreate) {
        const userExist = await this.userRepository.findOneBy({ id: order.userId });
        if (!userExist) throw new NotFoundError("User not found");

        await this.queryRunner.connect();
        await this.queryRunner.startTransaction();

        try {
            const newOrder = this.queryRunner.manager.create(Order, {
                status: order.status,
                total: order.total,
                user: userExist
            });
            const orderSaved = await this.queryRunner.manager.save(newOrder);

            const detailsToSave = order.orderDetails.map(od => {
                return this.queryRunner.manager.create(OrderDetailsEntity, {
                    quantity: od.quantity,
                    unitPrice: od.unitPrice,
                    order: orderSaved,
                    product: { id: od.productId }
                });
            });

            await this.queryRunner.manager.save(detailsToSave);
            await this.queryRunner.commitTransaction();
            return orderSaved;
        } catch (e) {
            await this.queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await this.queryRunner.release();
        }
    }
}
```

---

### 6.4. Controladores (Manejo de Peticiones)

**Controlador de Producto (`src/controllers/product.controller.ts`)**
```typescript
import { ProductService } from "../services/product.service";
import { Request, Response } from "express";

export class ProductController {
    constructor(private productsService: ProductService) {}

    async getAllProducts(req: Request, res: Response) {
        const products = await this.productsService.getAllProducts();
        res.status(200).json({ data: products });
    }

    async createProduct(req: Request, res: Response) {
        await this.productsService.createProduct(req.body);
        res.status(201).json({ message: "Producto creado correctamente" });
    }
}
```

**Controlador de Pedido (`src/controllers/order.controller.ts`)**
```typescript
import { Request, Response } from "express";
import { OrderService } from "../services/order.service";

export class OrderController {
    constructor(private orderService: OrderService) {}

    async getAllOrders(req: Request, res: Response) {
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;
        const orders = await this.orderService.getAllOrders(offset, limit);
        res.status(200).json({ data: orders });
    }

    async createOrder(req: Request, res: Response) {
        await this.orderService.createOrder(req.body);
        res.status(201).json({ message: "Pedido creado correctamente" });
    }
}
```

---

### 6.5. Rutas (Endpoints)

Finalmente, exponemos nuestra lógica a través de rutas de Express.

**Rutas de Producto (`src/routes/product.routes.ts`)**
```typescript
import { Router } from "express";
import { ProductService } from "../services/product.service";
import { ProductController } from "../controllers/product.controller";

const productRoutes = Router();
const productService = new ProductService();
const productController = new ProductController(productService);

productRoutes.get('/products', (req, res) => productController.getAllProducts(req, res));
productRoutes.post('/products', (req, res) => productController.createProduct(req, res));

export default productRoutes;
```

**Rutas de Pedido (`src/routes/order.routes.ts`)**
```typescript
import { Router } from "express";
import { OrderService } from "../services/order.service";
import { OrderController } from "../controllers/order.controller";

const orderRoutes = Router();
const orderService = new OrderService();
const orderController = new OrderController(orderService);

orderRoutes.get("/order", (req, res) => orderController.getAllOrders(req, res));
orderRoutes.post("/order", (req, res) => orderController.createOrder(req, res));

export default orderRoutes;
```

> [!IMPORTANT]
> Recuerda asegurarte de que estas nuevas rutas (`productRoutes` y `orderRoutes`) ya están registradas en tu archivo `src/server.ts` dentro del método `initServices()` (tal como se mostró en la Sección 4).
