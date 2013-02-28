<?php

//Activate PHP error reporting
ini_set('display_errors',1);
error_reporting(E_ALL|E_STRICT);
ini_set('error_log','script_errors.log');
ini_set('log_errors','On');

/**
 *This function accepts the target intake code, and the week of the timetable of request, and POST the webspace and return array of arrays of lectures in the particular week.
 *
 *@param $intakecode A string of the exact intake code you want to query about
 *@param $week The string in format "yyyy-mm-dd" where dd points to beginning Monday of that certain week you want to query about
 *@return [[date,time,room.bldg,modu,lect],...] Array of arrays of lectures/tutorials 
 */
function grabTable($intakecode,$week) {
	
	//VERSON 17 DECEMBER 2012
	//Fire in TPM, burnt servers, emergency timetabling system
	
	//Initiate cURL to POST form data
	$ch = curl_init("http://webspace.apiit.edu.my/intake-timetable/intake-result.php");
	$postfields = array(
		"week" => $week,
		"intake_Search_Week" => $intakecode,
		"selectIntakeAll" => ""
	);
	curl_setopt_array($ch,array(
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_POST => 1,
		CURLOPT_POSTFIELDS => $postfields
	));
	$domresult = curl_exec($ch);
	curl_close($ch);
	
	//TEST
	//echo $result;
	//return $result; // for diagnostic only //correct
	
	//requires Simple HTML DOM
	$parseDom = str_get_html($domresult, $lowercase=true, $forceTagsClosed=true, $target_charset = DEFAULT_TARGET_CHARSET, $stripRN=true, $defaultBRText=DEFAULT_BR_TEXT);
	
	//find the table
	$parsing = $parseDom->find('table',1);
	$lecturesinthisintake = array();
	
	$loopcount = 0; //explain later below
	foreach ($parsing->find('tr') as $tr){

		//The first row is NOT the actual timetable data
		//A loopcount blocker which is used above is simply to block
		//the header row. $loopcount will be TRUE once the first row is bypassed.

		if ($loopcount){
			
			//Create an array for a single lecture
			$aclass = array();
			
			//trim whitespace
			foreach ($tr->find('td') as $td){
				$aclass[]=trim($td->innertext,' ');
			}
			
			//aclass date,time,room.bldg,modu,lect
			$aclass[0]=strtoupper(substr($aclass[0],0,3));
			$aclass[5]=ucfirst($aclass[5]);
			
			$lecturesinthisintake[]=$aclass;
			
		}

		$loopcount=1;
		
	}
	
	return $lecturesinthisintake;
	
}

//TEST
//$something = grabTable("UCD2F1211E&E","2012-12-17.xml");
//echo json_encode($something);
