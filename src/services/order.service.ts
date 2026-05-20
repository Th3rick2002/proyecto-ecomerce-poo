import {DataBase} from "../database/db";
import {Product} from "../entities/product.entity";
import {Order} from "../entities/order.entity";
import {OrderDetailsEntity} from "../entities/orderDetails.entity";
import {IOrderCreate, IOrderResponse} from "../interfaces/Order.interface";
import {User} from "../entities/user.entity";
import {In} from "typeorm";
import {BadRequestError, NotFoundError} from "../middlewares/error.middleware";

export class OrderService {
    private database = DataBase.getDataBaseInstance();
    private queryRunner = this.database.getDataSource().createQueryRunner();
    private productRepository = this.database.getDataSource().getRepository(Product);
    private userRepository = this.database.getDataSource().getRepository(User);
    private orderRepository = this.database.getDataSource().getRepository(Order);

    async getAllOrders(offset: number, limit: number) {
        const orders = await this.orderRepository.find({
            relations: [
                'user',
                'orderDetails',
                'orderDetails.product',
                "orderDetails.product.category"
            ],
            relationLoadStrategy: "query",
            order: {
                id: "DESC"
            },
            skip: offset,
            take: limit
        });

        console.log(orders)

        const response: IOrderResponse[] = orders.map(order => ({
            id: order.id,
            status: order.status,
            total: order.total,
            userName: order.user?.name || "Unknown",
            userEmail: order.user?.email || "Unknown",
            orderDetails: order.orderDetails?.map(od => ({
                id: od.id,
                quantity: od.quantity,
                unitPrice: od.unitPrice,
                orderId: order.id,
                productId: od.product?.id,
                productName: od.product?.name || "Unknown",
                productPrice: od.product?.price,
                productCategory: od.product?.category?.name || "Unknown"
            })) || []
        }));

        return response;
    }

    async createOrder(order: IOrderCreate) {
        const userExist = await this.userRepository.findOneBy({ id: order.userId });
        if (!userExist) throw new NotFoundError("User not found");
        if (order.total <= 0) throw new BadRequestError("Total must be > 0");
        if (order.orderDetails.length === 0) throw new BadRequestError("Order details cannot be empty");

        const productIds = order.orderDetails.map(p => p.productId);
        const productsInDb = await this.productRepository.findBy({ id: In(productIds) });

        if (productsInDb.length !== productIds.length) {
            throw new NotFoundError("One or more products were not found");
        }

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
                if (od.quantity <= 0 || od.unitPrice <= 0) throw new BadRequestError("Invalid quantity or price");
                
                const product = productsInDb.find(p => p.id === od.productId);

                return this.queryRunner.manager.create(OrderDetailsEntity, {
                    quantity: od.quantity,
                    unitPrice: od.unitPrice,
                    order: orderSaved,
                    product: product
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