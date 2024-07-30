import Aurelia from 'aurelia';
import { Home } from './home';
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
import { RelativeTimeValueConverter } from './value-converters/relative-time-value-converter';
import { ObjectEntriesValueConverter } from './value-converters/object-entries';
import { SettingsSidebar } from './components/settings-sidebar/settings-sidebar';
import { DialogConfiguration, DialogDefaultConfiguration } from '@aurelia/dialog';
import { CreateActionItemDialog } from './dialogs/create-action-item-dialog/create-action-item-dialog';

Aurelia
  .register(DialogDefaultConfiguration)
  .register(RelativeTimeValueConverter)
  .register(ObjectEntriesValueConverter)
  .register(SettingsSidebar)
  .register(CreateActionItemDialog)
  .app(Home)

  .start();
