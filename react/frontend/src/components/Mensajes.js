import React, { Component } from 'react';
import axios from 'axios';
import Card from './Card';

const username = 'api-read';
const password = 'WjJRGHJCxFy6TkowHkCQ';

class Mensajes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            limit : 5,
            ofset : 0,
            paginaActual : 1,
            activoPrevio:true,
            activoSiguiente:false,
            totalElementos:0,
            card:[],
            tipoDB:"azure",
            pidiendoDatos:false,
            actualizacion:0
        }
        this.Tarjetas = React.createRef();
        this.scroll = this.scroll.bind(this)
        this.cambiarBase = this.cambiarBase.bind(this);
        this.establecerTamano = this.establecerTamano.bind(this);
        this.establecerTamano_sin_cambio_DB= this.establecerTamano_sin_cambio_DB.bind(this)
        this.notificacionEntrante =  this.notificacionEntrante.bind(this);
        this.siguiente = this.siguiente.bind(this);
        this.anterior = this.anterior.bind(this);
        this.primero = this.primero.bind(this);
        this.ultimo = this.ultimo.bind(this);

        
    }

    componentDidMount =  async()=>{
        await this.establecerTamano();
        await this.pedirDatos(this.state.limit);
    }

    notificacionEntrante = async ()=>{
        let numActualizacion = this.state.actualizacion;
        if(numActualizacion < 10 ) numActualizacion ++;
        else numActualizacion = 0;

        this.setState({
            actualizacion: numActualizacion
        });

        console.log(this.state.actualizacion);

        await this.establecerTamano_sin_cambio_DB();
        await this.ultimo();
    }


    cambiarBase=async (base)=>{
        
        await this.setState({
            tipoDB:base,        
        });
        await this.establecerTamano();
        await this.pedirDatos(this.state.limit);
    }

    establecerTamano=async () =>{

        await axios.post("https://sopes-proyecto-1.herokuapp.com/api/publicaciones/cantidad",
            {tipoDB:this.state.tipoDB},
            {auth:{username:username,password:password}}
        ).then(e=>{
            this.setState({
                totalElementos:e.data.result,
                ofset:0,
                card:[]
            });

        }).catch(e=>{
            console.log(e)
        });

    }

    establecerTamano_sin_cambio_DB=async () =>{

        await axios.post("https://sopes-proyecto-1.herokuapp.com/api/publicaciones/cantidad",
            {tipoDB:this.state.tipoDB},
            {auth:{username:username,password:password}}
        ).then(e=>{
            this.setState({
                totalElementos:e.data.result
            });

        }).catch(e=>{
            console.log(e)
        });

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


    
    scroll=async (e)=>{
        //console.log(this.Tarjetas.current.lastChild.getBoundingClientRect())
        // let aaa = this.Tarjetas.current.getBoundingClientRect();
        // console.log("fffffffffffffffff",aaa)

        if(this.state.pidiendoDatos) return;
 
        if(this.Tarjetas.current.lastChild.getBoundingClientRect().top<650){
            await this.pedirDatos(this.state.limit);
        }

        let posicion = this.Tarjetas.current.scrollTop;
        let actual = Math.round(posicion /150);
        let activarAtras = actual > 3 ? false:true;
        let activoSiguiente = this.state.totalElementos > 3 & actual < this.state.totalElementos? false:true;
        this.setState({
            paginaActual:actual,
            activoPrevio:activarAtras,
            activoSiguiente: activoSiguiente
        })
    }

    primero=()=>{
        this.setState({
            activoPrevio:true,
            activoSiguiente:false,
            paginaActual:0
        });
        this.Tarjetas.current.scrollTop = 0;
    }

    ultimo= async ()=>{
        let ultimo = this.state.totalElementos - 3;

        console.log("Total elementos",this.state.totalElementos);
        
        if(this.state.ofset < this.state.totalElementos){
            let limite =  this.state.totalElementos - this.state.ofset;
            await this.pedirDatos(limite)
        }

        if(ultimo <=3) return;

        this.Tarjetas.current.scrollTop = ultimo * 200;

        this.setState({
            activoPrevio:false,
            activoSiguiente:true,
            paginaActual:0
        });
    }


    anterior=()=>{
        

        let actual = this.state.paginaActual;
        let nuevo = actual - 3;

        if(nuevo <= -1 ) nuevo  = 0;

        this.Tarjetas.current.scrollTop = nuevo * 150;

        let activoAtras = nuevo ===0? true:false;
        let activoAdelante = this.state.totalElementos > 3? false:true;
        this.setState({
            paginaActual: nuevo,
            activoPrevio:activoAtras,
            activoSiguiente:activoAdelante
        })

    }

    
    siguiente = async ()=>{

        if(this.state.totalElementos <= 3) return;

        let actual = this.state.paginaActual;
        let siguiente = actual + 3;

        if(siguiente > this.state.ofset + 1 && this.state.ofset + 1 < this.state.totalElementos){
            await this.pedirDatos(this.state.limit);
        }

        if(siguiente >= this.state.totalElementos - 3){
            siguiente = this.state.totalElementos - 3;
            this.setState({
                activoSiguiente:true
            })
        }

        this.setState({
            paginaActual:siguiente,
            activoPrevio:false
        })
        this.Tarjetas.current.scrollTop = siguiente * 150;



    }

    render() {
        
        let data ;
        if(this.state.card.length ==0) data = (<div ></div>);
        else data = this.state.card.map(
            (tarjeta,index)=>{
                if(index == this.state.card.length-1){
                    return (<Card id={index +1} card = {tarjeta} clase = "ultimo"/>)
                }
                else return (<Card id={index+1} card = {tarjeta} clase = "no" />)
            }            
        );

        
        return (
                <div className="PESTANA" >                      
                    <div class="text_content" onScroll={this.scroll} ref={this.Tarjetas} >     
                            {
                                data
                            }                 
                    </div>   
               
                    {/* <div className="pagination" >
                        <a href={"#"+this.state.paginaActual} onClick={this.anterior} className="itemPagination" disabled={this.state.activoPrevio}> Anterior</a> 
                        <span className="itemPagination">Navegación </span>
                        <a href={"#"+this.state.paginaActual } onClick={this.siguiente} className="itemPagination"  disabled={this.state.activoSiguiente}>Siguiente</a>
                    </div> */}


                    <div className="pagination" >
                        <button onClick={this.primero} className="itemPagination" disabled={this.state.activoPrevio}> Primero</button> 
                        <button onClick={this.anterior} className="itemPagination" disabled={this.state.activoPrevio}> Anterior</button> 
                        <span className="itemMensaje">Navegación </span>
                        <button onClick={this.siguiente} className="itemPagination" disabled={this.state.activoSiguiente}> Siguiente</button> 
                        <button onClick={this.ultimo} className="itemPagination"  disabled={this.state.activoSiguiente}>Ultimo</button>
                    </div>

                </div>
        );;
    }
}

export default Mensajes;



/*

    previo=()=>{
        if(this.state.ofset - this.state.limit <= 0){
            this.setState({
                activoPrevio:true
            })
        }
        
        let nuevo = this.state.ofset - this.state.limit;
        this.setState({
            ofset: nuevo
        });
        this.setState({
            activoSiguiente:false
        })

        
        this.pedirDatos();
    }

    siguiente=()=>{
        let totalPaginas = Math.ceil(this.state.totalElementos/this.state.limit);
        let siguiente = Math.ceil((this.state.ofset + this.state.limit)/ this.state.limit);

        // console.log("thotalPaginas ",totalPaginas);
        // console.log("siguiente ", siguiente)

        if(siguiente >= totalPaginas){
            this.setState({
                activoSiguiente:true
            })
        }

        let nuevo = this.state.ofset + this.state.limit;
        this.setState({
            ofset: nuevo
        });

        this.setState({
            activoPrevio:false
        })

        
        this.pedirDatos();
    }
    
*/