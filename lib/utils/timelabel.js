// 'timelabel' Stringify time lengths
// by Rory Bradford (@roryrjb)
// license: MIT

function parse(value, string, type) {

    var output, input, check;

    if (string == true) {

        check = parseInt(value);
        if (isNaN(check) == true) {
            input = 'error';
        } else {
            input = check;
        }

    } else {
        input = value;
    }

    if (typeof(input) === 'number') {

        if (input < 1250) {
            output = input + ' milliseconds';
        } else if (input < 60000) {
            output = Math.round(input / 1000) + ' seconds';
        } else if (input < 3600000) {

            var ivl = 60000; // minute

            if (type) {

                var int = Math.floor(input / ivl),
                    rem = input - (int * ivl);

                output = int + 'm ' + Math.round(rem / 1000) + 's';

            } else {

                if (Math.round(input / ivl) == 1) {
                    output = Math.round(input / ivl) + ' minute';
                } else {
                    output = Math.round(input / ivl) + ' minutes';
                }

            }

        } else if (input < 86400000) {

            var ivl = (60000 * 60); // hour

            if (type) {

                var int = Math.floor(input / ivl),
                    rem = input - (int * ivl);

                output = int + 'h ' + Math.round(rem / 60000) + 'm';

            } else {

                if (Math.round(input / ivl) == 1) {
                    output = Math.round(input / ivl) + ' hour';
                } else {
                    output = Math.round(input / ivl) + ' hours';
                }

            }

        } else {

            var ivl = 86400000; // day

            if (type) {

                var int = Math.floor(input / ivl),
                    rem = input - (int * ivl);

                output = int + 'd ' + Math.round(rem / (60000 * 60)) + 'h';

            } else {

                if (Math.round(input / ivl) == 1) {
                    output = Math.round(input / ivl) + ' day';
                } else {
                    output = Math.round(input / ivl) + ' days';
                }

            }

        }

    } else {
        output = 'error';
    }

    return output;

}

module.exports = function(ms, type) {

    var label;
    this.type = type || true;

    if (typeof(ms) === 'undefined') {

        label = 'undefined';

    } else {

        if (typeof(ms) === 'number') {
            label = parse(ms, false, type);
        } else if (typeof(ms) === 'string') {
            label = parse(ms, true, type);
        } else {
            label = 'error';
        }

    }

    return label;

}