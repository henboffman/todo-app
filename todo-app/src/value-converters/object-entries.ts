// object-entries.ts
export class ObjectEntriesValueConverter {
    toView(obj: Record<string, any>): [string, any][] {
        if (typeof obj !== 'object' || obj === null) {
            return [];
        }
        return Object.entries(obj);
    }
}