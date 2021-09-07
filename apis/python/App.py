from flask import Flask,jsonify,request
from config import config
from helpers import Convert
from flaskext.mysql import MySQL

app = Flask(__name__)
mysql = MySQL()
mysql.init_app(app)

@app.route('/')
def index():
    return jsonify({"mensaje": "API PYTHON READY"})

@app.route('/iniciarCarga')
def iniciarCarga():
    return jsonify({"mensaje":"Iniciar carga"})

@app.route('/publicacion', methods=['POST'])
def publicacion():
    datos = Convert(request.json)
    print(datos["hashtags"])
    ingresar_hashtags(datos["hashtags"])
    ingresar_publicacion(datos)
    return jsonify ({"mensaje":"Publicar en base"})

@app.route('/finalizarCarga')
def finalizarCarga():
    return jsonify({"mensaje": "Carga Terminada"})

def ingresar_publicacion(publicacion):
    cursor = mysql.get_db().cursor()
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
        print(datos[0])
        return datos[0]
    except Exception as e:
        return jsonify({"mensaje": "Error insertar publicacion"})
    cursor.close()
        

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
                #cursor = mysql.get_db().cursor()
                sql = """INSERT INTO hashtag(descripcion) VALUES('{0}')""".format(hashtag)
                cursor.execute(sql)
                mysql.get_db().commit()
                #mando a obtener el id
                #cursor = mysql.get_db().cursor()
                sql = "SELECT id_hashtag from hashtag where descripcion = '{0}'".format(hashtag)
                cursor.execute(sql)
                datos = cursor.fetchone()
                hashtags_id.append(datos[0])
    except Exception as e:
        return jsonify({"mensaje": "error"})
    #return los id de los hashtags
    cursor.close()
    print(hashtags_id)
    return hashtags_id


def publicacion_hashtag(id_publicacion, hashtag_id):
    print('ingresar en la tabla publicacion hashtag')

if __name__ == '__main__':
    app.config.from_object(config["development"])
    app.run(port=3001)
