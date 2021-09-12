

# Importamos la utileria de JSON para leer nuestro archivo
import threading
import json
import sys
import requests
# Importamos la utileria random para obtener numeros random en un rango
from random import random, randrange
from sys import argv, exec_prefix, getsizeof

from requests import exceptions
from requests.api import request

# Esta variable controlara si queremos que salgan todas las salidas, o unicamente las mas importantes
debug = True
cantidad = 1
Numhilos = 1
direccion = ""

# varibales para control
exitosos = 0
errores= 0


# Esta funcion utilizaremos para las salidas que no queremos que salgan siempre
# excepto cuando estamos debuggeando
def printDebug(msg):
    # Si la variable debug es True, queremos imprimir el mensaje
    if debug:
        print(msg)

# Esta clase nos ayudara a manejar todas las acciones de lectura de los datos del archivo
class Reader():
    
    # Constructor de la clase
    def __init__(self):
        # En esta variable almacenaremos nuestros datos
        self.array = []
        
    # Obtener un valor random del array
    # NOTA: ESTO QUITA EL VALOR DEL ARRAY.
    def pickRandom(self):
        # Obtenemos el numero de elementos del array
        length = len(self.array)
        
        # Si aun hay valores en el array
        if (length > 0):
            # Obtenemos un valor random desde 0 al largo del array - 1
            # Si el largo de nuestro arreglo es uno, entonces debemos de agarrar el ultimo indice posible, o sea 0.
            # De lo contrario, utilizaremos un valor al azar
            # Esta comparacion se hace debudo al error empty range for randrange() (0, 0, 0),
            # Al llegar a 1 en el largo, el rango de random se convierte en 0, 0; y hace fallar al programa
            random_index = randrange(0, length - 1) if length > 1 else 0

            # Devolvemos el valor que se encuentra en nuestro indice random
            # Quitamos el valor del array
            return self.array.pop(random_index)

        # Si ya no hay mas datos que leer del archivo
        else:
            self.load()            
            random_index = randrange(0, length - 1) if length > 1 else 0

            # Devolvemos el valor que se encuentra en nuestro indice random
            # Quitamos el valor del array
            return self.array.pop(random_index)
    
    # Cargar el archivo de datos json
    def load(self):
        # Mostramos en consola que estamos a punto de cargar los datos
        print (">> Reader: Iniciando con la carga de datos")
        # Ya que leeremos un archivo, es mejor realizar este proceso con un Try Except
        try:
            # Asignamos el valor del archivo traffic.json a la variable data_file
            with open("traffic.json", 'r') as data_file:
                # Con el valor que leemos de data_file vamos a cargar el array con los datos
                self.array = json.loads(data_file.read())
            # Mostramos en consola que hemos finalizado
            
            print (f'>> Reader: Datos cargados correctamente, {len(self.array)} datos -> {getsizeof(self.array)} bytes.')
        except Exception as e:
            # Imprimimos que no pudimos procesar la carga de datos
            print (f'>> Reader: No se cargaron los datos {e}')


def leer_ip():
    global direccion
    global cantidad
    global Numhilos
    
    print("Ingrese la ruta a la que enviará el tráfico: ", end="")

    while True:
        try:
            direccion = input()
            if(direccion == ""):
                direccion = " "
            if not "http" in direccion:
                direccion = "http://" + direccion 
            break
        except Exception:
            print("")
            print(" Error: No se ingreso una IP válida")
            break

    print("Comprobando direccion [" + direccion+ "]")
    try:
        x = []
        x = requests.get(direccion)
        print ("PETICION CORRECTA")
        print (x)
    except requests.exceptions.Timeout:
        print ("Error, la peticion se tardo demasiado")
    except requests.exceptions.RequestException as e:
        print("Error, hubo un error con la peticion")
        if hasattr(e,'message'):
            print(e.message)
        else:
            print(e)
    
    except requests.exceptions.InvalidURL as e:
        print ("Error, la direccion proporcionada no es valida")
    
    except Exception as e:
        print("Error, petición no completada")
        if hasattr(e,'message'):
            print(e.message)
        else:
            print(e)

    print("Ingrese la cantidad de datos a enviar: ", end="")
    cantidad = input()
    print("Ingrese el numero de hilos a usar: ",end="")
    Numhilos = input()


def enviarDato(dato,direccion):
    global exitosos
    global errores
    try:
        x = requests.post(direccion, data= dato , headers={ 'Content-Type': 'application/json'})
        code = x.status_code
        recieved_data = x.json()        
        if (code == 200 or code == 201):
            print(threading.current_thread().getName() + "  Envio a la direccion " + direccion + " -> " + dato)
            exitosos += 1 
        else:
            print("Error")
            errores += 1

            
    except Exception as e:
        print("Error")
        if hasattr(e, 'message'):
            print(e.message)
            print()
        else:
            print(e)
            errores +=1

def inicioHilo(datosHilo):
    reader = Reader()
    reader.load()

    # Enviar los datos que acabamos de obtener
    for i in range(int(datosHilo)):
        
        random_data = reader.pickRandom()

            # Si nuestro lector de datos nos devuelve None, es momento de parar
        if (random_data is not None):
            # utilizamos la funcion json.dumps para convertir un objeto JSON de python
            # a uno que podemos enviar por la web (básicamente lo convertimos a String)
            data_to_send = json.dumps(random_data)
            # Imprimimos los datos que enviaremos

            enviarDato(data_to_send,direccion)

        # En este segmento paramos la ejecución del proceso de creación de tráfico
        else:
            print(">> MessageTraffic: Envio de tráfico finalizado, no hay más datos que enviar.")
            # Parar ejecucion del usuario



def main():
    
    leer_ip()
  
    reader = Reader()
    reader.load()

    # Enviar los datos que acabamos de obtener
    for i in range(int(cantidad)):
        
        random_data = reader.pickRandom()

            # Si nuestro lector de datos nos devuelve None, es momento de parar
        if (random_data is not None):
            # utilizamos la funcion json.dumps para convertir un objeto JSON de python
            # a uno que podemos enviar por la web (básicamente lo convertimos a String)
            data_to_send = json.dumps(random_data)
            # Imprimimos los datos que enviaremos

            enviarDato(data_to_send,direccion)

        # En este segmento paramos la ejecución del proceso de creación de tráfico
        else:
            print(">> MessageTraffic: Envio de tráfico finalizado, no hay más datos que enviar.")
            # Parar ejecucion del usuario


def main2():
    leer_ip()  
    datosHilo =  int(cantidad) / int(Numhilos)
    
    if(datosHilo < 1):
         datosHilo = 1 

    hilos =  list()

    for i in range(int(Numhilos)):
        hilo = threading.Thread(name= "Thread "+ str(i), target=inicioHilo,args=(datosHilo,))
        hilos.append(hilo)
        hilo.start()
    
    for x in hilos:
        x.join()
    
    print(exitosos)

if __name__ == '__main__':
    main2()
   