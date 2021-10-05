import {Model, Column, Table, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany, DataType} from "sequelize-typescript";
import { PublicacionHashtagGC } from "./PublicacionHashtagGC";

interface Attributes {
    id?: number;
    nombre?: string;
    comentario?: string;
    fecha?: Date;
    upvotes?: number;
    downvotes?: number;
    
    // Relaciones
    PublicacionHashtags?: PublicacionHashtagGC[];
}
@Table({
    tableName: 'Publicaciones',
    timestamps: true,
})
export class PublicacionGC extends Model<PublicacionGC, Attributes> {

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
    @HasMany(() => PublicacionHashtagGC)
    PublicacionHashtags?: PublicacionHashtagGC[];

}
