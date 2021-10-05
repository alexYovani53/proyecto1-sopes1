import {Model, Column, Table, HasMany, CreatedAt, UpdatedAt, DataType} from "sequelize-typescript";
import { PublicacionHashtagGC } from "./PublicacionHashtagGC";

interface Attributes {
    id?: number;
    nombre?: string;
    comentario?: string;
    fecha?: Date;
    upvotes?: number;
    downvotes?: number;
    
    // Relaciones
    PublicacionesHashtag?: PublicacionHashtagGC[];
}

@Table({
    tableName: 'Hashtags',
    timestamps: true,
})
export class HashtagGC extends Model<HashtagGC, Attributes> {

    @Column({ type: DataType.TEXT })
    comentario?: string;

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;

    // Relaciones
    @HasMany(() => PublicacionHashtagGC)
    PublicacionesHashtag?: PublicacionHashtagGC[];

}
