ALL_BG_CLASSES = [
    "bg-primary",
    "bg-secondary",
    "bg-success",
    "bg-danger",
    "bg-warning",
    "bg-info",
    "bg-light",
    "bg-dark",
    "bg-white",
    "bg-transparent",
].join(" ");

var Type = {
    POMODORO: "pomodoro",
    BREAK:    "break",
};

var State = {
    IDLE:    "idle",
    RUNNING: "running",
    PAUSED:  "paused",
};

var Pomodoro = {
    type: Type.POMODORO,
    state: State.IDLE,
};

class Timer {

    constructor(pDuration, bDuration, target) {

        this.finished  = 0;
        this.duration  = 0;
        this.interval  = null;
        this.type      = Type.POMODORO;
        this.state     = State.IDLE;
        this.target    = target || Timer.DEFAULT_TARGET;
        this.pDuration = pDuration || Timer.DEFAULT_POMODORO;
        this.bDuration = bDuration || Timer.DEFAULT_BREAK;

        this.timerFunc = function(timer) {
            if (timer.duration <= 0) {
                if (timer.type == Type.POMODORO) {
                    markNextBallAs('check');
                    timer.type = Type.BREAK;
                    timer.finished++;
                } else {
                    timer.type = Type.POMODORO;
                }
                timer.duration = 0;
                timer.state = State.IDLE;
                clearInterval(timer.interval);
                return;
            }

            timer.duration = --timer.duration;
        };
    }

    start() {
        this.duration = (this.type == Type.POMODORO) ? this.pDuration : this.bDuration;
        this.resume();
    }

    pause() {
        clearInterval(this.interval);
        this.state    = State.PAUSED;
        this.interval = null;
    }

    stop() {
        clearInterval(this.interval);
        this.state    = State.IDLE;
        this.interval = null;
        this.duration = 0;
    }

    resume() {
        this.state    = State.RUNNING;
        this.interval = setInterval(this.timerFunc, 1000, this);
    }

    set duration(t) {
        this._duration = t;

        var min = Math.floor(this.duration / 60);
        var sec = Math.floor(this.duration % 60);
        var str = pad(min, 2) + ":" + pad(sec, 2);

        $('#time').html(str);
    }

    set state(s) {
        this._state = s;

        var label = $('#state-label');
        var btnStart = $('#start');

        var containerCls = "timer-";
        if (s == State.RUNNING) {
            containerCls += this.type;
            label.html(this.type);
        }
        else {
            containerCls += this.state;
            label.html(this.state);
        }

        btnStart.removeClass(ALL_BG_CLASSES);
        switch (this.state) {
            case State.RUNNING:
                btnStart.addClass("bg-warning").html("Pause");
                break;
            case State.IDLE:
                if (this.type == Type.POMODORO)
                    btnStart.addClass("bg-success").html("Start");
                else
                    btnStart.addClass("bg-primary").html("Break");
                break;
            case State.PAUSED:
                if (this.type == Type.POMODORO)
                    btnStart.addClass("bg-success").html("Continue");
                else
                    btnStart.addClass("bg-primary").html("Continue");
                break;
        }

        $('#timer-container')
            .removeClass("timer-running timer-paused timer-break timer-idle")
            .addClass(containerCls);
    }

    set finished(n) {
        this._finished = n;
        $('#remaining').html(this.target - this.finished);
    }

    set target(n) {
        this._target = n;
        $('#ball-container').html('<li class="ball"></li>'.repeat(n));
        $('#remaining').html(this.target - this.finished);
    }

    get duration() { return this._duration; }
    get state()    { return this._state; }
    get finished() { return this._finished; }
    get target()   { return this._target; }
}

Timer.DEFAULT_POMODORO = 45*60;
Timer.DEFAULT_BREAK    = 15*60;
Timer.DEFAULT_TARGET   = 6;

var timer = new Timer();

var pressedStart = function() {
    switch (timer.state) {
        case State.RUNNING:
            timer.pause();
            break;
        case State.PAUSED:
            timer.resume();
            break;
        case State.IDLE:
            timer.start();
            break;
    }
}

$('#start').click(function(){
    pressedStart();
});

$('#reset').click(function(){
    timer.stop();
});

$('body').keydown(function(e){
    if (e.which == 32)
        pressedStart();
});

var markNextBallAs = function(icon) {
    $('#ball-container > li:not(.ball-fill):first')
        .addClass("ball-fill ball-" + icon)
        .html('<i class="fas fa-' + icon + '"></i>');
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
