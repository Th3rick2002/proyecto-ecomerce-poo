import {Router, Request, Response} from "express";
import {OrderService} from "../services/order.service";
import {OrderController} from "../controllers/order.controller";


const orderRoutes = Router();

const orderService = new OrderService();
const orderController = new OrderController(orderService);

orderRoutes.get("/order", (req: Request, res: Response) => orderController.getAllOrders(req, res));

orderRoutes.post("/order", (req: Request, res: Response) => orderController.createOrder(req, res));

export default orderRoutes;