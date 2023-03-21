import { IUser } from "./user";
import { FastifyRequest } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
export interface IRequest<T = unknown> extends FastifyRequest<T, Server, IncomingMessage, ServerResponse> {
    [x: string]: any;
    loggedUser?: Partial<IUser>;
    body: any;
    query: any;
    params: any;
    headers: any;
}

