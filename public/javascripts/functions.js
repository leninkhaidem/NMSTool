$(document).ready(function() {
    sizeup($(window));
    $("#ips textarea").focus();
    $(window).resize(function(event) {
        sizeup($(this));
    });
    $("#connectionInput").change(function() {
        $("#connectionOutput").html($(this).val());
    });

    $("#proxyMode").change(function() {
        if ($(this)[0].checked) {
            $("#connectionInput").val('1');
            $("#connectionOutput").html($("#connectionInput").val());
            $("#connectionInput").attr('max', '10');
            $("#proxySettings input").each(function() {
                $(this).prop('disabled', false);
            });

        } else {
        	validateProxy($("#ipValidate"));
            validateProxy($("#passwordValidate"));
            validateProxy($("#userValidate"));
            $("#connectionInput").attr('max', '30');
            $("#connectionInput").val('1');
            $("#connectionOutput").html($("#connectionInput").val());
            $("#proxySettings input").each(function() {
                $(this).prop('disabled', true);
            });
        }
    });
    $("#serverIP").focusout(function(event) {
        validateProxy($("#ipValidate"));
    });
    $("#serverUsername").focusout(function(event) {
        validateProxy($("#userValidate"));
    });
    $("#serverPassword").focusout(function(event) {
        validateProxy($("#passwordValidate"));
    });
    $("#ips textarea").focusout(function(event) {
        validateIP($(this));
    });
    $("#cli textarea").focusout(function(event) {
        validateCli($(this));
    });
    $("#nextButton").click(function(event) {
        validateCli($("#cli textarea"));
        if ($("#proxyMode")[0].checked) {
            validateProxy($("#ipValidate"));
            validateProxy($("#passwordValidate"));
            validateProxy($("#userValidate"));
        }
        if ($("#ipCount").html() == "0" || $("#cliCount").html() == "0" || $("#ipValidate").attr('class').match(/has-error/) || $("#userValidate").attr('class').match(/has-error/) || $("#passwordValidate").attr('class').match(/has-error/)) {
            $("#errorMessage").html("Error(s) found. Please re-check");
        } else {
            $("#errorMessage").html("");
        }
    });
});

function sizeup(arg) {
    var width = $(arg).width();
    $(".myItem").css({
        width: width,
    });
}

function validateProxy(arg) {
    var id = "#" + arg.attr('id');
    var value = $(id + " input"),
        message = $(id + " label"),
        name = value.attr('placeholder'),
        status = $(id + " span");
    if (value.val() == null || value.val() == "") {
        $(id).removeClass('has-success has-feedback');
        $(id).addClass('has-error has-feedback');
        $(message).html(name + " cannot be left black");
        status.removeClass('glyphicon glyphicon-ok form-control-feedback');
        status.addClass('glyphicon glyphicon-remove form-control-feedback');
    } else {
        $(id).removeClass('has-error has-feedback');
        $(id).addClass('has-success has-feedback');
        $(message).html("OK");
        status.removeClass('glyphicon glyphicon-remove form-control-feedback');
        status.addClass('glyphicon glyphicon-ok form-control-feedback');
    }
    if (!$("#proxyMode")[0].checked) {
        $(id).removeClass('has-error has-feedback');
        $(id).removeClass('has-success has-feedback');
        status.removeClass('glyphicon glyphicon-remove form-control-feedback');
        status.removeClass('glyphicon glyphicon-ok form-control-feedback');
        $(message).html("");
    }




}

function validateIP(arg) {
    var temp,
        message = $("#ips label"),
        ip = [];
    temp = arg.val().split("\n");
    for (var i = 0; i < temp.length; i++) {
        if (temp[i] != "" && temp[i] != null) {
            ip.push(temp[i]);
        }
    };
    if (ip.length == 0) {
        $(message).html("Please enter at least 1 IP / Hostname");
        $("#ipCount").removeClass('glyphicon glyphicon-ok');
        $("#ipCount").addClass('glyphicon glyphicon-remove').html(ip.length);
    } else {
        $(message).html("");
        $("#ipCount").removeClass('glyphicon glyphicon-remove');
        $("#ipCount").addClass('glyphicon glyphicon-ok').html(ip.length);
    }
}

function validateCli(arg) {
    var temp,
        message = $("#cli label"),
        cli = [];
    temp = arg.val().split("\n");
    for (var i = 0; i < temp.length; i++) {
        if (temp[i] != "" && temp[i] != null) {
            cli.push(temp[i]);
        }
    };
    if (cli.length == 0) {
        $(message).html("Please enter at least 1 CLI");
        $("#cliCount").removeClass('glyphicon glyphicon-ok');
        $("#cliCount").addClass('glyphicon glyphicon-remove').html(cli.length);
    } else {
        $(message).html("");
        $("#cliCount").removeClass('glyphicon glyphicon-remove');
        $("#cliCount").addClass('glyphicon glyphicon-ok').html(cli.length);
    }
}
