
import {
  GrantConfig,
  GrantOptions,
  FastifyMiddleware,
  GrantInstance
} from 'grant'

/**
 * Fastify handler
 */
export default function (config: GrantConfig | GrantOptions): FastifyMiddleware & GrantInstance
