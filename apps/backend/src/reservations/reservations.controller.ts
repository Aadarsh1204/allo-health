import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {}

    @Get()
    findAll() {
        return this.reservationsService.findAll();
    }

    @Get(':id')
        findOne(@Param('id') id: string) {
        return this.reservationsService.findOne(id);
    }

    @Post()
    create(
        @Body() dto: CreateReservationDto,
        @Headers('idempotency-key') idempotencyKey?: string,
    ) {
        return this.reservationsService.create(dto, idempotencyKey);
    }

    @Post(':id/confirm')
    confirm(
        @Param('id') id: string,
        @Headers('idempotency-key') idempotencyKey?: string,
    ) {
        return this.reservationsService.confirm(id, idempotencyKey);
    }

    @Post(':id/release')
    release(@Param('id') id: string) {
        return this.reservationsService.release(id);
    }
}
