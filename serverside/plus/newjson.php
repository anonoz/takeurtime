<?php

//New JSON is built with data repetition reduction in mind, instead of
//letting lecturers' name and classrooms and module name repeat over
//and over again, I simply index them, and for every intake code, they use
//the array index number to look back the name, this has resulted in at least 60% -75%
//of data saving prior to GZIP, making TakeUrTime syncing much faster and more
//reliable.

//Assumption: MySQL database is connected
//2nd sumption: You are using this with main sync script


$timetable = array();
foreach ($dbh->query("SELECT * FROM takeurtime ORDER BY intake ASC") as $intake){
	$rawtablecontent = $intake['timetable'];
	$backtoarr = unserialize(stripslashes($rawtablecontent));
	if ($rawtablecontent !== "a:0:{}") {
		$timetable[$intake['intake']] = $backtoarr;
	}
}

//INITIATE ENUMERATED STORAGE
$lecturerindex = array();
$classroomindex = array(array(/*ent3*/),array(/*tpm*/),array(/*mines*/));
	//[ent3,tpm,mines]
$courseindex = array();
//container for timetable
$newtable = array();


foreach ($timetable as $intake => $somecourses){
	
	$newtable[$intake] = array();
	
	foreach ($somecourses as $singlelect){
		
		
		
		//append lecturer
		if (!in_array(ucwords(strtolower($singlelect[5])),$lecturerindex)) {
			array_push($lecturerindex,ucwords(strtolower($singlelect[5])));
		}
		
		//ENT3
		if ($singlelect[3]=='ENT3'){
			if (!in_array($singlelect[2],$classroomindex[0])){
				array_push($classroomindex[0],$singlelect[2]);
			}
		}
		
		//TPM
		if ($singlelect[3]=='TPM'){
			if (!in_array($singlelect[2],$classroomindex[1])){
				array_push($classroomindex[1],$singlelect[2]);
			}
		}
		
		//MINES
		if ($singlelect[3]=='MINES'){
			if (!in_array($singlelect[2],$classroomindex[2])){
				array_push($classroomindex[2],$singlelect[2]);
			}
		}

		//As you see, if there is new campus, we need to modify the script a bit.
		//Probably its your job that time, for your peers and college mates.
		//Fork this and modify it
		
		//course... 
		$classexplode = explode('-',$singlelect[4]);
		$lastofexplo = end($classexplode);//maybe got group number, see har
		reset($classexplode);//reset pointer
		
		//$classgroup
		if (ctype_digit($lastofexplo)){
			$classgroup = $lastofexplo;
			array_pop($classexplode);//remove the grouping once n for all
		} else {
			$classgroup = 0; // no group
		}
		
		//$classtype
		/*
		 * LAB & T => 5... one of a kind bitch
		 * 
		 */
		if (array_search('LAB',$classexplode) && array_search('T',$classexplode)) {
			
			$classtype = 5;
			unset($classexplode[array_search('LAB',$classexplode)]);
			unset($classexplode[array_search('T',$classexplode)]);
			$classexplode = array_values($classexplode);
			
		} elseif (array_search('L',$classexplode)){
			
			$classtype = 1;
			unset($classexplode[array_search('L',$classexplode)]);
			$classexplode = array_values($classexplode);
			
		} elseif (array_search('T',$classexplode)){
			
			$classtype = 2;
			unset($classexplode[array_search('T',$classexplode)]);
			$classexplode = array_values($classexplode);
			
		} elseif (array_search('LAB',$classexplode)){
			
			$classtype = 3;
			unset($classexplode[array_search('LAB',$classexplode)]);
			$classexplode = array_values($classexplode);
			
		} elseif (array_search('P/T',$classexplode)){
			
			$classtype = 4;
			unset($classexplode[array_search('P/T',$classexplode)]);
			$classexplode = array_values($classexplode);
			
		} else {
			
			$classtype = 0;
			
		}//NO CLASS TYPE
		
		//$starttime,$endtime
		$timeexplode = explode(' - ',$singlelect[1]);
		$starttime = implode('',explode(':',$timeexplode[0]));
		$endtime = implode('',explode(':',$timeexplode[1]));
		
		//now glue back course and put into index
		$newcourse = implode('-',$classexplode);
		if (array_search($newcourse,$courseindex)===false){
			array_push($courseindex,$newcourse);
		}
		
		//now find out index of lecturer, course, classroom
		$lecturerid = array_search(ucwords(strtolower($singlelect[5])),$lecturerindex);
		$courseid = array_search($newcourse,$courseindex);
		$bldgid = array("ENT3"=>0,"TPM"=>1,"MINES"=>2);
		$classroomid = array_search($singlelect[2],$classroomindex[$bldgid[$singlelect[3]]]);
		
		//convert weekday to number
		$dayToNum = array("MON"=>1,"TUE"=>2,"WED"=>3,"THU"=>4,"FRI"=>5,"SAT"=>6,"SUN"=>7);
		
		//assemble a lecture strip
		$lecturestrip = array(
			$dayToNum[$singlelect[0]],
			(int)$starttime,
			(int)$endtime,
			$bldgid[$singlelect[3]],
			$classroomid,
			$lecturerid,
			$courseid,
			$classtype,
			(int)$classgroup
		);
		
		//push in
		array_push($newtable[$intake],$lecturestrip);
		
	}
}

$tablemd5 = md5(serialize($newtable));
$jsonmeta = array($tablemd5,substr($weekXML,0,10));

$finalshit = array($jsonmeta,$classroomindex,$lecturerindex,$courseindex,$newtable);
$jsonshit = json_encode($finalshit);

//echo $jsonshit;
if (file_put_contents('../all.json',$jsonshit)) {
	echo "TakeUrTime JSON is written";
}