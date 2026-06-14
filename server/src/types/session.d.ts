import 'express-session';

declare module 'express-session' {
  interface SessionData {
    googleLinkUserId?: string;
  }
}
