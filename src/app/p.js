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

    this.listRooms = ()=> socket.emit('list-rooms');
    socket.on('room-list', hosts=>{
      this.hosts = hosts;
      $timeout(()=>8, 0); // scope digest hack!... ugh
    });
    this.listRooms();

    
    Cani.core.confirm('rtc').then(rtc=>{
      // patron code
      this.joinRoom = (roomName, userName)=>{
	let room = this.hosts[roomName];

	let dcLabel = roomName+'||'+userName;
	
	// here, make an offer to the host of the room.
	rtc.offer((offer, candidate)=> socket.emit('offer-to-room', {room, offer, candidate, dcLabel}),
		  receiveAnswer=> socket.on('answer-to-offerer', receiveAnswer),  
		  answer=> console.log('answer from host', answer),
		  dcLabel);
      };

      // host code
      this.createRoom = name=> socket.emit('create-room', {name});
      
      socket.on('offer-to-host', ({offer, candidate, patronId, user})=>{
	// here decide whether to accept or not!
	rtc.acceptOffer({offer, candidate, user}, answer=>
	  socket.emit('answer-to-patron', {answer, patronId}));
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