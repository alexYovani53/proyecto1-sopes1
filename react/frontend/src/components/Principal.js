import React, { Component } from 'react';
import Nav from './Nav';
import '../css/Principal.css'
import '../css/Card.css'
import Mensajes from './Mensajes';
import Resultados from './Resultados';
import Oyente from './Oyente';


class Principal extends Component {
    
    constructor(props) {
        super(props);
        this.state ={
            base:"azure",
            cantidadDatos:35,
            pestanaActiva:1
        }

        this.mensajes = React.createRef();
        this.resultado = React.createRef();
        this.nav = React.createRef();
        this.controladorRadio = this.controladorRadio.bind(this);
        this.cambiarPestana = this.cambiarPestana.bind(this);
        this.puedeActualizar = this.puedeActualizar.bind(this);

    }


    puedeActualizar= ()=>{
        console.log("puede actualizar")
        if(this.state.pestanaActiva == 1) this.mensajes.current.notificacionEntrante()
        else this.resultado.current.notificacionEntrante();

        this.nav.current.activarNotificacion();
    }

    cambiarPestana=(pestana)=>{
        console.log("pestana -> ",pestana);
        this.setState({
            pestanaActiva:pestana
        })
    }

    controladorRadio=async e=>{
        this.setState({base:e.target.value});      
        if(this.state.pestanaActiva==1) this.mensajes.current.cambiarBase(e.target.value);
        else this.resultado.current.cambiarBase(e.target.value);
    }


    render() {

        let pestanaRender;
        if(this.state.pestanaActiva===1){
            pestanaRender = (<Mensajes  ref={this.mensajes}></Mensajes> )
        }
        else pestanaRender = (<Resultados  ref={this.resultado}></Resultados>)


        return (
            <div className="superior">
                <Oyente oyente ={this.puedeActualizar}/>
                <Nav cambiarPestana={this.cambiarPestana} ref={this.nav}></Nav>
                <div class="home_content"  >     
                    <div className="eleccionBD">
                        <div className="itemRadio">
                            <label for="azure">Azure</label>
                            <input className="radio" 
                            type="radio" 
                            value="azure"
                            name="azure" 
                            id="azure"  
                            checked={this.state.base==="azure"}
                            onChange={this.controladorRadio}/>
                        </div>
                        <div className="itemRadio">
                            <label for="google-cloud">GCP</label>
                            <input className="radio" 
                            type="radio" 
                            value="google-cloud" 
                            name="google-cloud" 
                            id="google-cloud" 
                            checked={this.state.base==="google-cloud"}
                            onChange={this.controladorRadio}/>
                        </div>
                    </div> 
    
                    {
                        pestanaRender
                    }

                </div>
            </div>
        );
    }
}

export default Principal;
