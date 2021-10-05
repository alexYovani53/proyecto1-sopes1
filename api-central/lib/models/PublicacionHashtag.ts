import {Model, Column, Table, CreatedAt, UpdatedAt, ForeignKey, BelongsTo} from "sequelize-typescript";
import { Hashtag } from "./Hashtag";
import { Publicacion } from "./Publicacion";

interface Attributes {
    id?: number;

    // Relaciones
    PublicacionId?: number;
    Publicacion?: Publicacion;
    HashtagId?: number;
    Hashtag?: Hashtag;
}

@Table({
    tableName: 'PublicacionesHashtags',
    timestamps: true,
})
export class PublicacionHashtag extends Model<PublicacionHashtag, Attributes> {

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;


    // Relaciones
    @ForeignKey(() => Publicacion)
    @Column
    PublicacionId?: number;

    @BelongsTo(() => Publicacion)
    Publicacion?: Publicacion;

    @ForeignKey(() => Hashtag)
    @Column
    HashtagId?: number;

    @BelongsTo(() => Hashtag)
    Hashtag?: Hashtag;

}
