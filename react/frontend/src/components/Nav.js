import React, { Component } from 'react';
import '../css/nav.css';

class Nav extends Component {

    constructor(props) {
        super(props);
        
        this.cambiarEstado =  this.cambiarEstado.bind(this);
        this.activarNotificacion = this.activarNotificacion.bind(this);
        this.sidebar = React.createRef();
        this.notificacion = React.createRef();
    }
    

    cambiarEstado(e){
        this.sidebar.current.classList.toggle("active");
    }

    pestanaActiva=(valor)=>{
        this.props.cambiarPestana(valor);
    }

    activarNotificacion=()=>{
        setTimeout(() => {
            this.notificacion.current.classList.add("llegoNotificacion");

            setTimeout(() => {                
                this.notificacion.current.classList.remove("llegoNotificacion");
            }, 5000);

        }, 4000);

    }

    render() {
        return (
            <div className="sidebar"  ref={this.sidebar} >
            <div className="notificacion" ref={this.notificacion}>
                <i class="fas fa-bell"></i>
                <h5>Nuevos datos ingresados</h5>
            </div> 
            <div className="logo_content">
                <div className="logo">
                    <i className="fas fa-globe"></i>
                    <div className="logo_name">Proyecto 1</div>
                </div>
                <i className="fas fa-bars" id="botonAccion" onClick={e=>this.cambiarEstado(e)}></i>
            </div>
            <div className="nav_lista">
                {/* <div className="item_lista">
                    <a href="#">
                        <i className="fas fa-search"></i>
                        <input type="text" name="" id="" placeholder="Search"/>
                    </a>
                    <span className="tooltip">Search</span>
                </div> */}
                {/* <div className="item_lista">
                    <a href="#" onClick={e=>this.pestanaActiva(1)}>
                        <i className="fas fa-th"></i>
                        <span className="nombre_enlaces">Dashboard</span>
                    </a>
                    <span className="tooltip">Dashboard</span>
                </div> */}
                <div className="item_lista" >
                    <a href="#" onClick={e=>this.pestanaActiva(1)}>
                        <i className="far fa-comment-alt"></i>
                        <span className="nombre_enlaces">Messages</span>
                    </a>
                    <span className="tooltip">Messages</span>
                </div>
                <div className="item_lista" onClick={e=>this.pestanaActiva(2)}>
                    <a href="#">
                        <i className="fas fa-user"></i>
                        <span className="nombre_enlaces">Resultados</span>
                    </a>
                    <span className="tooltip">Resultados</span>
                </div>
  
                <div className="item_lista">
                    <a href="http://34.125.100.209:3000/d/KGuh5XI7k/prometheus-2-0-overview?orgId=1&refresh=5s&from=1632277528618&to=1632284728618">
                        <i className="fas fa-chart-line"></i>
                        <span className="nombre_enlaces">Analytics</span>
                    </a>
                    <span className="tooltip">Analytics</span>            
                </div>
             
            </div>
    
            <div className="perfil_content">
                <div className="perfil">
                    <div className="detalle_perfil">
                        
                        <div className="nombre_content">
                            <div className="nombre">SOPES1</div>
                            <div className="trabajo">2021 2s</div>
                        </div>
                    </div>                
                    <i className="fas fa-sign-out-alt" id="salir"></i>
                </div>
            </div>
        </div>
        );
    }
}

export default Nav;
