import angular from 'angular';
import './p.css';
import Cani from 'canijs/cani.js';
import bootRTC from 'canijs/in-the-works/cani-webrtc/cani-webrtc.js';
import io from 'socket.io-client';

import md5 from 'js-md5';
console.log(md5);

let socket = io('http://localhost:8500');

Cani.core.affirm('socket', socket);
bootRTC({}, Cani);

class Ctrl {
  constructor($timeout) {
    this.offers = [];
    this.channels = [];

    
    this.listRooms = ()=> socket.emit('list-rooms');
    socket.on('room-list', hosts=>{
      this.hosts = hosts;
      $timeout(()=>0,0); // scope digest hack!... ugh. looks like an owl
    });
    this.listRooms();

    
    Cani.core.confirm('rtc').then(rtc=>{

      // patron code
      this.joinRoom = (roomName, userData)=>{
	let room = this.hosts[roomName];

	let userName = userData;
	let dcLabel = roomName+'||'+userName;//+'||'+room.hostId;
	
	// here, make an offer to the host of the room.
	rtc.offer(
	  // signalling function
	  (offer, candidate)=> socket.emit('offer-to-room', {room, offer, candidate, dcLabel, userData}),

	  // receive answer is more like "accept response to my offer"
	  // this function is "how to await response to offer"... could put a hook for confirm-no-reneg.
	  receiveAnswer=> socket.on('answer-to-offerer', answer=>{
	    receiveAnswer(answer);
	    socket.removeAllListeners('answer-to-offerer'); // irl patron can disconnect socket on answer
	  }),
	  
	  // track offer by this dataChannel label
	  dcLabel);

	// once dataChannel established (ie remoteDescription set)
	Cani.core.confirm('webrtc: datachannels['+dcLabel+'].onopen').then(dc=>{
	  this.channels.push(dc);
	  rtc.listen(dcLabel, msg=> console.log('HOST SENT MESSAGE!', msg));
	  $timeout(()=>0,0);
	});

	Cani.core.disconfirm('webrtc: datachannels['+dcLabel+'].onopen').then(()=>{
	  this.channels = this.channels.filter(ch=> ch.label !== dcLabel);
	  $timeout(()=>0,0);
	});
      };



      
      // host code
      this.createRoom = (name, secret)=> socket.emit('create-room', {name, secret});

      this.acceptOffer = oi=>{
	let {offer, candidate, patronId, dcLabel, userData} = this.offers.splice(oi, 1)[0];
	
	rtc.acceptOffer({offer, candidate, dcLabel}, answer=>
	  socket.emit('answer-to-patron', {answer, patronId}));

	Cani.core.confirm('webrtc: datachannels['+dcLabel+'].onopen').then(dc=>{
	  this.channels.push(dc);
	  rtc.listen(dcLabel, msg=> console.log('patron '+dcLabel+' sent', msg));
	  $timeout(()=>0,0);
	});

	Cani.core.disconfirm('webrtc: datachannels['+dcLabel+'].onopen').then(()=>{
	  this.channels = this.channels.filter(ch=> ch.label !== dcLabel);
	  $timeout(()=>0,0);
	});
      };
      
      socket.on('offer-to-host', off=>{
	this.offers.push(off);
	$timeout(()=>0,0);
      });



      
      // both code
      this.setCurrentChannel = ci=> (this.currentChannelIndex = ci);
      
      this.send = msg=>{
	rtc.send(msg, this.channels[this.currentChannelIndex].label).then(res=> console.log(res));
      };
    });

    this.send = ()=> console.log('rtc not yet ready!');
    
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
