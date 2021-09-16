import {Model, Column, Table, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany, DataType} from "sequelize-typescript";
import { PublicacionHashtag } from "./PublicacionHashtag";

interface Attributes {
    id?: number;
    nombre?: string;
    comentario?: string;
    fecha?: Date;
    upvotes?: number;
    downvotes?: number;
    
    // Relaciones
    PublicacionHashtags?: PublicacionHashtag[];
}
@Table({
    tableName: 'Publicaciones',
    timestamps: true,
})
export class Publicacion extends Model<Publicacion, Attributes> {

    @Column
    nombre?: string;

    @Column({ type: DataType.TEXT })
    comentario?: string;

    @Column
    fecha?: Date;

    @Column
    upvotes?: number;

    @Column
    downvotes?: number;

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;

    // Relaciones
    @HasMany(() => PublicacionHashtag)
    PublicacionHashtags?: PublicacionHashtag[];

}
