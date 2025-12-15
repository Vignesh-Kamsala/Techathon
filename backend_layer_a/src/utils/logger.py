import json
import time

class MockEventBus:
    def __init__(self):
        self.listeners = []

    def emit(self, event_type: str, payload: dict):
        event = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "type": event_type,
            "payload": payload
        }
        # In a real app, this would push to a websocket.
        # Here we just print to stdout for the demo capture or append to a log list.
        print(f"[EVENT] {json.dumps(event)}")
        return event

event_bus = MockEventBus()

def emit_event(event_type: str, payload: dict):
    return event_bus.emit(event_type, payload)
