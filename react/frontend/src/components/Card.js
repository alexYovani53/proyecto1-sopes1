import React, { Component } from 'react';

class Card extends Component {

    constructor(props) {
        super(props);        

        this.refCard = React.createRef();



    }
    
    componentDidMount(){
        if(this.props.clase == "ultimo"){
            this.refCard.current.classList.add("ultimo");
        }
    }


    render() {

        if(this.props.clase == "no" && this.refCard.current) this.refCard.current.classList.remove("ultimo");
        
        return (
            <div className="CARD" ref={this.refCard} id={this.props.id}>
                {this.props.id}
                <div className="Encabezado">
                    <i class="fas fa-user-circle"></i>
                    <div className="EncabezadoInfo">
                        <h4>{this.props.card.nombre}</h4>
                        <span className="hash">{                         
                        
                                    this.props.card.PublicacionHashtags.map(valor=>{
                                        if(valor.Hashtag) return '#'+valor.Hashtag.comentario+" " 
                                        if(valor.HashtagGC) return '#'+valor.HashtagGC.comentario+" " 
                                    })     
                        }</span>
                    </div>
                </div>
                <h5> {this.props.card.comentario}</h5>
                <h6> {new Date(this.props.card.fecha).toISOString()} </h6>
                <div className="division"></div>
                <div className="contadores">
                    <h4>UPVOTES:</h4>
                    <div className="upvotes">{this.props.card.upvotes}</div>                   
                    <h4>DOWNVOTES:</h4>
                    <div className="downvotes">{this.props.card.downvotes}</div>
                </div>
                <h6 className="fecha-flotante"> {new Date(this.props.card.fecha).toDateString()} </h6>
            </div>

            
        );
    }
}

export default Card;
