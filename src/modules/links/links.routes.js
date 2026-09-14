import { Router } from 'express'
import * as controlador from './links.controller.js'

const rotas = Router()

rotas.post('/links', controlador.criar)
rotas.get('/links', controlador.listar)
rotas.get('/links/:codigo', controlador.detalhar)
rotas.delete('/links/:codigo', controlador.remover)

export default rotas
