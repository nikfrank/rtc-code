import angular from 'angular';
import './p.css';

class Ctrl {
  constructor() {
    console.log('...');
  }
}
Ctrl.$inject = [];

let p = {
  template: require('./p.html'),
  controller: Ctrl,
  bindings:{}
};

import parentName from '../p.js';
import name from './name.js';

// here the user will have to manually inject the child modules.
// this should be replaced by automagically dumping
// or removing the module from it's parent
// on creation or destruction
angular.module(parentName+'.'+name, [])
  .component(name, p);

export default parentName+'.'+name;
