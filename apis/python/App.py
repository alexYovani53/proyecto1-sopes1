from flask import Flask,jsonify,request
from flask_cors import CORS
import pymssql

app = Flask(__name__)



#funciones para obtener establecer las conexiones
def obtener_conexion1():
    conexion1 = pymssql.connect(
        host ='sopes-1.database.windows.net',
        user = 'sopes-1',
        password = 'DqDDyZl8PmK9n6Zj',
        database = 'proyecto-1',
    )
    return conexion1

def obtener_conexion2():
    conexion2 = pymssql.connect(
        host ='sopes-1.database.windows.net',
        user = 'sopes-1',
        password = 'DqDDyZl8PmK9n6Zj',
        database = 'proyecto-1',
    )
    return conexion2


#configuracion de cors, todos los origenes
CORS(app)

@app.route('/')
def index():
    return jsonify({"mensaje": "API PYTHON READY"})

@app.route('/iniciarCarga')
def iniciarCarga():
    return jsonify({"mensaje":"Iniciar carga"})

@app.route('/finalizarCarga', methods=['POST'])
def finalizarCarga():
    datos_salida = {
        "Guardados": request.json['guardados'],
        "TiempoDeCarga": request.json['tiempoDeCarga'],
        "Api": "python",
        "Bd": "cosmosDB y CloudSQL"
    }
    #Esto debe de mandar la notificacion a pub sub google
    return jsonify(datos_salida)


@app.route('/publicacion', methods=['POST'])
def publicacion():
    datos = Convert(request.json)
    # se realizan las operaciones de insertar en la primera base de datos
    salida_publicacion = ingresar_publicacion(datos)
    salida_hashtags = ingresar_hashtags(datos["hashtags"])
    if salida_hashtags !=None and salida_publicacion!= None:
        publicacion_hashtag(salida_publicacion, salida_hashtags)
        return jsonify({"mensaje": "Ok"})
    else:
        return jsonify({"mensaje": "Error"})


def ingresar_publicacion(publicacion):
    conexion1 = obtener_conexion1()
    cursor = conexion1.cursor()
    id_publicacion = -1
    try:
        #revisar algo de las fechas
        slq = """INSERT INTO Publicaciones(nombre,comentario,fecha, upvotes,downvotes)
        VALUES('{0}','{1}', CONVERT(DATETIME,{2},103), {3}, {4})""".format(publicacion["nombre"], publicacion["comentario"], publicacion["fecha"],
        publicacion["upvotes"], publicacion["downvotes"])
        cursor.execute(slq)
        conexion1.commit()
        #obtener el id reciente
        sql = "SELECT @@IDENTITY"
        cursor.execute(sql)
        datos = cursor.fetchone()
        conexion1.close()
        return datos[0]
    except Exception as e:
        print(e)
        return None
    conexion1.close()
        

def ingresar_hashtags(hastags):
    hashtags_id = []
    conexion1 = obtener_conexion1()
    cursor = conexion1.cursor()
    try:
        for hashtag in hastags:
            sql = "SELECT id from Hashtags where comentario = '{0}'".format(hashtag)
            cursor.execute(sql)
            datos = cursor.fetchone()
            if datos !=None:
                hashtags_id.append(datos[0])
            else:
                sql = """INSERT INTO Hashtags(comentario) VALUES('{0}')""".format(hashtag)
                cursor.execute(sql)
                conexion1.commit()
                sql = "SELECT id from Hashtags where comentario = '{0}'".format(hashtag)
                cursor.execute(sql)
                datos = cursor.fetchone()
                hashtags_id.append(datos[0])
    except Exception as e:
        print(e)
        return None
    #return los id de los hashtags
    conexion1.close()
    return hashtags_id


#revisar algo de aca que no inserta
def publicacion_hashtag(id_publicacion, hashtags_id):
    conexion1 = obtener_conexion1()
    cursor = conexion1.cursor()
    try:
        for id_hashtag in hashtags_id:
            sql = "INSERT INTO PublicacionesHashtags(PublicacionId,HashtagId) VALUES({0},{1})".format(id_publicacion,id_hashtag)
            print(sql)
            cursor.execute(sql)
            conexion1.commit()
    except Exception as e:
        print(e)
        return None
    conexion1.close()

@app.route('/prueba',methods = ['GET'])
def prueba():
    conexion1 = obtener_conexion1()
    cursor1 = conexion1.cursor()
    cursor1.execute("SELECT * from PublicacionesHashtags")
    print(cursor1.fetchall())
    cursor1.execute("SELECT * from Publicaciones")
    print(cursor1.fetchall())
    cursor1.execute("SELECT * from Hashtags")
    print(cursor1.fetchall())
    cursor1.close()
    return jsonify({"mensaje":"pong!"})

#funcion de helpers
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=3001)
