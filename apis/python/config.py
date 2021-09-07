class DevelopmentConfig():
    DEBUG =True
    MYSQL_DATABASE_HOST = 'localhost'
    MYSQL_DATABASE_USER = 'root'
    MYSQL_DATABASE_PASSWORD = 'proyectosusac'
    MYSQL_DATABASE_DB = 'proyecto1'

config = {
    'development': DevelopmentConfig
}