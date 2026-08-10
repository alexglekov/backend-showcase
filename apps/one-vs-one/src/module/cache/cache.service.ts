import { Injectable } from '@nestjs/common';
import { RedisService } from '@xyro/libs/redis';

@Injectable()
export class OneVsOneCacheService {
  constructor(private readonly redisService: RedisService) {}

  
}