import { AbstractEntity } from "src/database/abstract.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { hobbies } from "./hobbies.entity";
import { lookingFor } from "./userIntrests.entity";

@Entity()
export class User extends AbstractEntity<User> {
    constructor(data: Partial<User>) {
        super(data);
        Object.assign(this, data);
    }

    @Column({ unique: true })
    email: string;

    @Column()
    username: string;

    @Column({ default: null })
    fullName: string;

    @Column()
    password: string;

    @Column({ default: null })
    dateOfBirth: Date;

    @Column({ default: null })
    location: string;

    @Column({ default: null })
    phone: string;

    @Column({ default: null })
    bio: string;

    @OneToMany(() => hobbies, (hobbies) => hobbies.user, { cascade: true })
    hobbies: hobbies[];

    @ManyToMany(() => lookingFor, { cascade: true })
    @JoinTable()
    lookingFor: lookingFor[];

    // ✅ New fields below

    @Column({ type: 'varchar', length: 6, nullable: true })
    otp: string;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    otp_exp_time: Date;

    @Column({ default: null })
    profile_photo: string; // store filename or full URL
}


