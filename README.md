TakeUrTime - HTML5 APU/APIIT Timetable
======================================

You can access the app itself at http://www.anonoz.com/tut

Or you can read about the story of its existence on [my portfolio](http://www.anonoz.com/portfolio/takeurtime-apu-apiit/).

##Server side codes for App Developers

You probably don't need my HTML, CSS, and JS front-end codes at all. You just either have to use my API on anonoz.com or if you have better modification, feel free to fork the server-side code and improve on your own, but do share what you have up in the sleeves. 

You can install the PHP in your server and serve to your iOS/Android/BB/WP apps, whatever. But if you use my API, a trackback link to my [blog and portfolio site](http://www.anonoz.com) would be great.

##The API on Anonoz.com

Like how Git works, each timetable is identified not by its week or version number, but by MD5. That is how TakeUrTime API on Anonoz.com works so efficiently that it manages to save a heck lot of time and bandwidth, not to mention the cellular turbulence smartphone users experience sometimes. 

The API, I call it DX2, returns either a string *same* which indicates there is no change in timetable between client and server. Or it will return a JSON array which is structured in this manner:

* Metadata
  * MD5
  * Week
* List of building...
  * List of classrooms in TPM
  * ... in ENT3
  * ... in MINES
* List of lecturers' names
* List of modules WITHOUT lab/tutorial/lectures
* List of timetables correspond to intak codes
  * Intake Code
    * Info of the particular lecture.

I suggest you to install [JSONView for Google Chrome](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc) so that you can look at the API output in a structured way.

Now here is a [sample output](http://www.anonoz.com/tut/api.php?dx2=samplemd5goeshere) from the API. Understand it and try to make your app fits what it gives you. Remember on your app, switch on GZip/Deflate compression whenever possible to obtain the almost impossibru data transfer speed. Good luck.

##How is the front-end packaged?

To deliver the fastest app loading experience (Forget bout the PDFs, we can deal with them later), I put all the CSS and JavaScript into index.html. I know this is insane, but this is some extreme way to counter extra handshakes and latencies. 

The CSS and JS are minified before they are added into index.html. 

Cache.php is a cache manifest file with MIME type text/cache-manifest. It is THE material that enables the app available offline.
