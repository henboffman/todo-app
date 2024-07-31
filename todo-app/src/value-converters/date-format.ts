export class DateFormatValueConverter {
    toView(value: Date | string): string {
        if (!value) return '';

        const date = value instanceof Date ? value : new Date(value);

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}