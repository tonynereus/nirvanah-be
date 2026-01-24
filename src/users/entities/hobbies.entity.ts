import { AbstractEntity } from "src/database/abstract.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class hobbies extends AbstractEntity<hobbies>{
    constructor(data:Partial<hobbies>){
        super(data)
        Object.assign(this,data)
    }
    
    @Column()
    hobby:string

    @ManyToOne(()=>User,(user)=>user.hobbies)
    user:User
}