def Convert(entrada):
    new_publicacion = {
        "nombre": entrada["nombre"],
        "comentario": entrada["comentario"],
        "fecha": entrada["fecha"],
        "hashtags": entrada["hashtags"],
        "upvotes": entrada["upvotes"],
        "downvotes": entrada["downvotes"]
    }
    return new_publicacion