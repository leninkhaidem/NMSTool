#!/usr/bin/perl
use warnings;
use strict;
use Expect;
$| = 1;
if(!-e "config.json") {
	open FILE,">config.json";
	print FILE<<EOF;
{
	"proxy_server":"Server IP",
	"proxy_uid":"Server cli user",
	"proxy_pass":"Server cli password",
	"connections": number of simulatneous connections ,
	"proxy_mode": 1 or 0,
	"device_uid":"Devices user name",
	"device_pass":"Devices primary password",
	"device_en":"Devices enable password",
	"prompt_timeout":prompt timeout,
	"enable_timeout":enable prompt timeout,
	"debug": 0 or 1;
}
EOF
die "Configure the config file config.json";
}
if(!-e "clis") {
	die "./clis not found. Please enter the device clis separated by newline in this file";
} 
use constant DEFAULT => "DEFAULT";
my @clis = `cat ./clis`;
my $deviceIP = $ARGV[0];
my $serverIP = $ARGV[1];
my $serverUID = $ARGV[2];
my $serverPass = $ARGV[3];
my $deviceUID = $ARGV[4];
my $devicePass = $ARGV[5];
my $deviceEn = $ARGV[6];
my $timeout = $ARGV[7];
my $entimeout = $ARGV[8];
my $debug = $ARGV[9];
my $proxymode = $ARGV[10];
my $enableMode = $ARGV[11];
my $log_dir = $ARGV[12];
if($enableMode != 1){
	$deviceEn = "";
}
my $output = "";
my $sessionFlag = 0;
my $session;
my $result;
my $prompt = '([a-zA-z0-9\(\)\/\\-\s~@\$]+)[#][\s]?';
my $enPrompt = '([a-zA-z0-9\(\)\/\\-\s~@\$]+)[>][\s]?';
mkdir("logs") if(! -e "logs");
$log_dir="logs/job_".$log_dir;
`mkdir $log_dir`;
#open noLoginPrompt,">>noLoginPrompt.txt";
#open authenticationFailed,">>authenticationFailed.txt";

if($proxymode) {
	$result = SSH($serverIP,$serverUID,$serverPass);
	exit if($result ne "loggedIn");
	$sessionFlag = 1;
}

chomp($deviceIP);
if($deviceIP) {
	$result = SSH($deviceIP,$deviceUID,$devicePass,$deviceEn);
}
#my $result = SSH1($ip,$deviceUID,$devicePass,$deviceEn) if(!$proxymode);
#$result = SSH2($ip,$deviceUID,$devicePass,$deviceEn) if($proxymode);

if($result eq "noLoginPrompt") {
	exit;
} elsif ($result eq "loggedIn") {
	foreach(@clis) {
		# body...
		chomp;
		config($prompt,$_,DEFAULT);
	}
	#print "$output\n";
	#$session->expect($timeout,'-re','#');
	#config('([a-zA-z0-9\(\)\/\\-~@]+)[\s]?#',"",DEFAULT);
	#if(length($output) > 0 ) {
	#	open FILE,">$ip.txt";
	#	print FILE $output;
	#}
	
}
else {
	#print authenticationFailed $ip,"\n";
}

print "Done processing $deviceIP\n";

sub config { 
	# body...
	my($prompt,$cmd,$message) = @_;
	unless($session->expect($timeout,'-re',$prompt) && (print $session "$cmd\r\r"))
	{
		if($message eq DEFAULT)
		{
			print "Expected prompt not received. Exiting\n"
		}
		else
		{
			print "$message\n"
		}
		$session->hard_close();
		return;
	}
	#my $output = "";
	if($cmd =~/^sh.*/ && $cmd !~/^shut.*/)
	{
		while($session->expect($timeout,'-re','(--)?[Mm][Oo][Rr][Ee](--)?'))
		{
			#$output = $output.$session->before();
			print $session " ";
		}
		
	}
	$session->expect($timeout,'-re',$prompt);
	#$output = $output.$session->before();
	#print "\noutput is $output\n";
	#return $output;
	return;
}

sub SSH {
	# body...
	my ($ip,$user,$password,$enpassword) = @_;
	print "Trying $ip,$user,$password\n";
	if(!$sessionFlag){
		$session = Expect->new();
		$session->log_file("$log_dir/$deviceIP");
		$session->log_stdout(0) if($debug);
		$session->spawn("ssh -oStrictHostKeyChecking=no $user\@$ip");
	}
	if($proxymode && $sessionFlag) {
		config($prompt,"ssh -oStrictHostKeyChecking=no $user\@$ip",DEFAULT) ;
	}
	if($session->expect($timeout,'-re','([Pp]assword[:])[\s]?')) {
		print $session "$password\r";
		if($session->expect($timeout,'-re','([Pp]assword[:])[\s]?|[Cc]onnection to.*closed|[Ff]ailed|[Cc]onnection.*[Rr]efused')) {
			$session->hard_close();
			return "authenticationFailed";
		} elsif($session->expect($timeout,'-re',$prompt) && print $session "\r") {
			return "loggedIn";
		}
	} elsif($session->expect($timeout,'-re',$prompt) && print $session "\r") {
		return "loggedIn";
	} else {
		#print noLoginPrompt "$ip\n";
		return "noLoginPrompt";
	}
	if($enableMode) {
		if($session->expect($entimeout,'-re',$enPrompt))
		{

			print $session "en\r";
			if($session->expect($entimeout,'-re','([Pp]assword[:])[\s]?')) {
				print $session "$enpassword\r";
				if($session->expect($timeout,'-re',$prompt) && print $session "\r") {
					return "loggedIn";
				}
			}
			if($session->expect($entimeout,'-re',$prompt) && print $session "\r") {
				return "loggedIn";
			}

		}
	}
	return "authenticationFailed";
}

sub telnet {
	# body...
	my ($ip,$user,$password,$enpassword) = @_;
	print "Trying $ip,$user,$password\n";
	if(!$sessionFlag){
		$session = Expect->new();
		$session->log_file("$log_dir/$deviceIP");
		$session->log_stdout(0) if($debug);
		$session->spawn("telnet $ip") or die "Error: failed spawn telnet connection";
	}
	if($proxymode && $sessionFlag) {
		config($prompt,"telnet $ip",DEFAULT) ;
	}
	if($session->expect($timeout,'-re','([Pp]assword[:])[\s]?')) {
		print $session "$password\r";
		if($session->expect($timeout,'-re','([Pp]assword[:])[\s]?|[Cc]onnection to.*closed|[Ff]ailed|[Cc]onnection.*[Rr]efused')) {
			$session->hard_close();
			return "authenticationFailed";
		} elsif($session->expect($timeout,'-re',$prompt) && print $session "\r") {
			return "loggedIn";
		}
	} elsif($session->expect($timeout,'-re',$prompt) && print $session "\r") {
		return "loggedIn";
	} else {
		#print noLoginPrompt "$ip\n";
		return "noLoginPrompt";
	}
	if($enableMode) {
		if($session->expect($entimeout,'-re',$enPrompt))
		{

			print $session "en\r";
			if($session->expect($entimeout,'-re','([Pp]assword[:])[\s]?')) {
				print $session "$enpassword\r";
				if($session->expect($timeout,'-re',$prompt) && print $session "\r") {
					return "loggedIn";
				}
			}
			if($session->expect($entimeout,'-re',$prompt) && print $session "\r") {
				return "loggedIn";
			}

		}
	}
	return "authenticationFailed";
}
