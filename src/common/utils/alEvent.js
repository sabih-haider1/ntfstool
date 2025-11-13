/**
 * @author   service@ntfstool.com
 * Copyright (c) 2020 ntfstool.com
 * Copyright (c) 2020 alfw.com
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the MIT General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * MIT General Public License for more details.
 *
 * You should have received a copy of the MIT General Public License
 * along with this program (in the main directory of the NTFS Tool
 * distribution in the file COPYING); if not, write to the service@ntfstool.com
 */

// Safe import of events module
let events;
try {
    events = require('events');
    // Verify EventEmitter is available
    if (!events || !events.EventEmitter) {
        console.error('EventEmitter not available in events module');
        events = null;
    }
} catch (error) {
    console.error('Failed to load events module:', error.message);
    events = null;
}

var event = null;

export function alEvent(){
    if (event === null) {
        if (!events || !events.EventEmitter) {
            console.warn('EventEmitter not available, creating stub');
            // Return a minimal event emitter stub
            event = {
                emit: () => {},
                on: () => {},
                removeAllListeners: () => {}
            };
        } else {
            event = new events.EventEmitter();
        }
    }
    return event;
}
