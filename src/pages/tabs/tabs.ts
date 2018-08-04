import { Component } from '@angular/core';

import { GraficosPage } from '../graficos/graficos';
import { HomePage } from '../home/home';
import { SettingsPage } from '../settings/settings';

import { Socket } from 'ng-socket-io';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root: any = HomePage;
  tab2Root: any = GraficosPage;
  tab3Root: any = SettingsPage;

  constructor(private socket: Socket) {
    this.socket.connect();
  }

  ionViewWillLeave() {
    this.socket.disconnect();
  }
}
