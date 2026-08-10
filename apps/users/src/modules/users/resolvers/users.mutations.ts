import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload-ts';
import { FileUploadValidationPipe, IUserCredentials, MimeType, UploadedFile, UserCredentials, Void } from '@xyro/libs/graphql';

import { UserGraphQLEntity } from './types/userGraphQLEntity.type';
import { UsersService } from '../services/users.service';
import { DeleteAccountInput, UpdateUserInput } from './types/inputs.types';

const MAX_AVATAR_FILE_SIZE = 1e6;
const ALLOWED_AVATAR_FILE_MIME_TYPES = [
  MimeType.jpeg,
  MimeType.jpg,
  MimeType.png,
  MimeType.svg,
];

@Resolver()
export class UsersMutationsResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => Void)
  async createUserUpdatedEvents(
    @UserCredentials() credentials: IUserCredentials,
  ) {
    const { userId } = credentials;

    await this.usersService.createUserUpdatedEvents(userId);

    return new Void();
  }

  @Mutation(() => UserGraphQLEntity)
  async updateAvatar(
    @UserCredentials() credentials: IUserCredentials,
    @Args(
      { name: 'file', type: () => GraphQLUpload },
      new FileUploadValidationPipe({
        maxFileSize: MAX_AVATAR_FILE_SIZE,
        allowedMimeTypes: ALLOWED_AVATAR_FILE_MIME_TYPES,
      }),
    )
    avatar: UploadedFile,
  ) {
    const { userId } = credentials;

    const user = await this.usersService.updateUserAvatar(userId, avatar);

    return new UserGraphQLEntity(user);
  }

  @Mutation(() => UserGraphQLEntity)
  async updateUser(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data')
    payload: UpdateUserInput,
  ) {
    const { userId } = credentials;

    const user = await this.usersService.updateUser(userId, payload);

    return new UserGraphQLEntity(user);
  }

  @Mutation(() => UserGraphQLEntity)
  async deleteAvatar(@UserCredentials() credentials: IUserCredentials) {
    const { userId } = credentials;

    const user = await this.usersService.deleteUserAvatar(userId);

    return new UserGraphQLEntity(user);
  }

  @Mutation(() => UserGraphQLEntity, { nullable: true })
  async deleteAccount(
    @Args('data') input: DeleteAccountInput,
    @UserCredentials() credentials: IUserCredentials,
    ) {
    const { userId } = credentials;

    await this.usersService.deleteUser(userId, input.reason);

    return null;
  }
}
