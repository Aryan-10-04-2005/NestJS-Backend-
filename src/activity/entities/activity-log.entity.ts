import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ActivityLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    issueId: number;

    @Column()
    action: string;

    @Column({ nullable: true })
    oldValue: string;

    @Column({ nullable: true })
    newValue: string;

    @Column()
    userId: string;

    @Column()
    organizationId: string;

    @CreateDateColumn()
    createdAt: Date;
}
