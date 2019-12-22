const Topics = {
    APP_INFO: "app_info",
    CAR_INFO: "car_info",
    CAR_STEER: "car_steer"
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
}