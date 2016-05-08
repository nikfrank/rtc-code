import angular from 'angular';
import './p.css';


class Ctrl {
  constructor() {
    console.log('...');
    this.url = 'https://github.com/preboot/angular-webpack';
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
