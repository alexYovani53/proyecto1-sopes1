# proyecto1-sopes1


Para hacer el DEPLOY de la aplicacion se utilizan los siguientes comandos


gcloud builds submit --tag gcr.io/proyectopruebaredes/cra-cloud-run


gcloud run deploy --image gcr.io/proyectopruebaredes/cra-cloud-run --platform managed


en cada caso [proyectopruebaredes] es el nombre del proyecto en el que se esta trabajando en google cloud console. 