import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { Chart } from 'angular-highcharts';
import { HttpClient } from '@angular/common/http';


import { DatabaseProvider } from '../../providers/database/database';


@IonicPage()
@Component({
  selector: 'page-graficos',
  templateUrl: 'graficos.html',
})
export class GraficosPage {

  graficos: any[];

  data: any;

  // Variable para saber si es primera vez que se entra a la página
  primer: boolean = true;

  categoriasTiempo = [];
  mostrarAlerta = true;
  color = '#FF0000';

  // Promedios
  tempAverageArray = [];
  luzAverageArray = [];
  tempAverage = 0;
  luzAverage = 0;

  optionsTemperature = {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Últimas 20 Temperaturas'
    },
    credits: {
      enabled: false
    },
    xAxis: {
        categories: []
    },
    yAxis: {
      title: {
          text: 'Temperatura °C'
      }
    },
    series: [
      {
        name: 'Temperatura',
        data: [],
        animation: false
      },
      {
        name: 'Luz',
        data: [],
        animation: false
      }
    ]
  }

  chartTemperature = new Chart(<any>this.optionsTemperature);

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public http: HttpClient,
              private _db: DatabaseProvider,
              private socket: Socket,
              private toastCtrl: ToastController) {
      // Cargar diseño
      let loadGraph = this.http.get('assets/graficos.json').map(res => res.graficos);
      loadGraph.subscribe(data=>{
        this.graficos = data;
        console.log(this.graficos)
      });
      // Cargar data
      this.getData().subscribe();

  }

  ionViewDidLoad() { }

  getData() {
    let observable = new Observable(observer => {
      this.socket.on('dataAPP', (data) => {
        this.obtenerDatosTiempoReal();
        observer.next(data);
      });
    })
    return observable;
  }

  obtenerDatosTiempoReal(){

    this._db.getData(this.primer)
    .then((data:any) => {
      if(this.optionsTemperature.series[0].data.length > 0) {
        var temp = data.temperatura;
        var luz = data.luz;
        // var lampara = data.lampara;
        var time = data.fecha;
  
        if(temp < 25){
          this.addPoint(this.chartTemperature, 0, temp, time);
        } else{
          this.addPoint(this.chartTemperature, 0, temp, time, this.color);
        }
        if(luz < 750){
          this.addPoint(this.chartTemperature, 1, luz, time);
        } else{
          this.addPoint(this.chartTemperature, 1, luz, time, this.color);
        }

        // Enviar alerta
        this.enviarAlertas(temp, luz);
        this.promedio(temp, luz);

      } else {
        this.llenarGrafico(data);
        this.primer = false;
      }
      // Comprobar si hay más de 20 datos mostrados en el gráfico
      if (this.optionsTemperature.series[0].data.length >= 10) {
          this.removePoint(data);
      }
      this.chartTemperature = new Chart(<any>this.optionsTemperature);
    });

  }

  llenarGrafico(data:any){
    let temp = [];
    let luz = [];
    // let lampara = [];
    let fecha = [];
    data.forEach(element => {
      let fechaElemento = new Date(element.fecha);
      temp.push(element.temperatura);
      luz.push(element.luz);
      // lampara.push(element.lampara);
      fecha.push(fechaElemento.getHours() + ':' + fechaElemento.getMinutes() + ':' + fechaElemento.getSeconds());
    });

    this.promedio(temp, luz);

    this.optionsTemperature.series[0].data = temp;
    this.optionsTemperature.series[1].data = luz;
    this.optionsTemperature.xAxis.categories = fecha;
  }

  // Serie = Array index serie
  addPoint(chart, serie, valor, time, color?){

    const fechaElemento = new Date(time);
    const fecha = fechaElemento.getHours() + ':' + fechaElemento.getMinutes() + ':' + fechaElemento.getSeconds();

    if(color){
      chart.addPoint({marker:{fillColor: color}, y: valor, color: color}, serie);
    } else {
      chart.addPoint(valor, serie);
    }
    this.optionsTemperature.xAxis.categories.push(fecha);
  }

  removePoint(data){
    this.optionsTemperature.series[0].data = this.optionsTemperature.series[0].data.slice(-10);
    this.optionsTemperature.series[1].data = this.optionsTemperature.series[1].data.slice(-10);
    this.optionsTemperature.xAxis.categories = this.optionsTemperature.xAxis.categories.slice(-10);
  }

  enviarAlertas(temp, luz){
    // if (temp > 30) {
      //     email.tem(tem) //envia email de alerta 
      // }
  
      if ((temp >= 25 || luz >= 750) && this.mostrarAlerta) {
          let mensaje = '¡Alerta!, Los parametros están fuera de rango, se apagará la ampolleta.';
          this.presentToast(mensaje);
          this.mostrarAlerta = false;
      } else if((temp < 25 && luz < 750) && !this.mostrarAlerta) {
          let mensaje = 'Los parametros han vuelto a la normalidad.';
          this.presentToast(mensaje);
          this.mostrarAlerta = true;
      }
  }

  promedio(temp, luz){

    if(this.primer) {
      this.tempAverageArray = temp;
      // this.luzAverageArray = luz;
    } else {
      this.tempAverageArray.push(temp);
      // this.luzAverageArray.push(luz);
    }
  
  // Comprobar si hay más de 60 datos en el promedio
    if (this.tempAverageArray.length > 60) {
      this.tempAverageArray = this.tempAverageArray.slice(-60);
      this.luzAverageArray = this.luzAverageArray.slice(-60);
    }

    this.tempAverage = this.obtenerPromedio(this.tempAverageArray);
    // this.luzAverage = this.obtenerPromedio(this.luzAverageArray);
  }

  obtenerPromedio(array) {
    var x = 0;
    array.forEach(element => {
        x = x + element;
    });
    return Number((x / array.length).toFixed(1));
  }

  presentToast(mensaje: string) {
    let toast = this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top'
    });
  
    toast.onDidDismiss(() => {
      // console.log('Dismissed toast');
    });
  
    toast.present();
  }

  toggleSection(i) {
    this.graficos[i].open = !this.graficos[i].open;
  }
 
  toggleItem(i, j) {
    this.graficos[i].children[j].open = !this.graficos[i].children[j].open;
  }

}
