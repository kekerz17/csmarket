import passport from 'passport';
import SteamStrategy from 'passport-steam';
import { env } from '../env.js';

if (env.steam.apiKey) {
  passport.use(
    new SteamStrategy(
      {
        returnURL: `${env.publicApiUrl}/api/auth/steam/return`,
        realm: env.publicApiUrl,
        apiKey: env.steam.apiKey,
      },
      (_identifier: string, profile: any, done: (err: any, user?: any) => void) => {
        done(null, profile);
      },
    ),
  );
}

export default passport;
