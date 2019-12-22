const eventManager = new EventManager();
const debug = {
    watch: new DebugWatch()
};

class Application {
    static start() {
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
            deltaTime = 0;
        
        const car = new Car({ screenWidth: width, screenHeight: height, x: 200, y: 200, heading: 0 });
        const ai = new AI();

        eventManager.subscribeMany([Topics.CAR_INFO, Topics.APP_INFO], function(d) {
            for (const key in d) {
                if (d.hasOwnProperty(key)) {
                    const element = d[key];
                    debug.watch.set(key, element);
                }
            }
        });

        render(0);

        function render(t) {
            updateFps(t);

            eventManager.publish(Topics.APP_INFO, { "Total Time": Math.floor(time / 1000), 
                                                    "Delta Time": { val: deltaTime, toString: function() { return this.val.toFixed(4); } },
                                                    "Fps": fps });

            ctx.clearRect(0, 0, width, height);

            runSim(ctx);

            window.requestAnimationFrame(render);
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

        window.addEventListener("keypress", function(e) {
            if (e.keyCode === KeyCodes.SPACE) {
                running = !running;
            }

            eventManager.publish(Topics.KEYBOARD_KEY_PRESSED, e);
        });

        window.addEventListener("keydown", function(e) {
            if (e.keyCode === KeyCodes.LEFT) {
                car.steer(SteerDirection.LEFT);
            } else if (e.keyCode === KeyCodes.RIGHT) {
                car.steer(SteerDirection.RIGHT);
            } else if (e.keyCode === KeyCodes.UP) {
                car.steer(SteerDirection.FORWARD);
            } else if (e.keyCode === KeyCodes.DOWN) {
                car.steer(SteerDirection.BACKWARD);
            }
        });
    }
}