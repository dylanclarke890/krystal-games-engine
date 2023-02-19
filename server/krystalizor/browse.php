<?php

declare(strict_types=1);
require_once("../config.php");

$dir = $_GET["dir"];
$dir = $file_root . str_replace('..', '', $dir);
if ($dir[strlen($dir) - 1] !== '/') $dir .= '/';
$type = $_GET["type"];

$find;
switch ($_GET['type']) {
  case 'images':
    $find = '*.{png,gif,jpg,jpeg}';
    break;
  case 'scripts':
    $find = '*.js';
    break;
  default:
    $find = '*.*';
    break;
}

$files = glob($dir . $find, GLOB_BRACE) ?? array();
foreach ($files as $i => $f) $files[$i] = substr($f, $file_root_len);

echo json_encode($files);
