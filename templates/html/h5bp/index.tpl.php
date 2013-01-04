<!doctype html>
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="<?php echo $language ?>"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="<?php echo $language ?>"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="<?php echo $language ?>"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="<?php echo $language ?>"> <!--<![endif]-->
<head>
	<meta charset="<?php echo CHAR_ENCODING ?>">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title><?php echo $pagetitle ?>, <?php echo $title ?></title>
	<meta name="description" content="<?php echo @$description ?>">
	
	<meta http-equiv="imagetoolbar" content="false" />
	
	<!-- facebook share link, see: https://developers.facebook.com/docs/share/ -->
	<meta property="og:title" content="<?php echo $pagetitle ?>, <?php echo $title ?>" />
	<meta property="og:description" content="<?php echo $description ?>" />
	
	<meta name="viewport" content="width=device-width">

	<?php echo $head ?>

</head>
<body class="<?php echo $fs->pathCSS() ?>">
  <!--[if lt IE 7]><p class=chromeframe>Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->
	<!-- NOTE: This is intended as a base template to be built on. It has no layout or styling. -->
	<header>
		<h1><a href="<?php echo $home ?>"><?php echo $title ?></a></h1>
	</header>
	<div role="main">
		<?php echo $content ?>
	</div>
	<nav>
		<?php echo $fs->menu(1, true) ?>
		
		<?php echo $fs->getLanguageLinks() ?>
	</nav>
	<footer role="contentinfo">
		<?php echo $foot ?>
	</footer>

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script>window.jQuery || document.write('<script src="<?php echo $templates ?>/js/libs/jquery-1.7.1.min.js"><\/script>')</script>
	
	<?php if(defined('GA_ID')): ?>
		<script type="text/javascript">
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', '<?php echo GA_ID ?>']);
			_gaq.push(['_trackPageview']);
			(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		</script>
	<?php endif ?>	
</body>
</html>