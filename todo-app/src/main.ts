import Aurelia from 'aurelia';
import { Home } from './home';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { RelativeTimeValueConverter } from './value-converters/relative-time-value-converter';
import { ObjectEntriesValueConverter } from './value-converters/object-entries';
import { SettingsSidebar } from './components/settings-sidebar/settings-sidebar';
import { DialogConfiguration, DialogDefaultConfiguration } from '@aurelia/dialog';
import { CreateActionItemDialog } from './dialogs/create-action-item-dialog/create-action-item-dialog';
import { QuickTodoDialog } from './dialogs/quick-todo-dialog/quick-todo-dialog';
import { ActionItemCard } from './components/action-item-card/action-item-card';
import { ActionItemTable } from './components/action-item-table/action-item-table';
import { DateFormatValueConverter } from './value-converters/date-format';
import { TableFilterDialog } from './dialogs/table-filter-dialog/table-filter-dialog';
import { ColumnSelectDialog } from './dialogs/column-select-dialog/column-select-dialog';
import { SortValueConverter } from './value-converters/sort-value-converter';

Aurelia
  .register(DialogDefaultConfiguration)
  .register(RelativeTimeValueConverter)
  .register(ObjectEntriesValueConverter)
  .register(DateFormatValueConverter)
  .register(SortValueConverter)

  .register(SettingsSidebar)
  .register(CreateActionItemDialog)
  .register(QuickTodoDialog)
  .register(TableFilterDialog)
  .register(ColumnSelectDialog)
  .register(ActionItemCard)
  .register(ActionItemTable)
  .app(Home)

  .start();
