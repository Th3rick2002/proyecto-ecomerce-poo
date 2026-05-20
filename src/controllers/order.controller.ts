import {Request, Response} from "express";
import {OrderService} from "../services/order.service";

export class OrderController {
    private orderService: OrderService;

    constructor(orderService: OrderService) {
        this.orderService = orderService;
    }

    async getAllOrders(req: Request, res: Response) {
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;

        const orders = await this.orderService.getAllOrders(offset, limit);

        res.status(200).json({
            data: orders,
        });
    }

    async createOrder(req: Request, res: Response) {
        const order = req.body;

        await this.orderService.createOrder(order);

        res.status(201).json({
            message: "Pedido creado correctamente",
        });
    }
}