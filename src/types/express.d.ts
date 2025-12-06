import type { Users } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends Users {}
  }
}

export {};
