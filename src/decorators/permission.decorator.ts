import { SetMetadata } from '@nestjs/common';
export const PERMISSION_KEY = 'roles';

export const Permissions = (module: string, roles: string[]) =>
  SetMetadata(PERMISSION_KEY, { module, roles });
