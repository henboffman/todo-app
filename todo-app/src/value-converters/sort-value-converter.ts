// src/value-converters/sort-value-converter.ts

export class SortValueConverter {
    toView(array: any[], propertyName: string, direction: 'asc' | 'desc' = 'asc') {
        if (!array || !propertyName) {
            return array;
        }

        const sortedArray = array.slice().sort((a, b) => {
            const valueA = a[propertyName];
            const valueB = b[propertyName];

            if (valueA < valueB) {
                return direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sortedArray;
    }
}