import {OrderStatus} from "../entities/order.entity";

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


export interface IOrderCreate extends IOrder{
    orderDetails: IOrderDetails[];
}



export interface IOrderDetailsResponse extends IOrderDetails {
    productName: string;
    productPrice: number;
    productCategory: string;
}

export interface IOrderResponse {
    id: string;
    status: OrderStatus;
    total: number;
    userName: string;
    userEmail: string;
    orderDetails: IOrderDetailsResponse[];
}