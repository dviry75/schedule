import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/authService';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = registerSchema.parse(request.body);
    const user = await this.authService.register(body.email, body.password);

    const token = await reply.jwtSign({ sub: user.id, email: user.email });
    reply.code(201).send({
      id: user.id,
      email: user.email,
      token
    });
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);
    const user = await this.authService.login(body.email, body.password);

    const token = await reply.jwtSign({ sub: user.id, email: user.email });
    reply.send({
      id: user.id,
      email: user.email,
      token
    });
  };
}
