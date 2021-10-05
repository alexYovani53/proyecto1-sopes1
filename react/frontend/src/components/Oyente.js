import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';

const URL_BACKEND = "https://sopes-proyecto-1.herokuapp.com";
class Oyente extends Component {


    constructor(props) {
        super(props);        
        this.socket = socketIOClient(URL_BACKEND);

    }
    
    componentDidMount(){

        console.log("hola")
        this.socket.emit('prueba');
        this.socket.on('prueba',respuesta=>{
            console.log("respuesta",respuesta)
        });

        this.socket.on('status-conexion',data=>{
        });

        this.socket.on('notificacion',data=>{
            console.log("Estamos en notificaciones Uraaa si llego",data);
            this.props.oyente();
        });
                
    }

    render() {
        return (
            <div>              

            </div>
        );
    }
}

export default Oyente;
