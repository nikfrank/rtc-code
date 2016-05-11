import angular from 'angular';
import './p.css';
import Cani from 'canijs/cani.js';
import bootRTC from 'canijs/in-the-works/cani-webrtc/cani-webrtc.js';
import io from 'socket.io-client';

Cani.rtc = bootRTC({}, Cani, io);

class Ctrl {
  constructor() {
    console.log('....');
    console.log(Cani);
  }
}


let p = {
  template: require('./p.html'),
  controller: Ctrl
};

import parentName from '../p.js';
import name from './name.js';

angular.module(parentName+'.'+name, [])
  .component(name, p);

export default parentName+'.'+name;
