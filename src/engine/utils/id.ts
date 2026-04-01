let nextId = 1;

export function generateId(prefix = "shape"): string {
    const id = `${prefix}${nextId}`;
    nextId += 1;
    return id;
}