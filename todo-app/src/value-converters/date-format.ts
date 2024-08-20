import { valueConverter } from 'aurelia';

@valueConverter('dateFormat')
export class DateFormatValueConverter {
    toView(value: string | null): string {
        if (!value) return '';

        // Create a date object in UTC
        const date = new Date(value + 'T00:00:00Z');

        // Format the date in UTC
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    }
}