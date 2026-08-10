import { InputType } from '@nestjs/graphql';
import { GamesFilterPaginatedInput } from '@xyro/core';

@InputType()
export class UpDownGamesFilterPaginatedInput extends GamesFilterPaginatedInput {}
