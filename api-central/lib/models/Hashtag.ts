import {Model, Column, Table, HasMany, CreatedAt, UpdatedAt, DataType} from "sequelize-typescript";
import { PublicacionHashtag } from "./PublicacionHashtag";

interface Attributes {
    id?: number;
    nombre?: string;
    comentario?: string;
    fecha?: Date;
    upvotes?: number;
    downvotes?: number;
    
    // Relaciones
    PublicacionesHashtag?: PublicacionHashtag[];
}

@Table({
    tableName: 'Hashtags',
    timestamps: true,
})
export class Hashtag extends Model<Hashtag, Attributes> {

    @Column({ type: DataType.TEXT })
    comentario?: string;

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;

    // Relaciones
    @HasMany(() => PublicacionHashtag)
    PublicacionesHashtag?: PublicacionHashtag[];

}
