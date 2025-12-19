import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: ('ADMIN' | 'MEMBER')[]) => SetMetadata('roles', roles);
