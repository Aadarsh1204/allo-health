import { Injectable, NotFoundException, ConflictException, GoneException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReservationsService {
    constructor(
        private prisma: PrismaService,
        private redisService: RedisService,
    ) {}

    async create(dto: CreateReservationDto, idempotencyKey?: string) {
    if (idempotencyKey) {
        const existing = await this.prisma.reservation.findUnique({
        where: { idempotencyKey },
        include: { product: true, warehouse: true },
        });
        if (existing) return existing;
    }

    const lockKey = `lock:stock:${dto.productId}:${dto.warehouseId}`;
    const lock = await this.redisService.redlock.acquire([lockKey], 5000);

    try {
        const stock = await this.prisma.stock.findUnique({
        where: {
            productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
            },
        },
        });

        if (!stock) throw new NotFoundException('Stock not found');

        const available = stock.total - stock.reserved;
        if (available < dto.quantity) {
        throw new ConflictException('Insufficient stock available');
        }

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const [reservation] = await this.prisma.$transaction([
        this.prisma.reservation.create({
            data: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
            quantity: dto.quantity,
            expiresAt,
            idempotencyKey,
            },
        }),
        this.prisma.stock.update({
            where: {
            productId_warehouseId: {
                productId: dto.productId,
                warehouseId: dto.warehouseId,
            },
            },
            data: { reserved: { increment: dto.quantity } },
        }),
        ]);

        return reservation;
        } finally {
            await lock.release();
        }
    }

    async confirm(id: string, idempotencyKey?: string) {
    const reservation = await this.prisma.reservation.findUnique({
        where: { id },
        include: { product: true, warehouse: true },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    // Idempotency check — already confirmed, return as-is
    if (reservation.status === 'CONFIRMED') return reservation;

    if (new Date() > reservation.expiresAt) {
        throw new GoneException('Reservation has expired');
    }

    if (reservation.status !== 'PENDING') {
        throw new ConflictException('Only pending reservations can be confirmed');
    }

    return this.prisma.reservation.update({
        where: { id },
        data: { status: 'CONFIRMED', confirmedAt: new Date() },
        include: { product: true, warehouse: true },
    });
    }
    
    async release(id: string) {
        const reservation = await this.prisma.reservation.findUnique({ where: { id } });

        if(!reservation) {
            throw new NotFoundException('Reservation not found');
        }
        if(reservation.status === 'RELEASED'){
            throw new ConflictException ('Reservation already released');
        }

        return this.prisma.$transaction([
            this.prisma.reservation.update({
                where: { id },
                data: { status: 'RELEASED', releasedAt: new Date() },
                include: {
                    product: true,
                    warehouse: true,
                },
            }),
            this.prisma.stock.update({
                where: {
                    productId_warehouseId: {
                        productId: reservation.productId,
                        warehouseId: reservation.warehouseId,
                    },
                },  
                data: { reserved: { decrement: reservation.quantity } },
            }),
        ]);
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async releaseExpiredReservations() {
        const expired = await this.prisma.reservation.findMany({
            where: {
                status: 'PENDING',
                expiresAt: { lt: new Date() },
            },
        });

        for(const reservation of expired) {
            await this.release(reservation.id);
        }
    }

    async findAll() {
        return this.prisma.reservation.findMany({
            include: {
                product: true,
                warehouse: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: {
            product: true,
            warehouse: true,
            },
        });

        if (!reservation) throw new NotFoundException('Reservation not found');

        return reservation;
    }

}
