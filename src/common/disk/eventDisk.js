// Safe import of EventEmitter
let EventEmitter;
try {
    const events = require('events');
    EventEmitter = events.EventEmitter || events;
} catch (error) {
    console.error('Failed to load EventEmitter:', error.message);
    // Fallback EventEmitter
    EventEmitter = class EventEmitter {
        constructor() { this.events = {}; }
        emit(event, ...args) {
            if (this.events[event]) {
                this.events[event].forEach(cb => cb(...args));
            }
        }
        on(event, callback) {
            if (!this.events[event]) this.events[event] = [];
            this.events[event].push(callback);
        }
    };
}

var eventInstance = null;

// Define event types (appears to be used but not defined)
const eventType = {
    newDev: 'newDev'
};

function getEventInstance(){
    if (eventInstance === null) {
        try {
            eventInstance = new EventEmitter();
        } catch (error) {
            console.error('Failed to create EventEmitter:', error);
            eventInstance = {
                emit: () => {},
                on: () => {}
            };
        }
    }
    return eventInstance;
}


export function newDevEvent(){
    console.warn("send " + eventType.newDev)
    getEventInstance().emit(eventType.newDev);
}

export function onNewDevEvent(callback){
    getEventInstance().on(eventType.newDev, function(data) {
        console.warn("on " + eventType.newDev)
        callback(data);
    });
}


