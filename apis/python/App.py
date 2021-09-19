from flask import Flask,jsonify,request
from flask_cors import CORS
import pymssql
import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb




app = Flask(__name__)



#Conexion a la base de Azure
def obtener_conexion1():
    conexion1 = pymssql.connect(
        host ='sopes-1.database.windows.net',
        user = 'sopes-1',
        password = 'DqDDyZl8PmK9n6Zj',
        database = 'proyecto-1',
        port = 1433
    )
    return conexion1



def obtener_conexion2():
    conexion2 =  pymysql.connect(
        host= '35.193.66.235',
        port = 3306,
        user = 'root', 
        passwd='DqDDyZl8PmK9n6Zj',
        db ='proyecto1'
    )
    return conexion2

#configuracion de cors, todos los origenes
CORS(app)

##configuracion del google pub sub


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
    PublicacionGoogle(datos_salida)
    #Esto debe de mandar la notificacion a pub sub google
    return jsonify({"mensaje": "ok"})


@app.route('/publicacion', methods=['POST'])
def publicacion():
    datos = Convert(request.json)
    salida_publicacion = ingresar_publicacion(datos)
    salida_hashtags = ingresar_hashtags(datos["hashtags"])
    if salida_hashtags !=None and salida_publicacion!= None:
        publicacion_hashtag(salida_publicacion, salida_hashtags)
    else:
        return jsonify({"mensaje": "Error"})

    salida_publicacion = ingresar_publicacion_google(datos)
    salida_hashtags = ingresar_hashtags_google(datos["hashtags"])
    if salida_publicacion !=None and salida_hashtags!=None:
        publicacion_hashtag_google(salida_publicacion,salida_hashtags)
        return jsonify({"mensaje": "Ok"})
    else:
        return jsonify({"mensaje": "Error"})


def ingresar_publicacion(publicacion):
    conexion1 = obtener_conexion1()
    cursor = conexion1.cursor()
    id_publicacion = -1
    try:
        slq = """INSERT INTO Publicaciones(nombre,comentario,fecha, upvotes,downvotes)
        VALUES('{0}','{1}', CONVERT(DATETIME,'{2}',103), {3}, {4})""".format(publicacion["nombre"], publicacion["comentario"], publicacion["fecha"],
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



def ingresar_publicacion_google(publicacion):
    conexion1 = obtener_conexion2()
    cursor = conexion1.cursor()
    id_publicacion = -1
    try:
        slq = """INSERT INTO Publicaciones(nombre,comentario,fecha, upvotes,downvotes)
        VALUES('{0}','{1}', str_to_date('{2}','%d/%m/%Y'), {3}, {4})""".format(publicacion["nombre"], publicacion["comentario"], publicacion["fecha"],
        publicacion["upvotes"], publicacion["downvotes"])
        cursor.execute(slq)
        conexion1.commit()
        #obtener el id reciente
        sql = "SELECT LAST_INSERT_ID() from Publicaciones"
        cursor.execute(sql)
        datos = cursor.fetchone()
        conexion1.close()
        return datos[0]
    except Exception as e:
        print(e)
        return None
    conexion1.close()
        

def ingresar_hashtags_google(hastags):
    hashtags_id = []
    conexion1 = obtener_conexion2()
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



def publicacion_hashtag_google(id_publicacion, hashtags_id):
    conexion1 = obtener_conexion2()
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

#credencial google
import os
import json
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="clave.json"

#libreria de pub-sub
from google.cloud import pubsub_v1
project_id = "sopes1-proyecto1-325117"
topic_id = "mensajes"
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_id)

def PublicacionGoogle(datos_salida):
    data = json.dumps(datos_salida).encode("utf-8")
    # Add two attributes, origin and username, to the message
    future = publisher.publish(
        topic_path, data, origin="python-sample", username="gcp"
    )
    print(future.result())

print(f"Published messages with custom attributes to {topic_path}.")



if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=3001)
