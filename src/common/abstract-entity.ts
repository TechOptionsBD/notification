import moment from 'moment-timezone'; // Changed to default import
import {
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // generate Asia/Dhaka current date and time
  get currentDateTime(): Date {
    return moment().tz('Asia/Dhaka').toDate();
  }

  @BeforeInsert()
  beforeInsert() {
    const now = this.currentDateTime;
    if (!this.createdAt) this.createdAt = now;
    if (!this.updatedAt) this.updatedAt = now;
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = this.currentDateTime;
  }
}
