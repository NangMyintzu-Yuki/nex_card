/**
 * During maintenance mode, prepends /dev to internal paths.
 * Use this in router.push() and fetch() calls.
 *
 * Example:  router.push(maintenancePath("/dashboard?pending=true"))
 */
export function maintenancePath(path: string): string {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    // Already prefixed or external
    if (path.startsWith("/dev") || path.startsWith("http") || path.startsWith("mailto:")) {
      return path;
    }
    return `/dev${path}`;
  }
  return path;
}
