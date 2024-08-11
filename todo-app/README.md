# todo-app

This project is bootstrapped by [aurelia/new](https://github.com/aurelia/new).

## Known bugs

- the row-edit dropdown date is suffering from a UTC offset where the selected date is rendered as the day prior

## TODO

- add ability to export and import data
- add ability to restore items deleted (currently soft-deleting them)
- focused entry mode to remove visual distractions throughout the day
- improve the editing functionality. the row isn't very easy to use
- add a review mode that the user can engage at the end of the day (or on demand) to fill in additional details for new entries
- add a better mechanism to promote "this is what you should do today"

## Start dev web server

    npm start

## Build the app in production mode

    npm run build

It builds all files to dist folder. To deploy to production server, copy all the `dist/*` files to production root folder.

For example

```
dist/index.html
dist/foo.12345.js
```

Copy to production root folder

```
root_folder/index.html
root_folder/foo.12345.js
```

## Unit Tests

    npm run test

Run unit tests in watch mode.

    npm run test:watch

## Analyze webpack bundle

    npm run analyze
