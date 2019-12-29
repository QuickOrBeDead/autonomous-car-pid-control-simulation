const eventManager = new EventManager();
const debug = {
    watch: new DebugWatch()
};

const ApplicationStates = {
    RUNNING: 1,
    PAUSED: 2,
    RESTART: 3,
    SWITCH_RUNNING: 4
};

class Application {
    static init() {
        window.addEventListener("keypress", function(e) {
            eventManager.publish(Topics.KEYBOARD_KEY_PRESSED, e);
        });

        window.addEventListener("keydown", function(e) {
            if (e.keyCode === KeyCodes.LEFT) {
                eventManager.publish(Topics.CAR_STEER, { left: 1 });
            } else if (e.keyCode === KeyCodes.RIGHT) {
                eventManager.publish(Topics.CAR_STEER, { right: 1 });
            } else if (e.keyCode === KeyCodes.UP) {
                eventManager.publish(Topics.CAR_STEER, { forward: 1 });
            } else if (e.keyCode === KeyCodes.DOWN) {
                eventManager.publish(Topics.CAR_STEER, { backward: 1 });
            }
        });

        Application.start();
    }

    static start() {
        eventManager.reset();
        
        const canvas = document.getElementById("canvas"),
              ctx = canvas.getContext("2d"),
              width = canvas.width = window.innerWidth,
              height = canvas.height = window.innerHeight;

        let running = true,
            lastframe = 0,
            fpstime = 0,
            framecount = 0,
            fps = 0,
            time = 0,
            deltaTime = 0,
            shutDown = false;
        
        const car = new Car({ screenWidth: width, screenHeight: height, x: 200, y: 200, track: new Track() });
        const ai = new AI();

        eventManager.subscribeMany([Topics.CAR_INFO, Topics.APP_INFO, Topics.LASER_SCAN, Topics.DEBUG_INFO], function(d) {
            for (const key in d) {
                if (d.hasOwnProperty(key)) {
                    const element = d[key];
                    debug.watch.set(key, element);
                }
            }
        });

        eventManager.subscribe(Topics.APP_CONTROL, function(d) {
            if (d === ApplicationStates.RUNNING) {
                running = true;
            } else if (d === ApplicationStates.PAUSED) {
                running = false;
            } else if (d === ApplicationStates.RESTART) {
                shutDown = true;
            } else if (d === ApplicationStates.SWITCH_RUNNING) {
                running = !running;
            }
        });

        eventManager.subscribe(Topics.KEYBOARD_KEY_PRESSED, function(e) {
            if (e.keyCode === KeyCodes.SPACE) {
                eventManager.publish(Topics.APP_CONTROL, ApplicationStates.SWITCH_RUNNING);
            } else if(e.key === "r") {
                eventManager.publish(Topics.APP_CONTROL, ApplicationStates.RESTART);
            }
        });

        function getAppState() {
            if (shutDown) {
                return "Shutdown";
            }

            if (running) {
                return "Running";
            } else {
                return "Paused";
            }
        }

        render(0);

        function render(t, stop) {
            updateFps(t);

            eventManager.publish(Topics.APP_INFO, { "Total Time": { val: Math.floor(time / 1000), toString : function() { return toTime(this.val); } }, 
                                                    "Delta Time": { val: deltaTime, toString: function() { return this.val.toFixed(4); } },
                                                    "Fps": fps,
                                                    "State": { toString: function() { return getAppState(); } } 
                                                });

            ctx.clearRect(0, 0, width, height);

            runSim(ctx);

            if (stop) {
                alert("Click OK to Restart.");

                Application.start();
            } else {
                window.requestAnimationFrame(function (_t) {
                    render(_t, shutDown);
                });
            }
        }

        function updateFps(t) {
            time = t;

            deltaTime = (t - lastframe) / 1000;
            lastframe = t;
            
            if (fpstime > 0.25) {
                // Calculate fps
                fps = Math.round(framecount / fpstime);
                
                // Reset time and framecount
                fpstime = 0;
                framecount = 0;
            }
            
            // Increase time and framecount
            fpstime += deltaTime;
            framecount++;
        }

        function runSim(ctx) { 
            if (running) {
                car.update();
                ai.run();
            }
            
            car.draw(ctx);
            debug.watch.draw(ctx);
        }

        function toTime(val) {
            const hours = Math.floor(val / 3600),
                  hoursToMinutes = (hours * 3600),
                  minutes = Math.floor((val - hoursToMinutes) / 60),
                  seconds = val - hoursToMinutes - (minutes * 60);
          
            return hours.toString(10).padStart(2, "0") + ":" + minutes.toString(10).padStart(2, "0") + ":" + seconds.toString(10).padStart(2, "0"); 
        }
    }
}