import angular from 'angular';
import './p.css';
import Cani from 'canijs/cani.js';
import bootRTC from 'canijs/in-the-works/cani-webrtc/cani-webrtc.js';
import io from 'socket.io-client';

let socket = io('http://localhost:8500');

Cani.core.affirm('socket', socket);
bootRTC({}, Cani);

class Ctrl {
  constructor($timeout) {

    this.createRoom = name=> socket.emit('create-room', {name});
    this.listRooms = ()=> socket.emit('list-rooms');
    
    socket.on('room-list', hosts=>{
      this.hosts = hosts;
      $timeout(()=>8, 0); // scope digest hack!... ugh
    });
    this.listRooms();

    
    Cani.core.confirm('rtc').then(rtc=>{
      
      this.joinRoom = (roomName, userName)=>{
	let room = this.hosts[roomName];
	
	// here, make an offer to the host of the room.
	rtc.offer((offer, candidate)=> socket.emit('offer-to-room', {room, offer, candidate}),
		  receiveAnswer=> socket.on('answer-to-offerer', receiveAnswer),  
		  answer=> console.log('answer from host', answer));
      };

      socket.on('offer-to-host', ({offer, candidate, patronId})=>{
	rtc.acceptOffer(offer, candidate, answer=> socket.emit('answer-to-patron', {answer, patronId}));
      });
      
    });
  }
}
Ctrl.$inject = ['$timeout'];

let p = {
  template: require('./p.html'),
  controller: Ctrl
};

import parentName from '../p.js';
import name from './name.js';

angular.module(parentName+'.'+name, [])
  .component(name, p);

export default parentName+'.'+name;
