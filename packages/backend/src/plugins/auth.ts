import {
  createGithubProvider,
  createRouter,
} from '@backstage/plugin-auth-backend';
import { createGoogleProvider } from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  database,
  config,
  discovery,
  tokenManager,
}: PluginEnvironment): Promise<Router> {
  return await createRouter({
    logger,
    config,
    database,
    discovery,
    tokenManager,
    providerFactories: {
      google: createGoogleProvider({
        signIn: {
          resolver: async (user, ctx) => {
            const ent = [];

            if (user.profile.email) {
              const [id = '', domain] = user.profile.email?.split('@');
              const namespace = domain === 'spotify.com' ? 'default' : 'ext';
              ent.push(`User:${namespace}/${id}`);
              ent.push(`Group:${namespace}/${namespace}-group`);

              // Issue the token containing the entity claims
              const token = await ctx.tokenIssuer.issueToken({
                claims: { sub: `User:${namespace}/${id}`, ent },
              });
              return { id, token };
            }
            return { token: '', id: '' };
          },
        },
      }),
      github: createGithubProvider({
        signIn: {
          resolver: async (user, ctx) => {
            const ent = [];
            const id = user.result.fullProfile.username ?? 'guest';
            const prov =
              user.result.fullProfile.provider === 'github' ? 'ext' : 'default';
            ent.push(`User:${prov}/${id}`);
            ent.push(`Group:${prov}/ext-group`);

            const token = await ctx.tokenIssuer.issueToken({
              claims: { sub: `User:${prov}/${id}`, ent },
            });
            return { id, token };
          },
        },
      }),
    },
  });
}
