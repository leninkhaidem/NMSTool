var ip = [],
    cli = [],
    socket,
    enFlag = false;
$(document).ready(function() {
    resizeWidth($(window), 1);
    resizeHeight("#jumbo", 0.6);
    resizeHeight(".myItem", 0.4);
    $(window).resize(function(event) {
        resizeWidth($(this), 1);
        resizeHeight("#devDetails", 0.60);
        resizeHeight("#jumbo", 0.6);
        resizeHeight(".myItem", 0.4);
    });



});

function resizeWidth(id, x) {
    $(".myItem").css({
        width: x * $(id).width(),
    });
}

function resizeHeight(id, x) {
    $(id).css({
        height: x * $(window).height(),
    })
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
        tempIp = []
        temp = arg.val().split("\n");
    for (var i = 0; i < temp.length; i++) {
        if (temp[i] != "" && temp[i] != null) {
            tempIp.push(temp[i]);
        }
    };
    if (tempIp.length == 0) {
        $(message).html("Please enter at least 1 IP / Hostname");
        $("#ipCount").removeClass('glyphicon glyphicon-ok');
        $("#ipCount").addClass('glyphicon glyphicon-remove').html(tempIp.length);
    } else {
        $(message).html("");
        $("#ipCount").removeClass('glyphicon glyphicon-remove');
        $("#ipCount").addClass('glyphicon glyphicon-ok').html(tempIp.length);
        ip = tempIp;
        $("#totalDevices").html(tempIp.length);
    }

}

function validateCli(arg) {
    var temp,
        message = $("#cli label"),
        tempCli = [];
    temp = arg.val().split("\n");
    for (var i = 0; i < temp.length; i++) {
        if (temp[i] != "" && temp[i] != null) {
            tempCli.push(temp[i]);
        }
    };
    if (tempCli.length == 0) {
        $(message).html("Please enter at least 1 CLI");
        $("#cliCount").removeClass('glyphicon glyphicon-ok');
        $("#cliCount").addClass('glyphicon glyphicon-remove').html(tempCli.length);
    } else {
        $(message).html("");
        $("#cliCount").removeClass('glyphicon glyphicon-remove');
        $("#cliCount").addClass('glyphicon glyphicon-ok').html(tempCli.length);
        cli = tempCli;
    }
}

function listIps() {
    var content = "";
    for (var i = 0; i < ip.length; i++) {
        if (i == 0) {
            content += '<div id="masterInput" class="row" ipaddr="' + ip[i] + '"><div class="col-xs-2"><b><p align="center" class="padding-top">' + ip[i] + ' :</p></b> </div><div class="col-xs-2"><div class="shadow "><input type="text" name="devUser" class="form-control" placeholder="Username"></div></div><div class="col-xs-2"><div class="shadow "><input type="password" name="devPassword"  class="form-control" placeholder="Password"></div></div><div class="col-xs-2"><div class="shadow "><input type="password" name="devEnPassword" class="form-control" placeholder="Enable Password"></div></div><div class="col-xs-4"><div class="checkbox"><p ><strong><input type="checkbox" id="applyToAll" >Apply to all devices</strong></p></div></div>';
        } else {
            content += '<div class="row padding-bottom" ipaddr="' + ip[i] + '"><div class="col-xs-2"><b><p align="center" class="padding-top">' + ip[i] + ' :</p></b> </div><div class="col-xs-2"><div class="shadow "><input type="text" name="devUser" class="form-control" placeholder="Username"></div></div><div class="col-xs-2"><div class="shadow "><input type="password" name="devPassword" class="form-control" placeholder="Password"></div></div><div class="col-xs-2"><div class="shadow "><input type="password" name="devEnPassword" class="form-control" placeholder="Enable Password"></div></div>';
        }

        content += '</div>';
    };
    $("#devDetails").html(content);
}

function getData() {
    // body...
    var flag = true;

    $("#errorMessage").html("");
    var temp = '{';
    $("#devDetails").find('[ipaddr]').each(function(index, el) {
        var count = 0;
        if (!flag) {
            return;
        }
        temp += '"' + $(this).attr('ipaddr') + '":{';
        $(this).find('[name]').each(function(index, el) {

            if ($(this).val() == "") {
                temp += '"' + $(this).attr('name') + '":"0",';
                count++;
                if (count > 2) {
                    $("#errorMessage").html("Please enter at least a username / password / enable password");
                    flag = false;
                    return
                }
            } else {
                temp += '"' + $(this).attr('name') + '":"' + $(this).val() + '",';
            }
        });
        temp = temp.replace(/,$/, "");
        temp += "},";
    });
    temp = temp.replace(/,$/, "");
    temp += "}";
    if (flag)
        return JSON.parse(temp);
    else
        return false;
}

function getSettings() {
    // body...
    var temp = {};
    temp['cli'] = $("#cli textarea").val();
    temp['enMode'] = enFlag;
    $('#settings input').each(function(index, el) {
        if ($(this).attr('type') == "radio" && $(this)[0].checked) {
            temp[$(this).attr('name')] = $(this).val();
        } else if ($(this).attr('type') != "radio") {
            if ($(this).val() == "") {
                temp[$(this).attr('name')] = 0;
            } else {
                temp[$(this).attr('name')] = $(this).val();
            }
        }
    });
    return temp;
}

function socketConnect() {
    // body...
    return io.connect('http://192.168.56.2:3000');

}

function socketDisconnect(socket) {
    // body...
    socket.emit('destroy');
}

function getT1() {
    // body...
    $.ajax({
        url: '/t1',
        type: 'GET',
        dataType: 'html'
    })
        .done(function(data) {
            $('myBody').html(data);
            $("#ips textarea").focus();
            $("#connectionInput").change(function() {
                $("#connectionOutput").html($(this).val());
            });

            $("#proxyMode").change(function() {
                if ($(this)[0].checked) {
                    $(this).val(1);
                    $("#connectionInput").val('1');
                    $("#connectionOutput").html($("#connectionInput").val());
                    $("#connectionInput").attr('max', '10');
                    $("#proxySettings input").each(function() {
                        $(this).prop('disabled', false);
                    });

                } else {
                    $(this).val(0);
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
            $("#promptTimeout").focusout(function(event) {
                if (!/^\d+$/.test($(this).val())) {
                    $(this).val(10);
                }
            });
            $("#EnPromptTimeout").focusout(function(event) {
                if (!/^\d+$/.test($(this).val())) {
                    $(this).val(10);
                }
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
                    $("#page1").hide();
                    $("#page2").fadeIn(1600);
                    resizeHeight("#devDetails", 0.60);
                    listIps();
                    $("#applyToAll").change(function(event) {
                        if ($(this)[0].checked) {
                            var flag = false;
                            var data = {};
                            $("#devDetails").find('[ipaddr]').each(function(index, el) {
                                $(this).find('[name]').each(function(index, el) {
                                    if (/devEnPassword/.test($(this).attr('name')) && $(this).val() != "") {
                                        enFlag = true;
                                    }
                                });
                                if (!flag) {
                                    $(this).find('[name]').each(function(index, el) {
                                        data[$(this).attr('name')] = $(this).val();
                                        flag = true;
                                    });
                                } else {
                                    $(this).find('[name]').each(function(index, el) {
                                        $(this).val(data[$(this).attr('name')]);
                                    });
                                }
                            });
                        }
                    });
                    $("#masterInput").find('[name]').each(function(index, el) {
                        var param = $(this).attr('name');
                        var string = "";
                        $(this).keyup(function(e) {
                            string = $(this).val();
                            $("#devDetails").find('[ipaddr]').each(function(index, el) {
                                if (index > 0 && $("#applyToAll")[0].checked) {
                                    $(this).find('[name]').each(function(index, el) {
                                        if ($(this).attr('name') == param) {
                                            $(this).val(string);
                                        }
                                    });
                                }
                            });
                        });
                    });
                    $("#clearAllButton").click(function(event) {
                        $("#devDetails").find('[ipaddr]').each(function(index, el) {
                            $(this).find('[name]').each(function(index, el) {
                                $(this).val("");
                            });
                        });
                    });
                }

            });

            $("#startButton").click(function(event) {
                /* Act on the event */
                var data = getData();
                if (!data) {
                    $("#errorMessage").show().html("Please enter at least a username / password / enable password");
                } else {
                    $("#errorMessage").html("");
                    $("#devDetails").find('[ipaddr]').each(function(index, el) {
                        $(this).find('[name]').each(function(index, el) {
                            if (/devEnPassword/.test($(this).attr('name')) && $(this).val() != "") {
                                enFlag = true;
                                return;
                            }
                        });
                    });
                    $("#page2").hide();
                    $("#page3").fadeIn(1600);
                    $("#loader").addClass('loader');
                    $("#progressBar div").css('width', '0%');
                    var totalDevices = parseInt($("#totalDevices").html());
                    var socket = socketConnect();
                    socket.on('error', function() {
                        $("#loader").removeClass('loader');
                        $("#loader").addClass('hidden');
                        $("#result").html('<h3 class="text-danger"><b>Failed to open a socket connection.</b></h3>').fadeIn(1600);
                    });
                    socket.on('connect', function() {
                        $("#result").fadeIn(1600);
                    });
                    socket.emit('run', {
                        deviceDetails: getData(),
                        settings: getSettings()
                    });
                    socket.on('message', function(data) {
                        var percentageCompleted = parseInt((data.count / totalDevices) * 100) + "%";
                        $("#completed").html(data.count);
                        $("#percentageCompleted").html(percentageCompleted);
                        $("#progressBar div").css('width', percentageCompleted);
                        if (data.count == totalDevices) {
                            $("#loader").removeClass('loader');
                            $("#loader").addClass('hidden');
                            $("#progressBar").removeClass("progress-striped active");
                            $("#progressBar div").addClass("progress-bar-success");
                            socketDisconnect(socket);
                        }
                    });
                }

            });

            $("#backButton").click(function(event) {
                $("#page2").hide();
                $("#page1").fadeIn(1600);
            });

        })
        .fail(function() {
            alert("An error while trying to execute the operation.");
        })





}
