import { IsEnum } from 'class-validator';

export enum Role {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
