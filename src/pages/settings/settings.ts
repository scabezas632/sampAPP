import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';


/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  public email: boolean;
  public device: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public nativeStorage: NativeStorage) {
      this.getLocalStorage();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  getLocalStorage(){
    this.nativeStorage.getItem('PREF_NOTIFY_EMAIL')
  .then(
    data => this.email = data,
    error => console.error(error)
  );
  this.nativeStorage.getItem('PREF_NOTIFY_DEVICE')
  .then(
    data => this.device = data,
    error => console.error(error)
  );
  }

  public changeToggleEmail(){
    this.nativeStorage.setItem('PREF_NOTIFY_EMAIL', !this.email);
  }

  public changeToggleDevice(){
    this.nativeStorage.setItem('PREF_NOTIFY_DEVICE', !this.device);
  }

}
