export interface UserInactivityEventDto {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  lastActivity: string;
}

export class AnnounceUserInactivityCommand {
  constructor(readonly body: UserInactivityEventDto[]) {}
}
