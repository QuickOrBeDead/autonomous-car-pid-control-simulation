const Topics = {
    APP_INFO: "app_info",
    APP_CONTROL: "app_control",
    CAR_INFO: "car_info",
    CAR_STEER: "car_steer",
    LASER_SCAN: "laser_scan",
    DEBUG_INFO: "debug_info",
    KEYBOARD_KEY_PRESSED: "keyboard_key_pressed"
};

class EventManager {
    constructor() {
        this.registry = {};
    }

    subscribeMany(topics, callback) {
        const len = topics.length;
        for (let i = 0; i < len; i++) {
            const topic = topics[i];
            this.subscribe(topic, callback);
        }
    }

    subscribe(topic, callback) {
        let registryItem = this.registry[topic];
        if (!registryItem) {
            this.registry[topic] = [callback];
        } else {
            registryItem.push(callback);
        }
    }

    publish(topic, item) {
        let registryItem = this.registry[topic];
        if (registryItem) {
            const len = registryItem.length;
            for (let i = 0; i < len; i++) {
                const callback = registryItem[i];
                callback(item);
            }
        }
    }

    reset() {
        this.registry = {};
    }
}