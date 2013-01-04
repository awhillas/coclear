<?php
	/**
	 * Handles HTTP Requests for HTML renderings of a path in the content directory.
	 * 
	 * @package WebGizmo
	 * @author Alexander R B Whillas
	 * @license http://www.gnu.org/copyleft/lesser.html LGPL
	 **/

	// Change these variables per website...

	// Name of the website.
	define('SITE_TITLE', 'CoClear Demo');	
	define('SITE_DESCRIPTION', 'Demos for CoClear reporting');
	
	// Template to use. Name of one of the folders in: /templates/html
	define('THEME_DIR', '/h5bp');
	// Google Analytics. Must be setup in template. See end of /yui/index.tpl.php
	// define('GA_ID', 'UA-XXXXXXXX-X') 

	//  - - - - - - - - - - - - leave this part alone...

	//  assumes /gizmo folder is in the same folder as this file.
	require dirname(__FILE__).'/gizmo/FS.class.php';	
	echo FS::get()->http();