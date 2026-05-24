export class CreateReservationDto {
    productId!: string;
    warehouseId!: string;
    quantity!: number;
    idempotencyKey?: string;
}