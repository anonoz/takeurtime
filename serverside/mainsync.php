<?php

/*
TakeUrTime main sync script
Written during dec'12 the fire in the lab
Refactored a bit during mar'13 for my github portfolio, peace :)

The script is intended to be used with cron tab, run this script with
URL parameter "force" every few hours to truncate your database and 
stash it with latest timetable. If webspace is down, no sweat, database is
truncated but your JSON remains intact.

Of course if your server is not that stable and cannot fill up database, cron
this script 10-15 minutes after each "force" with no parameter. Then this script
will search for the intake codes that already existed in your database and 
not kacau with them. Neat right?

-Anonoz
http://www.anonoz.com
*/

//Switch on PHP error reporting
ini_set('display_errors',1);
error_reporting(E_ALL|E_STRICT);
ini_set('error_log','script_errors.log');
ini_set('log_errors','On');

//Include dependencies
include_once('simple_html_dom.php'); //DOM parser
include_once('plus/graburl.php');
include_once('plus/grabtable.php'); //Function to cURL a timetable and return array
include_once('mysql.php');

$urlOfIntakeCodeList = 'http://webspace.apiit.edu.my/intake-timetable/index.php';

//initiate database connection, requires login data in mysql.php
$dbh = new PDO('mysql:host=localhost;dbname='.$database,$username,$password);

//find the list of intake codes
$sourcecodeOfIntakeList = graburl($urlOfIntakeCodeList,false);

if (isset($_GET['force']) && $sourcecodeOfIntakeList){
	$dbh->query("DELETE FROM takeurtime WHERE 1");
}

//use regex to find out where it helds intake code list
$patternToGetIntakeJson="/\[('.*')*\]{1}/";
$regexX = preg_match($patternToGetIntakeJson,$sourcecodeOfIntakeList,$matches);
//process for json_decode
$jsonOfIntakes = str_replace('\'','"',$matches[0]);

//jsondecode
$intakeCodeList = json_decode($jsonOfIntakes);

//purify it, remove the one without value
if (strlen($intakeCodeList[count($intakeCodeList)-1])<1) {
	array_pop($intakeCodeList);
}
/*diagnose*///var_dump($intakeCodeList);

//We got intake list, but what is the week?
//we need to use parser to parse it, no regex
$parsedIntakeListPage = str_get_html($sourcecodeOfIntakeList);
$weekXML = $parsedIntakeListPage->find('select[id=week]',0)->find('option',0)->value;
/*diagnose*///echo $selectIdWeek;

//Now we got list of intake code AND week, now loop over them

foreach ($intakeCodeList as $intakeCode){
	if (isset($_GET['force']) || $dbh->query("SELECT * FROM takeurtime WHERE intake='$intakeCode'")->rowCount()<1){
		$weeklyClasses = grabTable($intakeCode,$weekXML);//grab refer dependency
		$serialized = serialize($weeklyClasses);
		$slashadded = addslashes($serialized);//slashy
		//insert into db
		$dbh->exec("INSERT INTO takeurtime(intake,timetable) VALUES('".$intakeCode."','".$slashadded."')");
	}
}

//Prepare newjson
$stmt = $dbh->query("SELECT * FROM takeurtime");
$rownum = $stmt->rowCount();

if ($rownum >= sizeof($intakeCodeList) && $rownum>0){
	/*INCL*/include_once('plus/newjson.php');
}

echo 'Took me '.$timetaken.' seconds to scrap and pack ';