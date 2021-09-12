class DevelopmentConfig():
    MYSQL_DATABASE_HOST = 'localhost'
    MYSQL_DATABASE_USER = 'root'
    MYSQL_DATABASE_PASSWORD = 'proyectosusac'
    MYSQL_DATABASE_DB = 'proyecto1'

class Config1():
    MYSQL_DATABASE_HOST = 'localhost'
    MYSQL_DATABASE_USER = 'root'
    MYSQL_DATABASE_PASSWORD = 'proyectosusac'
    MYSQL_DATABASE_DB = 'respaldo'

config = {
    'development': DevelopmentConfig,
    "config1": Config1
}