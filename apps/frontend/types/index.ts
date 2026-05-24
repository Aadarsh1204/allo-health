export type Warehouse = {
    id: string;
    name: string;
    location: string;
};

export type Stock = {
    id: string;
    productId: string;
    warehouseId: string;
    total: number;
    reserved: number;
    warehouse: Warehouse;
};

export type Product = {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: Stock[];
};

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'RELEASED';

export type Reservation = {
    id: string;
    productId: string;
    quantity: number;
    status: ReservationStatus;
    expiresAt: string;
    confirmedAt: string | null;
    releasedAt: string | null;
    createdAt: string;
    product: Product;
    warehouse: Warehouse;
};