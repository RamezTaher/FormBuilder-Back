import { FastifyReply } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { IPagination } from "./pagination";

export interface IResponse<T = unknown> extends FastifyReply<Server, IncomingMessage, ServerResponse> {
    pagination?: IPagination;
    token?: string;
    admin?: T;
    data?: T;
    message?: string;
}
