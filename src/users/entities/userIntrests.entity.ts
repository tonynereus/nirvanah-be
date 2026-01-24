import { AbstractEntity } from "src/database/abstract.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class lookingFor extends AbstractEntity<lookingFor>{
    constructor(data:Partial<lookingFor>){
        super(data)
        Object.assign(this,data)
    }

    @Column()
    intrest:string
}