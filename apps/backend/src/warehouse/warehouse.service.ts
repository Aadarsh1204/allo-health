import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WarehouseService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.warehouse.findMany({
            include: {
                stock: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
}
