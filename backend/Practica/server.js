const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const {ApolloServer, gql} = require('apollo-server-express');
const Usuario = require('./models/usuario');

mongoose.connect('mongodb://localhost:27017/bdunab');

const typeDefs = gql`
type Usuario{
    id: ID!
    nombre: String!
    pass: String!
}
input UsuarioInput{
    nombre: String!
    pass: String!
}
type Response{
    status: String
    message: String
}
type Query{
    getUsuarios: [Usuario]
    getUsuarioById(id: ID!): Usuario
}
type Mutation{
    addUsuario(input: UsuarioInput): Usuario
    updUsuario(id: ID!, input: UsuarioInput): Usuario
    delUsuario(id: ID!): Response 
}
`;

const resolvers = {
    Query: {
        async getUsuarios(obj){
            const usuarios = await Usuario.find();
            return usuarios;
        },
        async getUsuarioById(obj, {id}){
            const usuarioBus = await Usuario.findById(id);
            if(usuarioBus == null){
                return null;
            } else {
                return usuarioBus;
            }
        }

    },
    Mutation: {
        async addUsuario(obj, {input}){
            const usuario = new Usuario(input);
            await usuario.save();
            return usuario;
        },
        async updUsuario(obj, {id, input}){
            const usuario = await Usuario.findByIdAndUpdate(id, input);
            return usuario;
        },
        async delUsuario(obj, {id}){
            await Usuario.deleteOne({_id: id});
            return{
            status: "200",
            message: "Usuario Eliminado",
            }
        }
    }
}

const app = express();
app.use(cors());

let apolloServer = null;

const corsOptions = {
    origin: "http://localhost:5500",
    credentials: false
};

async function startServer(){
    apolloServer = new ApolloServer({typeDefs, resolvers, corsOptions});
    await apolloServer.start();
    apolloServer.applyMiddleware({app, cors:false});
}

startServer();

app.listen(5500, function(){
    console.log("Servidor Iniciado en puerto: 5500");
})