import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class RedisService {
    public readonly client: Redis;
    public readonly redlock: Redlock;

    constructor() {
        this.client = new Redis(process.env.REDIS_URL!, {
            tls: {},
            maxRetriesPerRequest: 3,
        });

        this.redlock = new Redlock([this.client], {
            retryCount: 3,
            retryDelay: 200,
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}
