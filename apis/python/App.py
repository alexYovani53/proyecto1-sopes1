from flask import Flask,jsonify,request
from helpers import Convert
from flaskext.mysql import MySQL
from flask_cors import CORS

app = Flask(__name__)

#configuracion credenciales de la primera base de datos
mysql = MySQL(app, prefix="mysql1", host="localhost", user="root",
              password="proyectosusac", db="proyecto1", autocommit=True)

mysql_1 = MySQL(app, prefix="mysql2", host="localhost", user="root",
              password="proyectosusac", db="respaldo", autocommit=True)



#configuracion de cors, todos los origines
CORS(app)

@app.route('/')
def index():
    return jsonify({"mensaje": "API PYTHON READY"})

@app.route('/iniciarCarga')
def iniciarCarga():
    return jsonify({"mensaje":"Iniciar carga"})

@app.route('/finalizarCarga', methods=['POST'])
def finalizarCarga():
    cantidad_ingresada = request.json['cantidad']
    #Esto debe de mandar la notificacion a pub sub google
    return jsonify({"mensaje": "Carga Terminada","cantidad": cantidad_ingresada})


@app.route('/publicacion', methods=['POST'])
def publicacion():
    datos = Convert(request.json)
    # se realizan las operaciones de insertar en la primera base de datos
    salida_hashtags = ingresar_hashtags(datos["hashtags"])
    salida_publicacion = ingresar_publicacion(datos)
    if salida_hashtags != None and salida_publicacion !=None:
        publicacion_hashtag(salida_publicacion, salida_hashtags)

        # se inician las operaciones para insertar en la base de datos 2
        salida_hashtags = ingresar_hashtags_base2(datos["hashtags"])
        salida_publicacion = ingresar_publicacion_base2(datos)
        if salida_hashtags != None and salida_publicacion !=None:
            publicacion_hashtag_base2(salida_publicacion, salida_hashtags)
            return jsonify ({"mensaje":"Publicado en la base de datos"})
    else:
        return jsonify({"mensaje": "Ocurrio un error"})


def ingresar_publicacion(publicacion):
    cursor = mysql.get_db().cursor()
    id_publicacion = -1
    try:
        slq = """INSERT INTO publicacion(nombre,comentario,fecha, upvotes,downvotes)
        VALUES('{0}','{1}', str_to_date('{2}','%d/%m/%Y'), {3}, {4})""".format(publicacion["nombre"], publicacion["comentario"], publicacion["fecha"],
        publicacion["upvotes"], publicacion["downvotes"])
        cursor.execute(slq)
        mysql.get_db().commit()
        #mando a obtener el id
        sql = "SELECT LAST_INSERT_ID() from publicacion"
        cursor.execute(sql)
        datos = cursor.fetchone()
        cursor.close()
        return datos[0]
    except Exception as e:
        print(e)
        return None
        

def ingresar_hashtags(hastags):
    hashtags_id = []
    cursor = mysql.get_db().cursor()
    try:
        for hashtag in hastags:
            sql = "SELECT id_hashtag from hashtag where descripcion = '{0}'".format(hashtag)
            cursor.execute(sql)
            datos = cursor.fetchone()
            if datos !=None:
                hashtags_id.append(datos[0])
            else:
                sql = """INSERT INTO hashtag(descripcion) VALUES('{0}')""".format(hashtag)
                cursor.execute(sql)
                mysql.get_db().commit()
 
                sql = "SELECT id_hashtag from hashtag where descripcion = '{0}'".format(hashtag)
                cursor.execute(sql)
                datos = cursor.fetchone()
                hashtags_id.append(datos[0])
    except Exception as e:
        print(e)
        return None
    #return los id de los hashtags
    cursor.close()
    return hashtags_id


def publicacion_hashtag(id_publicacion, hashtags_id):
    cursor = mysql.get_db().cursor()
    try:
        for id_hashtag in hashtags_id:
            sql = "INSERT INTO publicacionhashtag(id_publicacion,id_hashtag) VALUES({0},{1})".format(id_publicacion,id_hashtag)
            #print(sql)
            cursor.execute(sql)
            mysql.get_db().commit()
    except Exception as e:
        print(e)
        return None
    cursor.close()


"""  
    Aqui se agregan las mismas operaciones pero con la base de datos numero 2
"""
def ingresar_publicacion_base2(publicacion):
    cursor = mysql_1.get_db().cursor()
    id_publicacion = -1
    try:
        slq = """INSERT INTO publicacion(nombre,comentario,fecha, upvotes,downvotes)
        VALUES('{0}','{1}', str_to_date('{2}','%d/%m/%Y'), {3}, {4})""".format(publicacion["nombre"], publicacion["comentario"], publicacion["fecha"],
        publicacion["upvotes"], publicacion["downvotes"])
        cursor.execute(slq)
        mysql_1.get_db().commit()
        #mando a obtener el id
        sql = "SELECT LAST_INSERT_ID() from publicacion"
        cursor.execute(sql)
        datos = cursor.fetchone()
        cursor.close()
        return datos[0]
    except Exception as e:
        print(e)
        return None
        

def ingresar_hashtags_base2(hastags):
    hashtags_id = []
    cursor = mysql_1.get_db().cursor()
    try:
        for hashtag in hastags:
            sql = "SELECT id_hashtag from hashtag where descripcion = '{0}'".format(hashtag)
            cursor.execute(sql)
            datos = cursor.fetchone()
            if datos !=None:
                hashtags_id.append(datos[0])
            else:
                sql = """INSERT INTO hashtag(descripcion) VALUES('{0}')""".format(hashtag)
                cursor.execute(sql)
                mysql_1.get_db().commit()
 
                sql = "SELECT id_hashtag from hashtag where descripcion = '{0}'".format(hashtag)
                cursor.execute(sql)
                datos = cursor.fetchone()
                hashtags_id.append(datos[0])
    except Exception as e:
        print(e)
        return None
    #return los id de los hashtags
    cursor.close()
    return hashtags_id


def publicacion_hashtag_base2(id_publicacion, hashtags_id):
    cursor = mysql_1.get_db().cursor()
    try:
        for id_hashtag in hashtags_id:
            sql = "INSERT INTO publicacionhashtag(id_publicacion,id_hashtag) VALUES({0},{1})".format(id_publicacion,id_hashtag)
            #print(sql)
            cursor.execute(sql)
            mysql_1.get_db().commit()
    except Exception as e:
        print(e)
        return None
    cursor.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=3001)
