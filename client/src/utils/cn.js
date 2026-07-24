export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatRole(role) {
  return role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';
}
