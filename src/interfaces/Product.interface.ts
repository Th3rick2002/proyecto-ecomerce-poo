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