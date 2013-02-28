<?php

function graburl($url,$parseOrNot) {
	$htmlcode = false;
	do {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch,CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$htmlcode = curl_exec($ch);
		if ($htmlcode) {
		
			if ($parseOrNot){
				$html = str_get_html($htmlcode);
			} else {
				$html = $htmlcode;
			}
		
		}
		
	} while (!$htmlcode);
	
	return $html;
}