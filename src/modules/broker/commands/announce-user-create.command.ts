export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface IUserCreateDto {
  id: number;
  userId: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  gender: string;
  profilePicture: string;
  createdAt: Date;
}

export class AnnounceUserCreateCommand {
  constructor(public body: IUserCreateDto) {}
}
