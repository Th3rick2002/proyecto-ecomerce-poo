import 'reflect-metadata'
import 'dotenv/config'
import {Server} from "./server";
import express from "express";


const server = new Server(express())
server.startServer()