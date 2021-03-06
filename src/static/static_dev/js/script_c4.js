is_my_turn = null;

$(document).ready(function() {
    current_turn_blink();
    current_duration();
    update_page();

    if (document.location.hash == '#just_won') {
        congratulate_win();
        document.location.hash = '';
    } else if (document.location.hash == '#draw') {
        congratulate_draw();
        document.location.hash = '';
    }
});

// When step finished game in win for request user
function congratulate_win() {
    $.toast({ 
        heading: 'You Won',
        icon: 'success',
        text: 'Congratulations. You won. Good job',
        textAlign : 'center',
        textColor : '#fff',
        bgColor : '#0da114',
        hideAfter : false,
        stack : false,
        position : 'mid-center',
        allowToastClose : true,
        showHideTransition : 'fade',
        loader: false,
    });
}

// When step finished game in draw
function congratulate_draw() {
    $.toast({ 
        heading: "It's a DRAW",
        icon: 'info',
        text: "Thank you for this tough game. It was fun to watch",
        textAlign : 'center',
        textColor : '#fff',
        bgColor : '#ffba18',
        hideAfter : false,
        stack : false,
        position : 'mid-center',
        allowToastClose : true,
        showHideTransition : 'fade',
        loader: false,
    });
}

// Handle making steps
function cellHandler(cell) {
    let csrf_token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    let data = {};
    data.x = parseInt(cell.attributes["x"].nodeValue);
    data.y = parseInt(cell.attributes["y"].nodeValue);
    data["csrfmiddlewaretoken"] = csrf_token;
    const url = document.location.href;

    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        beforeSend: (xhr) => {
            xhr.setRequestHeader("X-CSRFToken", `${csrf_token}`);
        },
        success: ajax_success_handler,
        error: ajax_error_handler
    });
}

function ajax_success_handler(response) {
    if (response['just_won']) {
        document.location.hash = 'just_won'
        document.location.reload();
    } else if (response['draw']) {
        document.location.hash = 'draw'
        document.location.reload();
    } else {
        // швидкість менша при doc
        // document.location.reload()
        document.open();
        document.write(response);
        document.close();
    }
}

function ajax_error_handler(response) {
    let errors = response.responseJSON.errors;
    $.toast({ 
        heading: 'Error',
        icon: 'error',
        text: errors,
        textAlign : 'left',
        textColor : '#fff',
        bgColor : '#d90400',
        hideAfter : 2000,
        stack : 3,
        position : 'bottom-right',
        allowToastClose : true,
        showHideTransition : 'slide',
        loader: false,
    });
}


// Blink current turn user
function current_turn_blink() {
    let current_turn_class = document.getElementsByClassName("game-detail-move")[0];
    let current_opacity = 0
    setInterval(() => {
        current_opacity = Math.abs(current_opacity - 0.8)
        current_turn_class.style.opacity = current_opacity;
    }, 700);
}


// Duration functionality
function current_duration() {
    // TODO - щоб дні виводило
    let game_duration = document.getElementsByClassName("game-duration-time")[0];
    let game_time = new Date(game_duration.innerText);

    let game_ended = document.getElementsByClassName("game-detail-map-disabled");
    if (game_ended.length) {
        return;
    }

    setInterval(() => {
        let today = new Date();
        let diff = new Date(Math.abs(game_time - today));
        game_duration.innerText = datetime_with_leading_zeros(diff);
    }, 1000);
}

function datetime_with_leading_zeros(dt) {
    hours = ((dt.getHours() - 3) < 10 ? '0' : '') + (dt.getHours() - 3);
    minutes = (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes();
    seconds = (dt.getSeconds() < 10 ? '0' : '') + dt.getSeconds();
    return hours + ":" + minutes + ":" + seconds;
}


// Check to reload page
function update_page() {
    let url_obj = new URL(document.location.href);
    const url = url_obj['origin'] + url_obj['pathname'] + 'my_move/';

    // if game is ended
    let game_ended = document.getElementsByClassName("game-detail-map-disabled");
    if (game_ended.length) {
        return;
    }

    $.ajax({
        url: url,
        type: 'GET',
        success: (response => {
            is_my_turn = response['my_move'];
        }),
    });

    setInterval(() => {
        $.ajax({
            url: url,
            type: 'GET',
            success: (response) => {

                if (is_my_turn != response['my_move']) {
                    if (response['my_move'] = true) {
                        document.location.reload();
                    }
                    is_my_turn = response['my_move'];
                }
            },
        });
    }, 5000);
}


// Replay functionality
function replayGameHandler(btn) {
    data = {}
    data['game_pk'] = +btn.attributes['game_pk'].nodeValue;

    let url_obj = new URL(document.location.href);
    const url = url_obj['origin'] + url_obj['pathname']  + 'steps/';
    $.ajax({
        url: url,
        type: 'GET',
        data: data,
        success: (response) => {
            replayGame(response)
        },
        error: (response) => {
            somethingWentWrong();
        }
    });
}

// replay game
function replayGame(data) {
    let steps = data['steps'];
    clearMap(steps);
    replaySteps(steps, data['player_1_pk'], data['player_2_pk']);
}

// replay steps
function replaySteps(steps, p1, p2) {
    for(let i = 0; i < steps.length; ++i) {
        setTimeout(() => {
            let step = steps[i];
            let name = String(step['y']) + String(step['x']);
            let cell = document.getElementsByName(name)[0];
            let player = step['user'] == p1 ? 1 : 2;

            cell.className += String(player);
            if (i == steps.length - 1) {
                document.location.reload();
            }
        }, i * 600);
    }
}

// clear map before replay
function clearMap(steps) {
    for (let i = 0; i < steps.length; ++i) {
        let step = steps[i];
        let name = String(step['y']) + String(step['x']);
        let cell = document.getElementsByName(name)[0];
        cell.className = cell.className.slice(0, cell.className.length - 1);
    }
}

function somethingWentWrong() {
    $.toast({ 
        heading: 'Error',
        icon: 'error',
        text: 'Something went wrong. Please reload page and try again.',
        textAlign : 'left',
        textColor : '#fff',
        bgColor : '#d90400',
        hideAfter : 2000,
        stack : 3,
        position : 'bottom-right',
        allowToastClose : true,
        showHideTransition : 'slide',
        loader: false,
    });
}