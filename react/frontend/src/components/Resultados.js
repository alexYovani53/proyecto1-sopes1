import React, { Component } from 'react';
import {Bar,Doughnut} from 'react-chartjs-2';
import '../css/Resultados.css'
import axios from 'axios';

const url = "https://sopes-proyecto-1.herokuapp.com/api/publicaciones";
const username = 'api-read';
const password = 'WjJRGHJCxFy6TkowHkCQ';

const topVacio = [
    {
        comentario:"",
        cantidad:0
    },
    {
        comentario:"",
        cantidad:0
    },
    {
        comentario:"",
        cantidad:0
    },
    {
        comentario:"",
        cantidad:0
    },
    {
        comentario:"",
        cantidad:0
    }
]

class Resultados extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            limit : 15,
            ofset : 0,
            totalElementos:0,
            card:[],
            pidiendoDatos:false,

            UpVotes:0,
            DownVotes:0,
            Totales:0,
            Top5:topVacio,
            tipoDB:'azure',
            actualizacion:0
        }


        this.cambiarBase = this.cambiarBase.bind(this);
        this.notificacionEntrante = this.notificacionEntrante.bind(this);
        
        this.establecerTamano = this.establecerTamano.bind(this);
        
    }
    


    componentDidMount = async()=>{
        this.ActualizarDatos();
        await this.establecerTamano();
        await this.pedirDatos(this.state.limit);
    }

    notificacionEntrante= async ()=>{

        let numActualizacion = this.state.actualizacion;
        if(numActualizacion < 10 ) numActualizacion ++;
        else numActualizacion = 0;

        this.setState({
            actualizacion: numActualizacion
        });

        console.log(this.state.actualizacion);

        this.ActualizarDatos();

        await this.establecerTamano()
        await this.pedirDatos(this.state.limit);
    }


    cambiarBase=async (base)=>{
        
        await this.setState({
            tipoDB:base,        
        });

        this.ActualizarDatos();
        await this.establecerTamano();
        await this.pedirDatos(this.state.limit);
        
        console.log("tarjetas",this.state.card);
    }


    establecerTamano=async () =>{

        await axios.post("https://sopes-proyecto-1.herokuapp.com/api/publicaciones/cantidad",
            {tipoDB:this.state.tipoDB},
            {auth:{username:username,password:password}}
        ).then(e=>{

            let newOffset = e.data.result - 15;
            if(newOffset<0)newOffset = 0;

            this.setState({
                totalElementos:e.data.result,
                ofset:newOffset,
                card:[]
            });

        }).catch(e=>{
            console.log(e)
        });
    }


    ActualizarDatos=()=>{

        axios.post(url + "/votos",
            {tipoDB:this.state.tipoDB},
            {auth:{username:username,password:password}}
        ).then(data=>{
            this.setState({
                UpVotes:data.data.result.upvotes,
                DownVotes:data.data.result.downvotes
            })
        }).catch(e=>{
            console.log(e)
        })

        axios.post(url+"/top",
        {tipoDB:this.state.tipoDB},
        {auth:{username:username,password:password}}
        ).then(resultado =>{

            try {
                this.setState({
                    Top5:resultado.data.result.top,
                    Totales:resultado.data.result.total
                });
    
            } catch (error) {
                console.log("no se actualizo top")                
            }
            
        }).catch(e=>console.log(e));


    }

    pedirDatos=async(limit)=>{
        
        await this.setState({
            pidiendoDatos:true
        });

        let totalPaginas = this.state.totalElementos;
        let siguiente = this.state.ofset 

        console.log("Elementos: -->" , totalPaginas);
        console.log("offset: -->" , siguiente);

        if(siguiente  >= totalPaginas){
            console.log("llego fin");
            return;
        }

        let nuevoOffset = 0;
        let tarjetasNuevas = [];

        await axios.post('https://sopes-proyecto-1.herokuapp.com/api/publicaciones/obtener',{
            limit:limit,
            offset:this.state.ofset,
            tipoDB:this.state.tipoDB
        },{ auth:{username:username,password:password}})
        .then(result=>{          
            nuevoOffset = this.state.ofset + result.data.result.length
            tarjetasNuevas = result.data.result;
        
        }).catch(e=>{
            console.log(e)
        })

        await this.setState({
            card:[...this.state.card,...tarjetasNuevas],
            ofset: nuevoOffset
        });
         
        console.log("nuevo offset-> ",this.state.ofset)

        
        await this.setState({
            pidiendoDatos:false
        });
    }


    // ultimo= async ()=>{
    //     let ultimo = this.state.totalElementos - 3;

    //     console.log("Total elementos",this.state.totalElementos);
        
    //     if(this.state.ofset < this.state.totalElementos){
    //         let limite =  this.state.totalElementos - this.state.ofset;
    //         await this.pedirDatos(limite)
    //     }
        
    //     console.log(this.state.card)
  
    // }


    render() {

        let filas = (<tr><td>---</td><td>---</td><td>---</td></tr>);
        if(this.state.card.length>0){
            console.log("card llenas ->->",this.state.card.length)
            
            filas = this.state.card.map(elemento=>{
                return (<tr><td>{elemento.nombre}</td><td>{new Date(elemento.fecha).toLocaleDateString()}</td><td>{elemento.comentario}</td></tr>)
            })
        }

        return (
            <div className="PESTANA RESULTADOS">

                <div className = "ConteosDatos">
                    <div className = "ItemConteo"> 
                        <div className="NumerosConteos">
                            <h2>UpVotes</h2>
                            <h4>{this.state.UpVotes}</h4>
                        </div>
                        <i className="fas fa-user"></i>
                    </div>
                    <div className = "ItemConteo"> 
                        <div className="NumerosConteos">
                            <h2>DownVotes</h2>
                            <h4>{this.state.DownVotes}</h4>
                        </div>
                        <i className="fas fa-user"></i>
                    </div>
                    <div className = "ItemConteo"> 
                        <div className="NumerosConteos">
                            <h2>Hashtags diferentes</h2>
                            <h4>{this.state.Totales}</h4>
                        </div>
                        <i className="fas fa-user"></i>
                    </div>
                </div>
                <div className="Barra">
                    <Bar
                        data={{
                            labels: ['Totales'],
                            datasets:[{
                                label:'UpVotes',
                                backgroundColor:'rgb(51,153,255)',
                                data:[this.state.UpVotes],
                                borderWidth:3
                            },{
                                label:'DownVotes',
                                backgroundColor:'rgb(0,153,102)',
                                data:[this.state.DownVotes],
                                borderWidth:3
                            }]
                        }}

                        options ={{
                            maintainAspectRatio:false,
                            indexAxis:'y',
                            responsive:true,
                            plugins:{
                                legend:{
                                    position:'bottom'
                                },
                                title:{
                                    display:true,
                                    text:'UpVote VS DownVote'
                                }
                            }
                        }}
                        
                    />
                </div>

                <div className="Circulo">
                    <Doughnut
                        data={{
                            labels: [
                                this.state.Top5[0].comentario,
                                this.state.Top5[1].comentario,
                                this.state.Top5[2].comentario,
                                this.state.Top5[3].comentario,
                                this.state.Top5[4].comentario
                            ],
                            datasets:[{
                                label:'Antes',
                                backgroundColor:[
                                    'rgb(88, 214, 141)',
                                    'rgb(244, 208, 63 )',
                                    'rgb(245, 176, 65)',
                                    'rgb(41, 128, 185)',
                                    'rgb(231, 76, 60)',
                                ],
                                data:[
                                    this.state.Top5[0].cantidad,
                                    this.state.Top5[1].cantidad,
                                    this.state.Top5[2].cantidad,
                                    this.state.Top5[3].cantidad,
                                    this.state.Top5[4].cantidad
                                ],
                                borderWidth:3
                            }]
                        }}

                        
                        options ={{
                            maintainAspectRatio:false,
                            responsive:true,
                            plugins:{
                                legend:{
                                    position:'top'
                                },
                                title:{
                                    display:true,
                                    text:'TOP 5 # -> HASHTAGS'
                                }
                            }
                        }}

                    />
                </div>

                <div className="Mensajes_tabla">
                    <table className ="ultimosRegistros">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Fecha</th>
                                <th>Comentario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filas
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default Resultados;
