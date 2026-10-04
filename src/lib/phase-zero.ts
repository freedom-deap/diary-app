export function describeEnvironment(databaseUrl: string | undefined) {
  return databaseUrl
    ? { application: "ready", database: "configured" }
    : { application: "ready", database: "missing" };
}
