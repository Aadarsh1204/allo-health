import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {}

    @Post()
    create(@Body() dto: CreateReservationDto) {
        return this.reservationsService.create(dto);
    }

    @Patch(':id/confirm')
    confirm(@Param('id') id: string) {
        return this.reservationsService.confirm(id);
    }

    @Patch(':id/release')
    release(@Param('id') id: string) {
        return this.reservationsService.release(id);
    }
}
