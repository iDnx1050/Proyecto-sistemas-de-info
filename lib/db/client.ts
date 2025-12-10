// Demo-friendly prisma stub to satisfy imports when the database is disabled.
// In demo mode the UI usa datos en memoria, y las rutas API no deberían llamarse.
// Si alguien invoca las rutas API, devolverán error explícito.

type StubFn = (...args: any[]) => Promise<never>

const stubMethod: StubFn = async () => {
  throw new Error("Database is disabled (demo mode)")
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy(
  {},
  {
    get: () => stubMethod,
  },
)

export default prisma
