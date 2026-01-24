import { AbstractEntity } from "src/database/abstract.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export class chats extends AbstractEntity<chats> {
    constructor(data: Partial<chats>) {
        super(data)
        Object.assign(this, data)
    }

    @Column()
    senderId: number;

    @Column()
    receiverId: number;

    @Column()
    message: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    sentAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: "receiverId" })
    receiver: User;


    @ManyToOne(() => User)
    @JoinColumn({ name: "senderId" })
    sender: User;

}



