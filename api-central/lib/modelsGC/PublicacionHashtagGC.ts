import {Model, Column, Table, CreatedAt, UpdatedAt, ForeignKey, BelongsTo} from "sequelize-typescript";
import { HashtagGC } from "./HashtagGC";
import { PublicacionGC } from "./PublicacionGC";

interface Attributes {
    id?: number;

    // Relaciones
    PublicacionId?: number;
    PublicacionGC?: PublicacionGC;
    HashtagId?: number;
    HashtagGC?: HashtagGC;
}

@Table({
    tableName: 'PublicacionesHashtags',
    timestamps: true,
})
export class PublicacionHashtagGC extends Model<PublicacionHashtagGC, Attributes> {

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;


    // Relaciones
    @ForeignKey(() => PublicacionGC)
    @Column
    PublicacionId?: number;

    @BelongsTo(() => PublicacionGC)
    PublicacionGC?: PublicacionGC;

    @ForeignKey(() => HashtagGC)
    @Column
    HashtagId?: number;

    @BelongsTo(() => HashtagGC)
    HashtagGC?: HashtagGC;

}
