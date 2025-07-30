import { AbstractEntity } from 'src/common/abstract-entity';
import { UserType } from 'src/decorators/user.decorator';
import { Platform } from 'src/modules/broker/enums';
import { Column, Entity, Index } from 'typeorm';
import { Status } from '../enums';

@Entity('user_tokens')
//#region "Skip index for table user_tokens"
@Index('idx_user_tokens_user_id', { synchronize: false })
//#endregion
export class UserToken extends AbstractEntity {
  @Column({
    type: 'jsonb',
    nullable: false,
    default: {},
  })
  user: UserType;

  @Column({
    type: 'varchar',
    nullable: true,
    default: '',
  })
  [Platform.WEB]: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: '',
  })
  [Platform.ANDROID]: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: '',
  })
  [Platform.IOS]: string;

  @Column({
    type: 'enum',
    nullable: false,
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;
}
